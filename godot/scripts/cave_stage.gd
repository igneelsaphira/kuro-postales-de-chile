class_name KuroCave
extends KuroStage

signal exhausted

const DOG_START := .96 * WIDTH + 83.0
const BIRD_START := .60 * WIDTH + 75.0
const GOAT_HOME := 3.0 * WIDTH + 99.0
const LION_HOME := .775 * 6.0 * WIDTH + 68.0
const BELL_X := .944 * 6.0 * WIDTH + 15.0

var health := 3
var time := 0.0
var invulnerable_until := 0.0
var next_claw := 0.0
var pack_started := -1.0
var pack_passed := false
var goat_active := false
var goat_passed := false
var dog_recoil := 0.0
var bird_recoil := 0.0
var goat_recoil := 0.0
var dog_shoot_at := 0.0
var dog_mouth_until := 0.0
var lion_shoot_at := 1.4
var lion_warn_until := 0.0
var revealed := false
var light: ColorRect
var light_material: ShaderMaterial
var sprites: Dictionary
var frames: Dictionary
var dog_shot: KuroSootBall
var lion_shot: KuroSootBall


func enter(flags: Dictionary, spawn_x: float) -> void:
	super(flags, spawn_x)
	# Shadows in the cave use the same atlas grids as their artwork.
	_prepare_sheet("dog", "chivato-perro-sombra-4frames-v2.png", 2, 2)
	_prepare_sheet("dog-run", "chivato-perro-sombra-run-v1.png", 3, 2)
	_prepare_sheet("bird", "chivato-ave-sombra-4frames-v1.png", 2, 2)
	_prepare_sheet("bird-fly", "chivato-ave-sombra-vuelo-4frames-v3.png", 2, 2)
	_prepare_sheet("goat", "chivato-cabrito-sombra-run-v2.png", 3, 2)
	_prepare_sheet("lion", "chivato-lobo-marino-sombra-5frames-v4.png", 5, 1)
	_prepare_sheet("bird-lit", "chivato-ave-revelada-4frames-v1.png", 2, 2)

	for entity in ["dog", "bird", "goat", "lion", "bell"]:
		var actor := Sprite2D.new()
		actor.centered = false
		actor.z_index = 7
		add_child(actor)
		sprites[entity] = actor
	var floor_line := ground_y(0)
	sprites.dog.position = Vector2(DOG_START, floor_line)
	sprites.bird.position = Vector2(BIRD_START, floor_line - 63)
	sprites.goat.position = Vector2(GOAT_HOME, floor_line)
	sprites.lion.position = Vector2(LION_HOME, floor_line + 6)
	sprites.bell.position = Vector2(BELL_X, HEIGHT * 0.56)
	_pose(sprites.bell, KuroArt.texture("cascabel-hollin-pixel-v2.png"), Vector2(30, 30))
	sprites.bell.rotation_degrees = -7.0
	sprites.goat.hide()
	_draw_shadows()

	dog_shot = KuroSootBall.new()
	lion_shot = KuroSootBall.new()
	for shot in [dog_shot, lion_shot]:
		shot.z_index = 9
		shot.hide()
		add_child(shot)

	var darkness := CanvasLayer.new()
	darkness.layer = 3
	add_child(darkness)
	light = ColorRect.new()
	light.mouse_filter = Control.MOUSE_FILTER_IGNORE
	light_material = ShaderMaterial.new()
	light_material.shader = preload("res://scripts/cave_darkness.gdshader")
	light.material = light_material
	darkness.add_child(light)
	light.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	refresh_progress()


func _prepare_sheet(id: String, file: String, columns: int, rows: int) -> void:
	var sheet := KuroArt.texture(file)
	var sheet_frames: Array[Texture2D] = []
	for index in range(columns * rows):
		sheet_frames.append(KuroArt.frame(sheet, columns, rows, index))
	frames[id] = sheet_frames


func _pose(actor: Sprite2D, artwork: Texture2D, dimensions: Vector2) -> void:
	actor.texture = artwork
	actor.offset = -Vector2(artwork.get_width() / 2.0, artwork.get_height())
	actor.scale = dimensions / artwork.get_size()


func _draw_shadows() -> void:
	var dog: Sprite2D = sprites.dog
	var attacking := pack_started >= 0.0 and not pack_passed
	if attacking and time < dog_mouth_until:
		_pose(dog, frames.dog[2], Vector2(166, 131))
	elif attacking:
		_pose(dog, frames["dog-run"][floori(time / .11) % 6], Vector2(166, 131))
	else:
		_pose(dog, frames.dog[floori(time / .7) % 4], Vector2(166, 131))
	var bird_sheet: Array = frames["bird-fly"] if attacking else frames.bird
	_pose(sprites.bird, bird_sheet[floori(time / .145) % 4], Vector2(150, 100))
	_pose(sprites.goat, frames.goat[floori(time / .105) % 6], Vector2(132, 132))
	var lion_frame := 3 if lion_warn_until > 0.0 else floori(time / .48) % 3
	_pose(sprites.lion, frames.lion[lion_frame], Vector2(136, 181))


