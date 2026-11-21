class_name KuroGame
extends Control

const W := KuroStage.WIDTH
const H := KuroStage.HEIGHT

@onready var frame: VBoxContainer = $SafeArea/Frame
@onready var hud: KuroHud = $SafeArea/Frame/HUD
@onready var field: Control = $SafeArea/Frame/Field
@onready var viewport: SubViewport = $SafeArea/Frame/Field/Surface/World
@onready var stages: Node2D = $SafeArea/Frame/Field/Surface/World/Stages
@onready var player: KuroPlayer = $SafeArea/Frame/Field/Surface/World/Kuro
@onready var camera: KuroCamera = $SafeArea/Frame/Field/Surface/World/Camera
@onready var prompt_area: CenterContainer = $SafeArea/Frame/Field/Prompt
@onready var touch: KuroTouchPad = $SafeArea/Frame/Touch
@onready var overlay: KuroOverlay = $SafeArea/Frame/Field/Overlay
@onready var guide: KuroOverlay = $SafeArea/Frame/Field/Guide
@onready var train: KuroTrain = $SafeArea/Frame/Field/Train
@onready var fade: ColorRect = $SafeArea/Frame/Field/Fade
@onready var sound: AudioStreamPlayer = $Sound

var saves := KuroSaves.new()
var controls := KuroControls.new()
var story: KuroStory
var notebook: KuroNotebook
var active_save: Dictionary
var progress := KuroSaves.clean_progress({})
var place := ""
var stage: KuroStage
var in_game := false
var transitioning := false
var fleeing := false
var scare_timer := 0.0
var depth := 0.0
var seat_x := -1.0
var prompt: Button
var force_touch := false
var cached_place := ""
var cached_city := ""
var cached_health := -1
var cue_cache: Dictionary
var travel_destination := ""


func _ready() -> void:
	story = KuroStory.new(self)
	notebook = KuroNotebook.new(self, overlay)
	prompt = KuroStyle.button("")
	prompt.mouse_filter = Control.MOUSE_FILTER_PASS
	prompt.focus_mode = Control.FOCUS_NONE
	prompt.custom_minimum_size.y = 34
	prompt.pressed.connect(_action.bind(&"interact"))
	prompt_area.add_child(prompt)
	hud.guide_requested.connect(toggle_guide)
	hud.pause_requested.connect(toggle_pause)
	touch.action_changed.connect(_touch_action)
	train.arrived.connect(_train_arrived)
	viewport.size_changed.connect(_refocus)
	resized.connect(_update_safe_area)
	get_window().size_changed.connect(_update_layout_profile)
	get_window().close_requested.connect(_close_requested)
	get_window().focus_exited.connect(_release_controls)
	get_tree().auto_accept_quit = false
	_update_layout_profile()
	_update_safe_area()
	show_title()


func _update_safe_area() -> void:
	if not OS.has_feature("mobile") or not is_node_ready():
		return
	var window_size := Vector2(get_window().size)
	if window_size.x <= 0.0 or window_size.y <= 0.0:
		return
	var safe := Rect2(DisplayServer.get_display_safe_area())
	var inset := size / window_size
	var safe_area: MarginContainer = $SafeArea
	safe_area.add_theme_constant_override("margin_left", roundi(maxf(0, safe.position.x) * inset.x))
	safe_area.add_theme_constant_override("margin_top", roundi(maxf(0, safe.position.y) * inset.y))
	safe_area.add_theme_constant_override("margin_right", roundi(maxf(0, window_size.x - safe.end.x) * inset.x))
	safe_area.add_theme_constant_override("margin_bottom", roundi(maxf(0, window_size.y - safe.end.y) * inset.y))


func _has_touch() -> bool:
	return force_touch or OS.has_feature("mobile") or DisplayServer.is_touchscreen_available()


func _update_layout_profile() -> void:
	var window := get_window()
	var base := Vector2i(390, 600)
	if _has_touch():
		base = Vector2i(360, 390 if window.size.x > window.size.y else 600)
	if window.content_scale_size != base:
		window.content_scale_size = base


