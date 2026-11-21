class_name KuroPlayer
extends CharacterBody2D

const WALK := 240.0
const RUN := 370.0
const GRAVITY := 1600.0

@onready var animation: AnimatedSprite2D = $Animation

var facing := 1
var grounded := true
var jumps_used := 0
var bridge_lift := 0.0
var visual_mud_sink := 0.0
var climb_facing := "back"
var moving := false
var sprinting := false
var claw_left := 0.0
var spark_left := 0.0
var flash_left := 0.0
var seat := ""


func _ready() -> void:
	animation.sprite_frames = SpriteFrames.new()
	animation.sprite_frames.remove_animation("default")
	_add_sheet("idle", "kuro-idle-sprite-sheet.png", 4, 4.0)
	_add_sheet("run", "kuro-run-sprite-sheet.png", 4, 11.0)
	_add_sheet("jump", "kuro-jump-sprite-sheet.png", 4, 8.0, false)
	_add_sheet("interact", "kuro-interact-sprite-sheet.png", 4, 6.0)
	_add_sheet("reading", "kuro-reading-seated-sprite-sheet.png", 4, 4.0)
	_add_sheet("bench", "kuro-bench-sitting-v1.png", 1, 1.0)
	_add_sheet("push", "kuro-push-log-v2.png", 1, 1.0)
	_add_sheet("diagonal-back", "kuro-diagonal-back-walk-v1.png", 4, 6.25)
	_add_sheet("diagonal-front", "kuro-diagonal-front-walk-v1.png", 4, 6.25)
	_add_walk("back", ["kuro-back-walk-v3.png", "kuro-back-walk-v5.png", "kuro-back-walk-v4.png", "kuro-back-walk-v6.png"])
	_add_walk("front", ["kuro-front-walk-v1.png", "kuro-front-walk-v2.png", "kuro-front-walk-v1.png", "kuro-front-walk-v2.png"])


func _add_sheet(id: StringName, file: String, count: int, fps: float, loop: bool = true) -> void:
	var frames := animation.sprite_frames
	var sheet := KuroArt.texture(file)
	frames.add_animation(id)
	frames.set_animation_speed(id, fps)
	frames.set_animation_loop(id, loop)
	for index in range(count):
		frames.add_frame(id, KuroArt.frame(sheet, count, 1, index))


func _add_walk(id: StringName, files: Array[String]) -> void:
	var frames := animation.sprite_frames
	frames.add_animation(id)
	frames.set_animation_speed(id, 6.25)
	for file in files:
		frames.add_frame(id, KuroArt.texture(file))


func place_at(feet: Vector2, entry_facing: int) -> void:
	position = feet
	facing = entry_facing
	velocity = Vector2.ZERO
	grounded = true
	jumps_used = 0
	bridge_lift = 0.0
	visual_mud_sink = 0.0
	climb_facing = "back"
	claw_left = 0.0
	spark_left = 0.0
	flash_left = 0.0
	seat = ""
	moving = false
	sprinting = false


func step_horizontal(axis: float, running: bool, delta: float, world_width: float) -> void:
	moving = axis != 0.0
	sprinting = running
	if moving:
		facing = 1 if axis > 0.0 else -1
	velocity.x = axis * (RUN if running else WALK)
	velocity.y += GRAVITY * delta
	move_and_slide()
	position.x = clampf(position.x, 60.0, world_width - 60.0)
	grounded = is_on_floor()
	if grounded:
		jumps_used = 0


func step_climb(delta: float, direction: Vector2, running: bool) -> void:
	moving = direction != Vector2.ZERO
	sprinting = running
	if direction.x != 0.0:
		facing = 1 if direction.x > 0.0 else -1
		climb_facing = "side"
	if direction.y != 0.0:
		climb_facing = "back" if direction.y > 0.0 else "front"
		if direction.x != 0.0:
			climb_facing = "diagonal-" + climb_facing
	if grounded:
		return
	velocity.y += GRAVITY * delta
	bridge_lift = maxf(0.0, bridge_lift - velocity.y * delta)
	if bridge_lift <= 0.0 and velocity.y >= 0.0:
		grounded = true
		velocity.y = 0.0
		jumps_used = 0


func jump(unlocked: bool, on_bridge: bool) -> void:
	if grounded:
		velocity.y = -700.0 if on_bridge else -620.0
		jumps_used = 1
	elif unlocked and jumps_used == 1:
		velocity.y = -585.0
		jumps_used = 2
		spark_left = 0.32
	else:
		return
	grounded = false
	animation.stop()


func release_jump() -> void:
	if not grounded:
		velocity.y = maxf(velocity.y, -180.0)


func render_pose(delta: float, on_bridge: bool, interacting: bool, pushing: bool, health: int) -> void:
	var pose := "idle"
	var lift := 0.0
	if not seat.is_empty():
		pose = seat
	elif pushing:
		pose = "push"
	elif not grounded:
		pose = "jump"
		lift = -4.0
	elif on_bridge and climb_facing != "side":
		pose = climb_facing
	elif moving:
		pose = "run"
		lift = 8.0
	elif interacting:
		pose = "interact"

	if animation.animation != pose or not animation.is_playing():
		animation.play(pose)
	animation.speed_scale = 1.35 if sprinting and moving else 1.0
	if on_bridge and not moving and pose in ["front", "back", "diagonal-front", "diagonal-back"]:
		animation.pause()
		animation.set_frame_and_progress(0, 0.0)

	var art_size := animation.sprite_frames.get_frame_texture(pose, animation.frame).get_size()
	var draw_width := 76.0
	var draw_height := 101.08
	if pose in ["run", "jump"]:
		draw_height = 52.44
	elif pose == "bench":
		draw_width = 75.0
		draw_height = art_size.y * draw_width / art_size.x
	animation.centered = false
	animation.offset = -Vector2(art_size.x / 2.0, art_size.y)
	animation.scale = Vector2(draw_width, draw_height) / art_size
	animation.position = Vector2(0, -lift - bridge_lift + visual_mud_sink)
	animation.flip_h = facing < 0 and pose not in ["front", "back", "bench"]
	animation.modulate = Color.WHITE.lerp(Color("#877e75"), float(3 - health) * 0.18)
	if flash_left > 0.0:
		animation.modulate = animation.modulate.lerp(Color("#e5a092"), 0.5)

	flash_left = maxf(0.0, flash_left - delta)
	claw_left = maxf(0.0, claw_left - delta)
	spark_left = maxf(0.0, spark_left - delta)
	queue_redraw()


func _draw() -> void:
	if spark_left > 0.0:
		var spark_color := Color(1.0, 0.83, 0.38, spark_left / 0.32)
		for index in range(7):
			var angle := TAU * index / 7
			var point := Vector2(cos(angle) * 27, sin(angle) * 6 - bridge_lift)
			draw_rect(Rect2(point, Vector2(4, 4)), spark_color)
	if claw_left > 0.0:
		for index in range(3):
			draw_arc(Vector2(facing * 30.0, -35.0 - index * 5.0), 30.0 + index * 5.0,
				-1.0 if facing > 0 else 3.2, 0.0 if facing > 0 else 4.2, 8, Color("#fff1d0"), 2.0)
