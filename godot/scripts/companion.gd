class_name KuroCompanion
extends Sprite2D

const WIDTH := 72.0
const HEIGHT := 86.0

var idle: Texture2D
var follow_idle: Texture2D
var walk_frames: Array[Texture2D]
var chase := false
var time := 0.0
var seat_side := 0.0
var follow_side := -1.0


func _ready() -> void:
	idle = KuroArt.texture("copo-idle-v2.png")
	follow_idle = KuroArt.texture("copo-follow-idle-v1.png")
	var sheet := KuroArt.texture("copo-walk-v2.png")
	for index in range(4):
		walk_frames.append(KuroArt.frame(sheet, 4, 1, index))
	centered = false
	z_index = 8
	_draw_pose(idle)


func follow(feet: Vector2, delta: float, floor_y: Callable, world_width: float, bench: float) -> void:
	var gap := feet.x - position.x
	var target := position.x
	if bench >= 0.0:
		if seat_side == 0.0:
			seat_side = -1.0 if gap > 0.0 else 1.0
		target = bench + seat_side * 120.0
		chase = false
	else:
		seat_side = 0.0
		if absf(gap) > 8.0:
			follow_side = -signf(gap)
		if absf(gap) > 145.0:
			chase = true
		elif absf(gap) <= 92.0:
			chase = false
		if chase or absf(gap) < 76.0:
			target = feet.x + follow_side * 92.0
			if target < 60.0 or target > world_width - 60.0:
				target = feet.x - follow_side * 92.0

	var next_x := move_toward(position.x, clampf(target, 60, world_width - 60), 430.0 * delta)
	var step := next_x - position.x
	position.x = next_x
	position.y = float(floor_y.call(position.x))
	if absf(step) > 0.4:
		flip_h = step < 0.0
		time += delta
		_draw_pose(walk_frames[floori(time / 0.17) % 4])
	else:
		_draw_pose(follow_idle)


func _draw_pose(artwork: Texture2D) -> void:
	texture = artwork
	scale = Vector2.ONE * minf(WIDTH / artwork.get_width(), HEIGHT / artwork.get_height())
	offset = -Vector2(artwork.get_width() * 0.5, artwork.get_height())