func show_title() -> void:
	in_game = false
	active_save.clear()
	progress = KuroSaves.clean_progress({})
	hud.hide()
	touch.hide()
	guide.close_screen()
	player.facing = 1
	_set_stage("street", "default")
	notebook.open_title()


func start_new_game(name: String) -> void:
	var saved := {
		"slot": saves.free_slot(),
		"name": name.strip_edges().left(40),
		"savedAt": _now_ms(),
		"checkpoint": {"place": "street"},
		"progress": {},
	}
	if not saves.save(saved):
		overlay.show_error("No se pudo crear la partida.")
		return
	resume_from(saved)


func resume_from(saved: Dictionary) -> void:
	active_save = saved.duplicate(true)
	progress = KuroSaves.clean_progress(saved.progress)
	in_game = true
	hud.show()
	overlay.close_screen()
	guide.close_screen()
	player.facing = 1
	_set_stage(saved.checkpoint.place, "default", saved.checkpoint)
	_update_touch()


func _now_ms() -> int:
	return int(Time.get_unix_time_from_system() * 1000.0)


func save_checkpoint(report_failure: bool = false) -> bool:
	if active_save.is_empty():
		return false
	var saved := active_save.duplicate(true)
	saved.savedAt = _now_ms()
	var checkpoint_depth := depth
	var checkpoint_x := player.position.x
	if stage is KuroBridge and stage.mud_recover > 0.0:
		checkpoint_depth = stage.mud_to
		checkpoint_x = KuroBridge.MUD_RETURN_X
	saved.checkpoint = {"place": place, "horizontal": checkpoint_x / W,
		"depth": checkpoint_depth / H, "facing": player.facing}
	saved.progress = progress.duplicate(true)
	if not saves.save(saved):
		if report_failure:
			push_warning("No se pudo guardar el progreso de Kuro.")
		return false
	active_save = saved
	return true


func mark(flag: String, value: Variant = true) -> void:
	progress[flag] = value
	stage.refresh_progress()
	save_checkpoint(true)


func _set_stage(next_place: String, entry: String, checkpoint: Dictionary = {}) -> void:
	if is_instance_valid(stage):
		stages.remove_child(stage)
		stage.queue_free()
	var scene := KuroRoute.stage_scene(next_place)
	stage = scene.instantiate() as KuroStage
	stages.add_child(stage)
	place = next_place
	fleeing = false
	scare_timer = 0.0
	seat_x = -1.0

	var start := KuroRoute.entry_x(place, entry)
	var center_x := clampf(float(checkpoint.get("horizontal", start / W)) * W, 60, stage.extent.x - 60)
	var start_depth := KuroRoute.entry_depth(entry) / H
	depth = clampf(float(checkpoint.get("depth", start_depth)) * H, KuroBridge.EXIT, KuroBridge.TOP) if stage is KuroBridge else 0.0
	stage.enter(progress, center_x)
	var floor_line := stage.ground_y(center_x)
	if stage is KuroBridge:
		var bridge_stage := stage as KuroBridge
		if not bridge_stage.on_path(Vector2(center_x, depth)):
			center_x = start
			depth = KuroRoute.entry_depth(entry)
		floor_line = bridge_stage.floor_at(depth)
		bridge_stage.mud_discovered.connect(_mud_discovered)
	if stage is KuroCave:
		stage.exhausted.connect(_scare.bind(true))
	var entry_facing: int = checkpoint.get("facing", player.facing)
	player.place_at(Vector2(center_x, floor_line - 0.05), entry_facing)
	if entry == "from_island":
		player.climb_facing = "front"
	player.render_pose(0, stage is KuroBridge, false, false, _health())
	_refocus()
	_update_hud()
	_update_touch()


