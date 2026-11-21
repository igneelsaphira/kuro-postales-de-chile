class_name KuroControls
extends RefCounted

var touch_hold: Dictionary = {}
var wait_for_neutral := false


func held(action: StringName) -> bool:
	return bool(touch_hold.get(action, false)) or Input.is_action_pressed(action)


func movement(on_bridge: bool) -> Vector2:
	var direction := Vector2(
		float(held(&"move_right")) - float(held(&"move_left")),
		float(held(&"move_up")) - float(held(&"move_down")) if on_bridge else 0.0
	)
	if wait_for_neutral:
		wait_for_neutral = direction != Vector2.ZERO
		return Vector2.ZERO
	return direction


func reset() -> void:
	touch_hold.clear()
	wait_for_neutral = true