func refresh_progress() -> void:
	if not progress.caveBellCollected or revealed:
		return
	revealed = true
	health = 3
	sprites.bell.hide()
	light.hide()
	dog_shot.hide()
	lion_shot.hide()
	sprites.dog.position = Vector2(DOG_START, ground_y(0))
	sprites.bird.position = Vector2(BIRD_START, ground_y(0) - 63.0)
	sprites.goat.position = Vector2(GOAT_HOME, ground_y(0))
	sprites.goat.show()
	_pose(sprites.bird, frames["bird-lit"][0], Vector2(124, 82))
	_pose(sprites.dog, KuroArt.texture("chivato-perro-revelado-acostado-v1.png"), Vector2(190, 112))
	_pose(sprites.goat, KuroArt.texture("cabrito-temeroso-roca-mira-derecha-v2.png"), Vector2(198, 132))
	_pose(sprites.lion, KuroArt.texture("lobo-marino-temeroso-roca-v1.png"), Vector2(175, 150))
	for key in ["lion", "goat", "bird", "dog"]:
		sprites[key].show()
		sprites[key].flip_h = false
		sprites[key].modulate = Color.WHITE


func update_light(camera: Camera2D, player: KuroPlayer) -> void:
	if revealed:
		return
	var view_size := get_viewport_rect().size
	if view_size.x < 2 or view_size.y < 2:
		return
	var feet := get_viewport().get_canvas_transform() * player.position
	var glow := Vector2(feet.x / view_size.x, clampf(feet.y / view_size.y - .17, .18, .76))
	light_material.set_shader_parameter("light_uv", glow)
	light_material.set_shader_parameter("viewport_size", view_size)
	light_material.set_shader_parameter("camera_zoom", camera.zoom.x)


func swipe(player: KuroPlayer) -> void:
	if revealed or time < next_claw:
		return
	player.claw_left = .26
	next_claw = time + .43


func _swipe_reaches(player: KuroPlayer, x: float, low: float, high: float, reach: float = 126.0) -> bool:
	var front := (x - player.position.x) * player.facing
	return player.claw_left > 0.0 and front >= -12.0 and front <= reach and low <= player.position.y and player.position.y <= high


func _hit(player: KuroPlayer) -> void:
	if time < invulnerable_until or health <= 0:
		return
	invulnerable_until = time + .85
	health -= 1
	player.flash_left = .32
	if health == 0:
		exhausted.emit()


func update_hazards(player: KuroPlayer, delta: float) -> void:
	time += delta
	var feet := player.position
	var old_x := feet.x - 50.0
	if revealed:
		_pose(sprites.bird, frames["bird-lit"][floori(time / .9) % 4], Vector2(124, 82))
		var goat_file := "cabrito-temeroso-roca-mira-izquierda-v2.png" if feet.x < GOAT_HOME else "cabrito-temeroso-roca-mira-derecha-v2.png"
		var lion_file := "lobo-marino-temeroso-roca-mira-izquierda-v1.png" if feet.x < LION_HOME else "lobo-marino-temeroso-roca-v1.png"
		_set_art(sprites.goat, goat_file, Vector2(198, 132))
		_set_art(sprites.lion, lion_file, Vector2(175, 150))
		return
	if pack_started < 0.0 and old_x >= .72 * WIDTH and old_x < 2.15 * WIDTH:
		pack_started = time
		dog_shoot_at = time + 1.3
	if pack_started >= 0.0 and not pack_passed:
		_update_pack(player, delta)
	if not goat_active and not goat_passed and old_x >= 2.62 * WIDTH and old_x < 3.75 * WIDTH:
		goat_active = true
		sprites.goat.position.x = feet.x - WIDTH * .34
		sprites.goat.show()
	if goat_active:
		_update_goat(player, delta)
	_update_lion(player, delta)
	_draw_shadows()


func _set_art(actor: Sprite2D, file: String, dimensions: Vector2) -> void:
	var path := KuroArt.DIRECTORY + file
	if actor.texture.resource_path != path:
		_pose(actor, KuroArt.texture(file), dimensions)