func change_place(next_place: String, entry: String = "default", save_arrival: bool = false) -> void:
	if transitioning:
		return
	var returning: bool = place == "valparaiso" and next_place in ["station", "street"] and progress.tizneResponse != "" and not progress.returnedFromValparaiso
	if returning:
		progress.returnedFromValparaiso = true
	transitioning = true
	overlay.close_screen()
	prompt_area.hide()
	_release_controls()
	var out := create_tween()
	out.tween_property(fade, "color:a", 1.0, .16)
	await out.finished
	_set_stage(next_place, entry)
	if returning or save_arrival:
		save_checkpoint(true)
	var arrival := create_tween()
	arrival.tween_property(fade, "color:a", 0.0, .18)
	await arrival.finished
	transitioning = false


func travel(destination: String) -> void:
	if transitioning or not in_game:
		return
	if (place == "station" and destination == "valparaiso") or (place == "valparaiso" and destination == "santiago"):
		transitioning = true
		travel_destination = destination
		overlay.close_screen()
		_release_controls()
		train.depart(destination == "santiago")
		_update_hud()
	elif destination == "santiago":
		if place == "valdivia":
			change_place("station", "from_route")
		else:
			change_place("street", "from_house")
	else:
		change_place(destination, "from_map")


func _train_arrived() -> void:
	transitioning = false
	if travel_destination == "santiago":
		change_place("station", "from_route")
	else:
		change_place("valparaiso", "from_map")
	travel_destination = ""


func _refocus() -> void:
	if not is_instance_valid(stage):
		return
	camera.frame_stage(stage.extent, stage is KuroBridge, _camera_feet())
	if stage is KuroCave:
		stage.update_light(camera, player)


func _camera_feet() -> Vector2:
	if stage is KuroBridge:
		return Vector2(player.position.x, stage.floor_at(depth))
	return Vector2(player.position.x, stage.ground_y(player.position.x))


func _health() -> int:
	return stage.health if stage is KuroCave else 3


func _update_hud() -> void:
	hud.set_actions_enabled(not transitioning and not fleeing)
	var city := KuroRoute.city(place)
	var name := KuroRoute.label(place, player.position.x / W)
	if train.visible:
		city = "En viaje"
		name = "Tren a Santiago" if train.returning else "Tren a Valparaíso"
	if cached_place != name or cached_city != city:
		hud.set_location(city, name)
		cached_city = city
		cached_place = name
	var health := _health()
	if cached_health != health:
		hud.set_health(health)
		cached_health = health


func _update_touch() -> void:
	var tactile := in_game and not train.visible and _has_touch()
	if touch.visible != tactile:
		touch.visible = tactile
		_update_layout_profile()
	touch.set_context(stage is KuroBridge, stage is KuroCave and not progress.caveBellCollected,
		not transitioning and not guide.visible and overlay.screen.is_empty())


func _update_prompt(action_id: String) -> void:
	var hint := ""
	if stage is KuroBridge and stage.mud_hint > 0:
		hint = "¡Barro blando! Mejor rodearlo."
	elif not action_id.is_empty():
		hint = story.label(action_id)
		if action_id != "log" and not touch.visible:
			hint = "E   " + hint
	prompt.text = hint
	prompt_area.visible = not hint.is_empty()


func speak(lines: Array, callback: Callable = Callable()) -> void:
	_release_controls()
	overlay.start_dialogue(lines, callback)


func toggle_guide() -> void:
	if guide.visible:
		guide.close_screen()
	elif in_game and not transitioning and overlay.screen in ["", "dialogue", "choices", "album", "photo", "map"]:
		_release_controls()
		notebook.open_guide(guide)


func toggle_pause() -> void:
	_action(&"pause")


func _close_requested() -> void:
	if in_game:
		if not transitioning:
			guide.close_screen()
			notebook.open_exit()
	else:
		get_tree().quit()


func _release_controls() -> void:
	touch.release_all()
	controls.reset()


