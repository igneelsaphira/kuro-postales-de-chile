class_name KuroHud
extends PanelContainer

signal guide_requested
signal pause_requested

const HEART := ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"]

var city_label: Label
var place_label: Label
var hearts: TextureRect
var life_label: Label
var guide_button: Button
var pause_button: Button
var status_textures: Array[Texture2D] = []


func _ready() -> void:
	add_theme_stylebox_override("panel", KuroStyle.panel(KuroStyle.HUD, Color("#806d48"), 0, 14, 7))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	add_child(row)
	var location := VBoxContainer.new()
	location.add_theme_constant_override("separation", 0)
	location.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(location)
	city_label = KuroStyle.label("", 12, KuroStyle.GOLD, true)
	place_label = KuroStyle.label("", 20, KuroStyle.CREAM, true)
	location.add_child(city_label)
	location.add_child(place_label)

	var lives := VBoxContainer.new()
	lives.add_theme_constant_override("separation", 0)
	row.add_child(lives)
	lives.add_child(KuroStyle.label("VIDA", 12, KuroStyle.GOLD, true))
	var value := HBoxContainer.new()
	lives.add_child(value)
	hearts = TextureRect.new()
	hearts.custom_minimum_size = Vector2(57, 15)
	hearts.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hearts.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hearts.texture_filter = TEXTURE_FILTER_NEAREST
	value.add_child(hearts)
	for count in range(4):
		status_textures.append(_draw_hearts(count))
	life_label = KuroStyle.label("3/3", 14, KuroStyle.CREAM, true)
	life_label.autowrap_mode = TextServer.AUTOWRAP_OFF
	value.add_child(life_label)

	guide_button = KuroStyle.button("?")
	guide_button.tooltip_text = "Controles (H)"
	guide_button.custom_minimum_size = Vector2(44, 44)
	guide_button.focus_mode = Control.FOCUS_NONE
	guide_button.pressed.connect(guide_requested.emit)
	row.add_child(guide_button)
	pause_button = KuroStyle.button("Pausa")
	pause_button.custom_minimum_size = Vector2(66, 44)
	pause_button.tooltip_text = "Pausar (Esc)"
	pause_button.focus_mode = Control.FOCUS_NONE
	pause_button.pressed.connect(pause_requested.emit)
	row.add_child(pause_button)
	resized.connect(_resize_type)
	set_health(3)


func set_location(region: String, place: String) -> void:
	city_label.text = region.to_upper()
	place_label.text = place


func set_health(value: int) -> void:
	hearts.texture = status_textures[clampi(value, 0, 3)]
	life_label.text = "%d/3" % value
	hearts.tooltip_text = "Vida de Kuro · %d de 3" % value


func set_actions_enabled(enabled: bool) -> void:
	guide_button.disabled = not enabled
	pause_button.disabled = not enabled


func _resize_type() -> void:
	place_label.add_theme_font_size_override("font_size", 17 if size.x < 430 else 20)


func _draw_hearts(count: int) -> Texture2D:
	var sheet := Image.create_empty(25, 6, false, Image.FORMAT_RGBA8)
	for index in range(3):
		for y in range(HEART.size()):
			for x in range(7):
				if HEART[y][x] == "1":
					var tint := Color("#d37469") if index < count else Color("#756755")
					if y == 1 and x in [1, 2]:
						tint = tint.lightened(.35)
					sheet.set_pixel(index * 9 + x, y, tint)
	return ImageTexture.create_from_image(sheet)
