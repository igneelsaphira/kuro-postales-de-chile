class_name KuroSootBall
extends Node2D

var velocity := Vector2.ZERO
var large := false
var deflected := false
var bounced := false


func throw_from(origin: Vector2, facing: float, big: bool) -> void:
	position = origin
	large = big
	deflected = false
	bounced = false
	velocity = Vector2(facing * (420.0 if big else 315.0), -(95.0 if big else 70.0))
	rotation = 0.0
	show()
	queue_redraw()


func step(delta: float, player: KuroPlayer, shooter_x: float, floor_y: float, world_width: float) -> int:
	# 1 is a hit on Kuro, 2 is the projectile returning to its source.
	if not visible:
		return 0
	velocity.y += (650.0 if large else 880.0) * delta
	position += velocity * delta
	rotation += signf(velocity.x) * (10.6 if large else 9.1) * delta

	var relative := position - player.position
	var front := relative.x * player.facing
	var height := -relative.y
	if not deflected and player.claw_left > 0.0 and front >= -12.0 and front <= 132.0 and height >= 4.0 and height <= 120.0:
		deflected = true
		velocity = Vector2(player.facing * (470.0 if large else 430.0), -maxf(275.0, absf(velocity.y) * 0.6))
		bounced = false

	if deflected and absf(position.x - shooter_x) <= 50.0 and position.y > floor_y - 128.0:
		hide()
		return 2
	if not deflected and absf(relative.x) <= (48.0 if large else 35.0) and height >= 4.0 and height <= 108.0:
		hide()
		return 1

	var limit := floor_y - (22 if large else 12)
	if position.y >= limit:
		if bounced:
			hide()
		else:
			position.y = limit
			velocity = Vector2(velocity.x * 0.85, -310.0 if large else -330.0)
			bounced = true
	if position.x < -60.0 or position.x > world_width + 60.0:
		hide()
	return 0


func _draw() -> void:
	var radius := 22.0 if large else 12.0
	var corners := PackedVector2Array()
	for index in range(12):
		var angle := TAU * index / 12.0
		corners.append(Vector2(cos(angle), sin(angle)) * radius * (1.0 if index % 2 == 0 else .9))
	draw_colored_polygon(corners, Color("#242733"))
	corners.append(corners[0])
	draw_polyline(corners, Color("#686e85"), 3.0)
	draw_circle(Vector2(-radius * .3, -radius * .25), radius * .40, Color("#555c72"))
