class_name KuroBridge
extends KuroStage

signal mud_discovered

const TOP := HEIGHT * 6.05
const EXIT := -HEIGHT * 0.20
const ORIGIN := HEIGHT * 6.5 * 0.96
const LOG_X := WIDTH * 1.05
const MUD_RETURN_X := WIDTH * 1.45

const PRINTS := [
	[.50, .24], [.82, .53], [1.12, .55], [1.34, .91],
	[1.40, 1.30], [1.75, 1.40], [2.00, 1.78], [1.73, 2.26],
	[1.31, 2.27], [.87, 2.27], [.62, 2.60], [.62, 3.00],
	[1.00, 3.18], [1.44, 3.18], [1.77, 3.55], [1.77, 4.01],
	[1.34, 4.19], [.82, 4.19], [.45, 4.56], [.45, 4.94],
	[.83, 5.11], [1.27, 5.11], [1.55, 5.52], [1.55, 5.85],
	[.30, .83], [1.44, 1.76], [.42, 2.53], [1.05, 3.70],
]
const CLUES := [
	[.30, .83, "Examinar las pisadas", "Bajo las vigas hay huellas que se desvían hacia el río. Quiero mirar un poco más."],
	[1.65, 1.40, "Mirar el barro", "Ese sendero oscuro se ve blando. Quizá pueda rodearlo."],
	[.42, 2.53, "Mirar el barro", "El barro conserva marcas frescas y pequeños tallos mordidos."],
]
const LOG_POSES := [
	Vector3(.18, -.16, 0), Vector3(.175, -.14, -5), Vector3(.155, -.11, -16),
	Vector3(.12, -.055, -35), Vector3(.07, -.018, -62), Vector3(0, 0, -90),
]

var mask: Image
var log_sprite: Sprite2D
var postcard_sprite: Sprite2D
var refuge: Sprite2D
var companion: KuroCompanion
var clue_seen: Array[int] = []
var mud_time := 0.0
var mud_recover := 0.0
var mud_from := 0.0
var mud_to := 0.0
var mud_hint := 0.0
var log_wait := 0.0
var push_pose := 0.0


func enter(flags: Dictionary, spawn_x: float) -> void:
	super(flags, spawn_x)
	var water := KuroArt.texture("bridge-wetland-golden-v2.webp")
	var water_layer := Sprite2D.new()
	water_layer.centered = false
	water_layer.texture = water
	water_layer.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	water_layer.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	water_layer.region_enabled = true
	water_layer.region_rect = Rect2(Vector2.ZERO, extent * water.get_size() / 900.0)
	water_layer.scale = Vector2(900, 900) / water.get_size()
	add_child(water_layer)

	var mask_texture := KuroArt.texture("bridge-land-mask.png")
	mask = mask_texture.get_image()
	var terrain := KuroArt.sprite_texture(self, mask_texture, Rect2(Vector2.ZERO, extent))
	var material := ShaderMaterial.new()
	material.shader = preload("res://scripts/bridge_ground.gdshader")
	material.set_shader_parameter("soil", KuroArt.texture("bridge-path-sunlit-v2.webp"))
	material.set_shader_parameter("repeats", extent / 800.0)
	terrain.material = material

	plant_shore()
	for index in range(PRINTS.size()):
		var point: Array = PRINTS[index]
		var foot := "coipo-track-front-v1.svg" if index % 2 == 1 else "coipo-track-hind-v1.svg"
		var bounds := Rect2(point[0] * WIDTH - 11, floor_at(point[1] * HEIGHT) - 25, 22, 30)
		var track := KuroArt.sprite(self, foot, bounds, true)
		track.rotation_degrees = -16 if index % 2 == 1 else 15
		track.modulate.a = 0.54 if index < 24 else 0.32
	KuroArt.sprite(self, "bridge-pedro-de-valdivia-stone-v2.webp",
		Rect2(WIDTH * .35, extent.y * .945, WIDTH * .41, extent.y * .055))
	KuroArt.sprite(self, "bridge-pedro-de-valdivia-sign-v1.webp", Rect2(35, extent.y * .95 - 80, 205, 80), true)
	KuroArt.sprite(self, "bridge-sinking-mud-v1.webp", Rect2(WIDTH * 1.28, floor_at(HEIGHT * 2.08), WIDTH * 0.35, HEIGHT * 0.5))
	log_sprite = KuroArt.sprite(self, "bridge-fallen-log-v4.png", Rect2(0, 0, HEIGHT * .50, HEIGHT * .18), true)
	postcard_sprite = KuroArt.sprite(self, "bridge-islet-kuro-view-v2.webp", Rect2(LOG_X - 18, floor_at(HEIGHT * 3.79) - 26, 36, 26))
	postcard_sprite.rotation_degrees = -12
	refuge = KuroArt.sprite(self, "coipo-refuge-before-v1.png", Rect2(WIDTH * 1.42, floor_at(HEIGHT * 5.84) - 110, 220, 110), true)
	KuroArt.sprite(self, "coipo-family-v1.png", Rect2(WIDTH * 1.29, floor_at(HEIGHT * 5.64) - 75, 130, 75), true)

	companion = KuroCompanion.new()
	add_child(companion)
	companion.position = Vector2(maxf(60, spawn_x - 79), floor_at(HEIGHT * .16))
	refresh_progress()


