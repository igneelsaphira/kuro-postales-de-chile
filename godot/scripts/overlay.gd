class_name KuroOverlay
extends Control

var screen := ""
var on_back: Callable
var on_confirm: Callable
var on_horizontal: Callable
var stack: VBoxContainer
var footer: HBoxContainer
var shade: ColorRect
var card: PanelContainer
var title: Label
var scroll: ScrollContainer
var portraits: Control
var buttons: Array[Button] = []
var dialogue_lines: Array
var dialogue_index := 0
var dialogue_done: Callable
var line: Label
var text_progress := 0.0
var target_height := 370.0
var status: Label


func _ready() -> void:
	shade = ColorRect.new()
	shade.color = Color(0.09, 0.07, 0.04, 0.63)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(shade)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	portraits = Control.new()
	portraits.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(portraits)
	card = PanelContainer.new()
	card.add_theme_stylebox_override("panel", KuroStyle.panel(KuroStyle.CREAM, Color("#a8794a"), 10, 17, 13))
	add_child(card)
	var layout := VBoxContainer.new()
	layout.add_theme_constant_override("separation", 8)
	card.add_child(layout)
	title = KuroStyle.label("", 27, KuroStyle.INK, true)
	layout.add_child(title)
	scroll = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	layout.add_child(scroll)
	stack = VBoxContainer.new()
	stack.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	stack.add_theme_constant_override("separation", 8)
	scroll.add_child(stack)
	status = KuroStyle.label("", 14, Color("#9a4228"))
	status.hide()
	layout.add_child(status)
	footer = HBoxContainer.new()
	footer.add_theme_constant_override("separation", 8)
	layout.add_child(footer)
	resized.connect(_layout)
	hide()


func open_screen(id: String, heading: String, height: float, back: Callable = Callable()) -> void:
	screen = id
	on_back = back
	on_confirm = Callable()
	on_horizontal = Callable()
	title.text = heading
	target_height = height
	status.hide()
	_clear(stack)
	_clear(footer)
	_clear(portraits)
	buttons.clear()
	line = null
	shade.visible = id != "dialogue" and id != "choices"
	scroll.scroll_vertical = 0
	show()
	_layout()


func _clear(parent: Control) -> void:
	for child in parent.get_children():
		parent.remove_child(child)
		child.queue_free()


func _layout() -> void:
	if card == null:
		return
	var is_dialogue := screen == "dialogue" or screen == "choices"
	var width := maxf(240.0, minf(size.x - 24.0, 740.0 if is_dialogue else 494.0))
	var extra := 45.0 if is_dialogue and size.x < 460.0 else 0.0
	var height := maxf(115.0, minf(size.y - 24.0, target_height + extra))
	var y := size.y - height - 12.0 if is_dialogue else (size.y - height) * .5
	card.size = Vector2(width, height)
	card.position = Vector2((size.x - width) * .5, y)
	var portrait_height := minf(154.0, maxf(0.0, y - 4.0))
	portraits.position = card.position - Vector2(0, portrait_height - 1.0)
	portraits.size = Vector2(width, portrait_height)


func text_line(value: String, font_size: int = 16) -> Label:
	var label := KuroStyle.label(value, font_size)
	stack.add_child(label)
	return label


func picture(file: String, display_height: float) -> TextureRect:
	var picture_node := KuroStyle.artwork(file, display_height)
	stack.add_child(picture_node)
	return picture_node


func action(title_text: String, callback: Callable, bottom: bool = false) -> Button:
	var button := KuroStyle.button(title_text, true)
	button.tooltip_text = title_text
	button.pressed.connect(callback)
	if bottom:
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		footer.add_child(button)
	else:
		stack.add_child(button)
	buttons.append(button)
	return button


func close_screen() -> void:
	var focus := get_viewport().gui_get_focus_owner()
	if focus != null and is_ancestor_of(focus):
		focus.release_focus()
	screen = ""
	dialogue_lines = []
	dialogue_done = Callable()
	line = null
	on_back = Callable()
	on_confirm = Callable()
	on_horizontal = Callable()
	hide()


func show_error(message: String) -> void:
	show_status(message, Color("#9a4228"))


func show_status(message: String, color: Color = KuroStyle.INK) -> void:
	status.text = message
	status.add_theme_color_override("font_color", color)
	status.show()


