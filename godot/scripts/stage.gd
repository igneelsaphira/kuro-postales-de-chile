class_name KuroStage
extends Node2D

const WIDTH := 1100.0
const HEIGHT := 619.0

@export var extent := Vector2(WIDTH, HEIGHT)
@export var floor_percent := 0.86
@export var hill_profile := PackedVector2Array()

var progress: Dictionary


func enter(flags: Dictionary, _spawn_x: float) -> void:
	progress = flags


func ground_y(center_x: float) -> float:
	if hill_profile.is_empty():
		return HEIGHT * floor_percent
	var left_x := center_x - 50.0
	var right := 1
	while right < hill_profile.size() - 1 and left_x > hill_profile[right].x:
		right += 1
	var first := hill_profile[right - 1]
	var last := hill_profile[right]
	return lerpf(first.y, last.y, clampf(inverse_lerp(first.x, last.x, left_x), 0.0, 1.0))


func stand_positions() -> PackedVector2Array:
	var points := PackedVector2Array([Vector2(-30, ground_y(-30))])
	for sample in hill_profile:
		points.append(Vector2(sample.x + 50, sample.y))
	points.append(Vector2(extent.x + 30, ground_y(extent.x + 30)))
	return points


func _ready() -> void:
	if extent.y == HEIGHT:
		var floor_body := StaticBody2D.new()
		var shape := CollisionPolygon2D.new()
		var vertices := stand_positions()
		vertices.append(Vector2(extent.x + 30, HEIGHT + 150))
		vertices.append(Vector2(-30, HEIGHT + 150))
		shape.polygon = vertices
		floor_body.add_child(shape)
		add_child(floor_body)


func refresh_progress() -> void:
	pass


func update_companion(_player_position: Vector2, _delta: float, _seat_x: float = -1.0) -> void:
	pass