func plant_shore() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 21
	var plants := KuroArt.texture("bridge-bank-plants-v1.webp")
	for row in range(7, mask.get_height() - 7, 8):
		for col in range(7, mask.get_width() - 7, 8):
			if rng.randf() >= 0.26 or mask.get_pixel(col, row).a < 0.5:
				continue
			if mask.get_pixel(col + 3, row).a > 0.5 and mask.get_pixel(col - 3, row).a > 0.5 and mask.get_pixel(col, row + 3).a > 0.5 and mask.get_pixel(col, row - 3).a > 0.5:
				continue
			var span := rng.randf_range(22, 49)
			var root := Vector2(col, row) * 3.0
			var plant := KuroArt.sprite_texture(self, plants, Rect2(root - Vector2(span / 2, span * 0.82), Vector2.ONE * span), true)
			plant.flip_h = rng.randf() > 0.5
			plant.rotation_degrees = rng.randf_range(-9, 9)


func floor_at(depth: float) -> float:
	return ORIGIN - depth


func in_mud(center: Vector2) -> bool:
	return center.x >= WIDTH * 1.31 and center.x <= WIDTH * 1.60 and center.y >= HEIGHT * 1.64 and center.y <= HEIGHT * 2.02


func on_path(center: Vector2) -> bool:
	var depth := center.y
	if depth <= HEIGHT * 0.10:
		return center.x >= WIDTH * .35 + 8 and center.x <= WIDTH * .76 - 8
	if depth <= HEIGHT * .57 and center.x >= WIDTH * .40 and center.x <= WIDTH * .62:
		return true
	if depth > HEIGHT * .57 and depth <= HEIGHT * .98 and center.x >= WIDTH * .38 and center.x <= WIDTH * .45:
		return true
	if progress.bridgeMudLearned and in_mud(center):
		return false
	if depth >= HEIGHT * 3.34 and depth <= HEIGHT * 3.69 and absf(center.x - LOG_X) <= 20:
		return float(progress.bridgeLogProgress) >= 1.0
	var row := floori(floor_at(depth) / 3.0)
	if row < 0 or row >= mask.get_height():
		return false
	for offset in [-7.0, 0.0, 7.0]:
		var column := floori((center.x + float(offset)) / 3.0)
		if column < 0 or column >= mask.get_width() or mask.get_pixel(column, row).a < 0.5:
			return false
	return true


func step(center: Vector2, direction: Vector2, sprint: bool, delta: float, grounded: bool) -> Vector2:
	mud_hint = maxf(0, mud_hint - delta)
	push_pose = maxf(0, push_pose - delta)
	if mud_recover > 0:
		mud_recover = maxf(0, mud_recover - delta)
		return Vector2(MUD_RETURN_X, lerpf(mud_to, mud_from, pow(mud_recover / .42, 3)))

	var speed := (KuroPlayer.RUN if sprint else KuroPlayer.WALK) * (0.18 if in_mud(center) else 1.0)
	var motion := Vector2(direction.x, direction.y * .86)
	if direction.x != 0 and direction.y != 0:
		motion = motion.normalized()
	motion *= speed * delta
	var horizontal := Vector2(center.x + motion.x, center.y)
	if on_path(horizontal):
		center = horizontal
	elif motion.x != 0.0:
		for offset in [3.0, -3.0, 6.0, -6.0, 9.0, -9.0, 12.0, -12.0]:
			var edge_depth := clampf(center.y + float(offset), EXIT, TOP)
			if on_path(Vector2(center.x, edge_depth)) and on_path(Vector2(horizontal.x, edge_depth)):
				center = Vector2(horizontal.x, edge_depth)
				break
	var vertical := Vector2(center.x, clampf(center.y + motion.y, EXIT, TOP))
	if on_path(vertical):
		center = vertical

	if grounded and not progress.bridgeMudLearned and in_mud(center):
		mud_time += delta
		if mud_time >= 1.0:
			mud_from = center.y
			mud_to = HEIGHT * (2.28 if center.y > HEIGHT * 1.84 else 1.40)
			mud_recover = .42
			mud_hint = 2.4
			mud_time = 0.0
			progress.bridgeMudLearned = true
			mud_discovered.emit()
	else:
		mud_time = 0.0
	return center


func prepare_log(delta: float) -> void:
	if float(progress.bridgeLogProgress) == 0.0:
		progress.bridgeLogProgress = .10
		log_wait = .6
		push_pose = .5
		refresh_progress()
	log_wait = maxf(0, log_wait - delta)


func push_log(amount: float) -> bool:
	if log_wait > 0.0:
		return false
	progress.bridgeLogProgress = minf(1, float(progress.bridgeLogProgress) + amount)
	push_pose = .25
	refresh_progress()
	return float(progress.bridgeLogProgress) == 1.0


func refresh_progress() -> void:
	var progress_scaled := clampf(float(progress.bridgeLogProgress), 0, 1) * (LOG_POSES.size() - 1)
	var index := mini(LOG_POSES.size() - 2, floori(progress_scaled))
	var pose: Vector3 = LOG_POSES[index].lerp(LOG_POSES[index + 1], progress_scaled - index)
	log_sprite.position = Vector2(LOG_X, floor_at(HEIGHT * 3.457) - HEIGHT * .09) + Vector2(pose.x, pose.y) * HEIGHT
	log_sprite.rotation_degrees = pose.z
	postcard_sprite.visible = not progress.bridgePostcardCollected
	if progress.valdiviaFamilyHelped:
		refuge.texture = KuroArt.texture("coipo-refuge-sheltered-v1.png")


func update_companion(player_position: Vector2, delta: float, _seat_x: float = -1.0) -> void:
	companion.visible = bool(progress.copoFollowing)
	if companion.visible:
		companion.follow(player_position, delta, func(_x: float) -> float: return player_position.y, extent.x, -1)