func focus_first() -> void:
	for button in buttons:
		if not button.disabled and button.is_visible_in_tree():
			button.grab_focus()
			return


func _move_focus(step: int) -> void:
	var current := get_viewport().gui_get_focus_owner()
	var candidates := buttons.filter(func(button: Button) -> bool: return button.is_visible_in_tree() and not button.disabled)
	if candidates.is_empty():
		return
	var index := candidates.find(current)
	var next := 0 if index < 0 else posmod(index + step, candidates.size())
	candidates[next].grab_focus()


func handle_action(action_id: StringName) -> bool:
	if screen.is_empty():
		return false
	var focused := get_viewport().gui_get_focus_owner()
	match action_id:
		&"pause":
			if on_back.is_valid():
				on_back.call()
			return true
		&"interact", &"jump":
			if focused is LineEdit:
				return false
			if on_confirm.is_valid():
				on_confirm.call()
			elif focused is Button and focused in buttons and not focused.disabled:
				focused.pressed.emit()
			return true
		&"move_left", &"move_right":
			var direction := -1 if action_id == &"move_left" else 1
			if on_horizontal.is_valid():
				on_horizontal.call(direction)
			elif not focused is LineEdit:
				_move_focus(direction)
			else:
				return false
			return true
		&"move_up", &"move_down":
			if not focused is LineEdit:
				_move_focus(-1 if action_id == &"move_up" else 1)
				return true
	return false


func start_dialogue(lines: Array, on_complete: Callable = Callable()) -> void:
	dialogue_lines = lines
	dialogue_index = 0
	dialogue_done = on_complete
	_show_line()


func _show_line() -> void:
	var entry: Array = dialogue_lines[dialogue_index]
	open_screen("dialogue", entry[0], 156.0, close_screen)
	line = text_line(entry[1], 17)
	line.visible_characters = 0
	text_progress = 0.0
	on_confirm = advance_dialogue
	action("Continuar", advance_dialogue, true)
	_show_portraits(entry)


func _show_portraits(entry: Array) -> void:
	_add_portrait("Kuro", str(entry[2]) if entry.size() > 2 and entry[0] == "Kuro" else "", false)
	var visitor := ""
	for item in dialogue_lines:
		if str(item[0]) in ["Mota", "Tizne", "Doña Bruma", "Copo"]:
			visitor = str(item[0])
			break
	if not visitor.is_empty():
		_add_portrait(visitor, str(entry[2]) if entry.size() > 2 and entry[0] == visitor else "", true)


func _add_portrait(who: String, emotion: String, right: bool) -> void:
	var file: String
	match who:
		"Kuro":
			file = "kuro-dialogue-annoyed-frames-v1.png" if emotion == "annoyed" else "kuro-dialogue-frames-v1.png"
		"Tizne":
			file = "tizne-dialogue-remorseful-frames-v1.png" if emotion == "remorseful" else "tizne-dialogue-frames-v1.png"
		"Mota":
			file = "mota-dialogue-frames-v1.png"
		"Copo":
			file = "copo-dialogue-v2.png"
		"Doña Bruma":
			file = "dona-bruma-dialogue-frames-v1.png"
	var portrait := TextureRect.new()
	var sheet := KuroArt.texture(file)
	portrait.texture = KuroArt.frame(sheet, 2, 2) if who != "Copo" else sheet
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if right:
		portrait.set_anchors_and_offsets_preset(Control.PRESET_RIGHT_WIDE)
		portrait.offset_left = -148.0
		portrait.offset_right = -4.0
	else:
		portrait.set_anchors_and_offsets_preset(Control.PRESET_LEFT_WIDE)
		portrait.offset_left = 4.0
		portrait.offset_right = 148.0
	if who != title.text:
		portrait.modulate = Color("#c6beb3")
	portraits.add_child(portrait)


func advance_dialogue() -> void:
	if line.visible_characters >= 0 and line.visible_characters < line.text.length():
		line.visible_characters = -1
		return
	dialogue_index += 1
	if dialogue_index < dialogue_lines.size():
		_show_line()
	else:
		var done := dialogue_done
		close_screen()
		if done.is_valid():
			done.call()


func _process(delta: float) -> void:
	if screen == "dialogue" and line != null and line.visible_characters >= 0:
		text_progress += delta * 65.0
		line.visible_characters = mini(line.text.length(), floori(text_progress))
