class_name KuroTouchPad
extends Control

signal action_changed(action: StringName, held: bool)

const ACTIONS := {
	&"move_left": "←", &"move_right": "→", &"move_up": "↑", &"move_down": "↓",
	&"sprint": "Correr", &"jump": "Saltar", &"interact": "Acción", &"claw": "Zarpazo",
}

var widgets: Dictionary = {}
var pointers: Dictionary = {}
var bridge := false
var claw_enabled := false
var can_move := true


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	for action in ACTIONS:
		var view := KuroStyle.button(ACTIONS[action])
		view.focus_mode = Control.FOCUS_NONE
		view.mouse_filter = Control.MOUSE_FILTER_IGNORE
		view.toggle_mode = true
		view.add_theme_font_size_override("font_size", 14)
		add_child(view)
		widgets[action] = view
	resized.connect(_layout)
	hide()


func set_context(on_bridge: bool, claw: bool, movement_enabled: bool) -> void:
	if bridge == on_bridge and claw_enabled == claw and can_move == movement_enabled:
		return
	bridge = on_bridge
	claw_enabled = claw
	can_move = movement_enabled
	_release_unavailable()
	_layout()


func _layout() -> void:
	var two_rows := (bridge or claw_enabled) and can_move
	custom_minimum_size.y = 120 if two_rows else 64
	var row_height := 48.0
	var margin := 8.0
	var y := (custom_minimum_size.y - row_height) / 2
	if claw_enabled and can_move:
		y = 64.0
	_place(&"move_left", Rect2(margin, y, 48, row_height), can_move)
	_place(&"move_right", Rect2(margin + 100.0, y, 48, row_height), can_move)
	_place(&"move_up", Rect2(margin + 50.0, y - 28.0, 48, row_height), bridge and can_move)
	_place(&"move_down", Rect2(margin + 50.0, y + 28.0, 48, row_height), bridge and can_move)
	_place(&"interact", Rect2(size.x - margin - 62, y, 62, row_height), true)
	_place(&"jump", Rect2(size.x - margin - 125, y, 59, row_height), can_move)
	_place(&"sprint", Rect2(size.x - margin - 190, y, 61, row_height), can_move)
	_place(&"claw", Rect2(size.x - margin - 72, 8, 72, row_height), claw_enabled and can_move)


func _place(action: StringName, bounds: Rect2, active: bool) -> void:
	var view: Button = widgets[action]
	view.position = bounds.position
	view.size = bounds.size
	view.visible = active


func release_all() -> void:
	for action in pointers.values():
		widgets[action].set_pressed_no_signal(false)
		action_changed.emit(action, false)
	pointers.clear()


func _release_unavailable() -> void:
	for pointer in pointers.keys():
		var action: StringName = pointers[pointer]
		if (action != &"interact" and not can_move) or (action == &"claw" and not claw_enabled) or (action in [&"move_up", &"move_down"] and not bridge):
			_release(pointer)


func _release(pointer: int) -> void:
	if not pointers.has(pointer):
		return
	var action: StringName = pointers[pointer]
	pointers.erase(pointer)
	if not pointers.values().has(action):
		widgets[action].set_pressed_no_signal(false)
		action_changed.emit(action, false)


func _input(event: InputEvent) -> void:
	if not is_visible_in_tree() or not event is InputEventScreenTouch:
		return
	if not event.pressed:
		_release(event.index)
		return
	for action in widgets:
		var view: Button = widgets[action]
		if view.visible and view.get_global_rect().has_point(event.position):
			var already_held := pointers.values().has(action)
			pointers[event.index] = action
			view.set_pressed_no_signal(true)
			if not already_held:
				action_changed.emit(action, true)
			get_viewport().set_input_as_handled()
			break
