class_name KuroCamera
extends Camera2D

const MAX_WIDTH := KuroStage.WIDTH
const MAX_HEIGHT := KuroStage.HEIGHT

var play_area := Vector2(MAX_WIDTH, MAX_HEIGHT)
var bridge := false


func frame_stage(extent: Vector2, follow_vertical: bool, feet: Vector2) -> void:
	play_area = extent
	bridge = follow_vertical
	follow(feet, 0, 0, true)


func follow(feet: Vector2, direction: float, delta: float, snap: bool = false) -> void:
	var pixels := get_viewport_rect().size
	if pixels.x < 2 or pixels.y < 2:
		return
	var scale_factor := maxf(pixels.x / MAX_WIDTH, pixels.y / MAX_HEIGHT)
	zoom = Vector2.ONE * scale_factor
	var half_view := pixels / (scale_factor * 2.0)
	var lead := direction * minf(half_view.x * 0.21, 90.0)
	var focus_y := feet.y - half_view.y * (0.24 if bridge else 0.52)
	if not bridge and half_view.y >= MAX_HEIGHT / 2.0 - 0.5:
		focus_y = MAX_HEIGHT / 2.0
	var target := Vector2(
		clampf(feet.x + lead, half_view.x, maxf(half_view.x, play_area.x - half_view.x)),
		clampf(focus_y, half_view.y, maxf(half_view.y, play_area.y - half_view.y))
	)
	var result := target if snap else position.lerp(target, 1.0 - exp(-7.5 * delta))
	# Re-clamp after a window resize, where the old center may be outside the new view.
	position = result.clamp(half_view, (play_area - half_view).max(half_view))
	force_update_scroll()
