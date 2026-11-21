class_name KuroValdivia
extends KuroStage

@export var copo_x := 1694.0

var companion: KuroCompanion
var vendor_sheet: Texture2D
var crow: Sprite2D
var crow_sheet: Texture2D
var time := 0.0


func enter(flags: Dictionary, spawn_x: float) -> void:
	super(flags, spawn_x)
	companion = KuroCompanion.new()
	add_child(companion)
	var start := maxf(60, spawn_x - 79) if flags.copoFollowing else copo_x
	companion.position = Vector2(start, ground_y(start))
	vendor_sheet = KuroArt.texture("valdivia-pudu-vendor-sprite-v3.png")
	crow_sheet = KuroArt.texture("valdivia-crow-traveler-walk-v4.png")
	crow = KuroArt.sprite_texture(self, KuroArt.frame(crow_sheet, 4), Rect2(0, ground_y(0) - 100, 75, 100), true)
	crow.z_index = 7


func update_companion(player_position: Vector2, delta: float, bench: float = -1.0) -> void:
	time += delta
	crow.position.x = fposmod(780.0 + 28.0 * time, extent.x + 150.0) - 75.0
	crow.texture = KuroArt.frame(crow_sheet, 4, 1, floori(time / 0.20) % 4)
	var vendor: Sprite2D = $Vendor
	var vendor_frame := floori(time / 0.55) % 8
	vendor.texture = KuroArt.frame(vendor_sheet, 4, 2, vendor_frame)
	vendor.flip_h = player_position.x < vendor.position.x
	if progress.copoFollowing:
		companion.follow(player_position, delta, ground_y, extent.x, bench)


func join_player(player_x: float) -> void:
	companion.position.x = maxf(60, player_x - 79.0)


func bench_center(on_island: bool) -> float:
	return $IslandBench.position.x if on_island else $Bench.position.x
