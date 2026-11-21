class_name KuroTrain
extends Control

signal arrived

const LANDSCAPES := [
	"kuro-paisaje-tren-v1.webp", "kuro-lomas-costa-tren-v1.webp",
	"kuro-cerros-antes-del-puerto-v1.webp", "kuro-costanera-antes-de-estacion-v1.webp",
]

@onready var wheel_sound: AudioStreamPlayer = $Wheels

var cabin: Texture2D
var pictures: Array[Texture2D]
var elapsed := 0.0
var returning := false


func _ready() -> void:
	hide()
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func depart(is_returning: bool) -> void:
	returning = is_returning
	elapsed = 0.0
	cabin = KuroArt.texture("kuro-vagon-mapochovalpo-v1.webp")
	pictures.clear()
	for file in LANDSCAPES:
		pictures.append(KuroArt.texture(file))
	wheel_sound.stream = load("res://assets/kuro-tren-vias-v1.wav") as AudioStream
	wheel_sound.play()
	show()


func _process(delta: float) -> void:
	if not visible:
		return
	elapsed += delta
	queue_redraw()
	if elapsed >= 5.43:
		hide()
		wheel_sound.stop()
		pictures.clear()
		cabin = null
		arrived.emit()


func _draw() -> void:
	if cabin == null:
		return
	var scale_value := maxf(size.x / cabin.get_width(), size.y / cabin.get_height())
	var area := cabin.get_size() * scale_value
	# Keep the window and the seated Kuro in view on tall screens.
	var top_left := Vector2((size.x - area.x) * .23, (size.y - area.y) * .59)
	var progress := clampf(elapsed / 4.43, 0, .999)
	var segment := floori(progress * pictures.size())
	var picture := pictures[pictures.size() - 1 - segment if returning else segment]
	var picture_bounds := Rect2(top_left - Vector2(70.0 * progress, 0), area + Vector2(70, 0))
	draw_texture_rect(picture, picture_bounds, false)
	draw_texture_rect(cabin, Rect2(top_left, area), false)
	if elapsed > 4.93:
		draw_rect(Rect2(Vector2.ZERO, size), Color(0.09, 0.07, 0.04, (elapsed - 4.93) * 2.0))