func _update_pack(player: KuroPlayer, delta: float) -> void:
	var feet := player.position
	if feet.x - 50.0 >= 2.15 * WIDTH:
		pack_passed = true
		sprites.dog.hide()
		sprites.bird.hide()
		dog_shot.hide()
		return
	var floor_line := ground_y(feet.x)
	var dog: Sprite2D = sprites.dog
	var bird: Sprite2D = sprites.bird
	if time < dog_recoil:
		dog.position.x -= 110.0 * delta
	elif time >= dog_mouth_until:
		var dog_target := feet.x - 15.0
		dog.position.x = move_toward(dog.position.x, dog_target, (270.0 if dog_target > dog.position.x else 205.0) * delta)
	dog.flip_h = feet.x < dog.position.x
	var distance_to_dog := absf(feet.x - dog.position.x)
	if not dog_shot.visible and time >= dog_shoot_at and time >= dog_recoil and distance_to_dog >= 135.0 and distance_to_dog <= 560.0:
		dog_shoot_at = time + 2.35
		dog_mouth_until = time + .27
		var face := 1.0 if feet.x > dog.position.x else -1.0
		dog_shot.throw_from(dog.position + Vector2(face * 46.0, -75.0), face, true)

	var flight := fposmod(time - pack_started, 2.3) / 2.3
	var dive := 0.0 if flight < .48 else sin(PI * (flight - .48) / .52)
	var bird_target := feet.x - 255.0 + dive * 45.0
	if time < bird_recoil:
		bird.position.x -= 105.0 * delta
	else:
		bird.position.x = move_toward(bird.position.x, bird_target, (292.0 if bird_target > bird.position.x else 235.0) * delta)
	bird.position.y = floor_line - lerpf(63.0, 142.0 - dive * 94 + sin(time / .19) * 5.0,
		1.0 - pow(1.0 - minf(1.0, (time - pack_started) / .42), 3.0))
	bird.flip_h = feet.x < bird.position.x

	if time >= dog_recoil:
		if _swipe_reaches(player, dog.position.x, floor_line - 58, floor_line + 2):
			dog.position.x -= 68
			dog_recoil = time + 5
			dog_mouth_until = 0
		elif distance_to_dog < 76.0 and feet.y > floor_line - 52:
			dog_recoil = time + .46
			_hit(player)
	if time >= bird_recoil:
		var bird_height := feet.y - (bird.position.y - 50.0)
		if _swipe_reaches(player, bird.position.x, bird.position.y - 32, bird.position.y + 92, 132):
			bird.position.x -= 72
			bird_recoil = time + 5
		elif absf(feet.x - bird.position.x) < 70.0 and bird_height >= 24 and bird_height <= 112:
			bird_recoil = time + .52
			_hit(player)
	var hit := dog_shot.step(delta, player, dog.position.x, floor_line + 6, extent.x)
	if hit == 1:
		_hit(player)
	elif hit == 2:
		dog_recoil = maxf(dog_recoil, time + .52)


func _update_goat(player: KuroPlayer, delta: float) -> void:
	var feet := player.position
	var goat: Sprite2D = sprites.goat
	if feet.x - 50.0 >= 3.75 * WIDTH:
		goat_active = false
		goat_passed = true
		goat.hide()
		return
	if time < goat_recoil:
		goat.position.x -= 92.0 * delta
		return
	goat.position.x = move_toward(goat.position.x, feet.x - 30, (302.0 if feet.x > goat.position.x else 220.0) * delta)
	goat.flip_h = feet.x < goat.position.x
	var floor_line := ground_y(feet.x)
	if _swipe_reaches(player, goat.position.x, floor_line - 58, floor_line + 2, 124):
		goat.position.x -= 64
		goat_recoil = time + 5
	elif absf(feet.x - goat.position.x) < 58.0 and feet.y > floor_line - 54:
		goat.position.x -= 145
		goat_recoil = time + .85
		_hit(player)


func _update_lion(player: KuroPlayer, delta: float) -> void:
	var lion: Sprite2D = sprites.lion
	var face := -1.0 if player.position.x < LION_HOME else 1.0
	lion.flip_h = face < 0.0
	if lion_warn_until > 0.0:
		lion.modulate = Color("#ceaaa2")
		if time >= lion_warn_until:
			lion_shot.throw_from(lion.position + Vector2(face * 44.0, -86.0), face, false)
			lion_warn_until = 0.0
			lion_shoot_at = time + 2.46
	else:
		lion.modulate = Color.WHITE
		if not lion_shot.visible and time >= lion_shoot_at and absf(player.position.x - LION_HOME) <= WIDTH * .82:
			lion_warn_until = time + .76
	var hit := lion_shot.step(delta, player, LION_HOME, ground_y(0) + 6, extent.x)
	if hit == 1:
		_hit(player)
	elif hit == 2:
		lion_shoot_at = maxf(lion_shoot_at, time + .38)