func sit(pose: String, center: float) -> void:
	player.seat = pose
	seat_x = center
	player.position = Vector2(center, H * (.73 if pose == "reading" else .82) - (9 if pose == "bench" else 0))
	_release_controls()


func stand_up(direction: float = 0.0) -> void:
	var center := W * .395 + 50
	if player.seat == "bench":
		var offset := direction if direction != 0 else (1.0 if seat_x > W * 3 else -1.0)
		center = seat_x + 100 * offset
	player.place_at(Vector2(center, stage.ground_y(center) - .05), player.facing)
	seat_x = -1.0


func _touch_action(action_id: StringName, down: bool) -> void:
	if down:
		controls.touch_hold[action_id] = true
		_action(action_id)
	else:
		controls.touch_hold.erase(action_id)
		if action_id == &"jump" and not controls.held(&"jump"):
			player.release_jump()


func _input(event: InputEvent) -> void:
	if not is_node_ready() or not event is InputEventKey:
		return
	if notebook.file_picker != null and notebook.file_picker.visible:
		return
	if event.is_action_released(&"jump") and not controls.held(&"jump"):
		player.release_jump()
	if overlay.screen == "choices" and not guide.visible and event.pressed and not event.echo:
		var number: int = event.physical_keycode if event.physical_keycode > 0 else event.keycode
		if number >= KEY_1 and number <= KEY_3:
			overlay.buttons[number - KEY_1].pressed.emit()
			get_viewport().set_input_as_handled()
			return
	for action_id in [&"guide", &"pause", &"interact", &"jump", &"claw", &"move_left", &"move_right", &"move_up", &"move_down"]:
		if event.is_action_pressed(action_id, false):
			if _action(action_id):
				get_viewport().set_input_as_handled()
			return


func _action(action_id: StringName) -> bool:
	if action_id == &"guide" and in_game:
		toggle_guide()
		return true
	if guide.visible:
		return guide.handle_action(action_id)
	if not overlay.screen.is_empty():
		return overlay.handle_action(action_id)
	if not in_game or transitioning or fleeing:
		return false
	if player.seat != "" and (action_id in [&"pause", &"interact"] or (player.seat == "bench" and action_id in [&"move_left", &"move_right"])):
		var direction := -1.0 if action_id == &"move_left" else (1.0 if action_id == &"move_right" else 0.0)
		stand_up(direction)
		return true
	match action_id:
		&"pause":
			_release_controls()
			notebook.open_pause()
		&"interact":
			story.perform(story.current_action())
		&"jump":
			if player.seat == "":
				var second: bool = not player.grounded and player.jumps_used == 1 and progress.caveBellCollected
				player.jump(progress.caveBellCollected, stage is KuroBridge)
				if second:
					play_cue("spark")
		&"claw":
			if stage is KuroCave:
				stage.swipe(player)
		_:
			return false
	return true


func _physics_process(delta: float) -> void:
	if not in_game:
		return
	_update_touch()
	if fleeing:
		_flee_cave(delta)
	var blocked := transitioning or fleeing or overlay.visible or guide.visible
	var on_bridge := stage is KuroBridge
	var direction := Vector2.ZERO
	if not blocked:
		if player.seat == "":
			direction = controls.movement(on_bridge)
			var running := controls.held(&"sprint")
			if on_bridge:
				_step_bridge(direction, running, delta)
			else:
				player.step_horizontal(direction.x, running, delta, stage.extent.x)
			_check_scene_edges(direction.x)
			if stage is KuroCave and not transitioning and not fleeing:
				stage.update_hazards(player, delta)
		if not transitioning and not overlay.visible:
			stage.update_companion(player.position, delta, seat_x if player.seat == "bench" else -1.0)
	elif not fleeing:
		player.moving = false
		player.sprinting = false
	var action_id := "" if blocked or transitioning or fleeing else story.current_action()
	if action_id == "log":
		stage.prepare_log(delta)
		if controls.held(&"interact"):
			push_log(delta / 3.4)

	prompt_area.visible = false
	if not blocked and not transitioning and not fleeing:
		_update_prompt(action_id)
	player.render_pose(delta, on_bridge, action_id != "" and action_id != "leave_seat",
		on_bridge and stage.push_pose > 0.0, _health())
	camera.follow(_camera_feet(), direction.x, delta)
	if stage is KuroCave:
		stage.update_light(camera, player)
	_update_hud()


