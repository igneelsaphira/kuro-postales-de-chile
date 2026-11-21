class_name KuroStyle
extends RefCounted

const INK := Color("#352b20")
const CREAM := Color("#f8edd4")
const GOLD := Color("#d8bd85")
const HUD := Color("#2c2d23")
const BUTTON := Color("#45463a")
const PIXEL_FONT := preload("res://assets/fonts/pixelify-sans.ttf")


static func panel(fill: Color, border: Color, radius: int, margin_x: int, margin_y: int) -> StyleBoxFlat:
	var box := StyleBoxFlat.new()
	box.bg_color = fill
	box.border_color = border
	box.set_border_width_all(1)
	box.set_corner_radius_all(radius)
	box.content_margin_left = margin_x
	box.content_margin_right = margin_x
	box.content_margin_top = margin_y
	box.content_margin_bottom = margin_y
	return box


static func label(value: String, height: int, ink: Color = INK, pixel: bool = false) -> Label:
	var result := Label.new()
	result.text = value
	result.add_theme_font_size_override("font_size", height)
	result.add_theme_color_override("font_color", ink)
	if pixel:
		result.add_theme_font_override("font", PIXEL_FONT)
	result.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	result.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return result


static func button(value: String, light: bool = false) -> Button:
	var result := Button.new()
	result.text = value
	result.custom_minimum_size.y = 40
	var fill := Color("#f0dfbb") if light else BUTTON
	var ink := INK if light else CREAM
	var frame := Color("#b2996f") if light else Color("#9d8a5d")
	result.add_theme_stylebox_override("normal", panel(fill, frame, 5, 10, 4))
	result.add_theme_stylebox_override("hover", panel(fill.lightened(.10), frame, 5, 10, 4))
	result.add_theme_stylebox_override("pressed", panel(fill.darkened(.08), frame, 5, 10, 4))
	result.add_theme_stylebox_override("disabled", panel(fill.darkened(.16), frame, 5, 10, 4))
	var focus := panel(Color.TRANSPARENT, Color("#c48634"), 5, 0, 0)
	focus.set_border_width_all(2)
	result.add_theme_stylebox_override("focus", focus)
	result.add_theme_color_override("font_color", ink)
	result.add_theme_color_override("font_hover_color", ink)
	result.add_theme_color_override("font_focus_color", ink)
	result.add_theme_color_override("font_pressed_color", ink)
	result.add_theme_color_override("font_disabled_color", ink.lerp(fill, .65))
	result.add_theme_font_size_override("font_size", 16)
	return result


static func artwork(file: String, preferred_height: float) -> TextureRect:
	var view := TextureRect.new()
	view.texture = KuroArt.texture(file)
	view.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	view.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	view.custom_minimum_size.y = preferred_height
	view.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return view