func _step_bridge(direction: Vector2, running: bool, delta: float) -> void:
	var bridge_stage := stage as KuroBridge
	player.step_climb(delta, direction, running)
	var next := bridge_stage.step(Vector2(player.position.x, depth), direction, running, delta, player.grounded)
	depth = next.y
	player.position = Vector2(next.x, bridge_stage.floor_at(depth) + 9.0)
	player.visual_mud_sink = bridge_stage.mud_time * 20.0


func push_log(amount: float) -> void:
	var old_step := floori(float(progress.bridgeLogProgress) * 5)
	if stage.push_log(amount):
		save_checkpoint(true)
	if old_step != floori(float(progress.bridgeLogProgress) * 5):
		play_cue("log")


func _mud_discovered() -> void:
	_release_controls()
	play_cue("mud")
	save_checkpoint(true)


func _check_scene_edges(direction: float) -> void:
	var x := player.position.x
	if direction > 0 and x >= stage.extent.x - 60:
		match place:
			"street", "quinta": change_place("station")
			"plaza": change_place("street", "from_plaza")
			"valparaiso": change_place("cave")
	if place == "station" and direction < 0 and x <= 60.5:
		change_place("street", "from_station")
	elif place == "bridge" and depth <= KuroBridge.EXIT:
		change_place("valdivia", "at_passage")
	elif place == "cave" and direction < 0 and x <= 62.0:
		if progress.caveBellCollected:
			change_place("valparaiso", "from_cave")
		else:
			_scare(false)


func _scare(defeated: bool) -> void:
	if fleeing:
		return
	if defeated:
		player.place_at(Vector2(235, stage.ground_y(235)), -1)
		_refocus()
	scare_timer = .76
	fleeing = true
	speak([["Kuro", "¡Ay, no! ¡Qué miedooo!"]])


func _flee_cave(delta: float) -> void:
	if scare_timer > 0.0:
		scare_timer -= delta
		if scare_timer <= 0.0:
			overlay.close_screen()
		return
	if transitioning:
		return
	player.moving = true
	player.sprinting = true
	player.facing = -1
	player.position.x = maxf(60, player.position.x - 520.0 * delta)
	if player.position.x <= 62.0:
		change_place("valparaiso", "from_cave")


func play_cue(cue: String) -> void:
	if not cue_cache.has(cue):
		cue_cache[cue] = _make_cue(cue)
	sound.stream = cue_cache[cue]
	sound.play()


func _make_cue(cue: String) -> AudioStreamWAV:
	const RATE := 22050
	var bell := cue == "bell" or cue == "spark"
	var duration := .58 if cue == "bell" else (.22 if cue == "spark" else .18)
	var data := PackedByteArray()
	var samples := int(RATE * duration)
	data.resize(samples * 2)
	var random := RandomNumberGenerator.new()
	random.seed = 7
	for index in range(samples):
		var t := float(index) / RATE
		var fraction := t / duration
		var envelope := pow(1.0 - fraction, 2) * minf(1.0, t / .005)
		var carrier: float
		if bell:
			var pitch := 1080.0 if cue == "bell" else 1530.0
			carrier = cos(pitch * TAU * t) * .65 + cos(pitch * 1.49 * TAU * t) * .35
		else:
			var pitch := 72.0 if cue == "log" else 135.0
			carrier = cos(pitch * TAU * t * (1.0 - fraction * .33)) * .55 + random.randf_range(-.35, .35)
		data.encode_s16(index * 2, roundi(carrier * envelope * 8000.0))
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = RATE
	stream.data = data
	return stream
