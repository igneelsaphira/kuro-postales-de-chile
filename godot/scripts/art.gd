class_name KuroArt
extends RefCounted

const DIRECTORY := "res://assets/"

static func texture(file: String) -> Texture2D:
	return load(DIRECTORY + file) as Texture2D


static func frame(sheet: Texture2D, columns: int, rows: int = 1, index: int = 0) -> AtlasTexture:
	var frame_size := sheet.get_size() / Vector2(columns, rows)
	var atlas := AtlasTexture.new()
	atlas.atlas = sheet
	atlas.region = Rect2(Vector2(index % columns, floori(float(index) / columns)) * frame_size, frame_size)
	atlas.filter_clip = true
	return atlas


static func sprite(parent: Node2D, file: String, bounds: Rect2, fit: bool = false) -> Sprite2D:
	return sprite_texture(parent, texture(file), bounds, fit)


static func sprite_texture(parent: Node2D, artwork: Texture2D, bounds: Rect2, fit: bool = false) -> Sprite2D:
	var sprite_node := Sprite2D.new()
	sprite_node.texture = artwork
	sprite_node.position = bounds.get_center()
	sprite_node.scale = bounds.size / artwork.get_size()
	if fit:
		sprite_node.scale = Vector2.ONE * minf(sprite_node.scale.x, sprite_node.scale.y)
		sprite_node.position.y = bounds.end.y - artwork.get_height() * sprite_node.scale.y / 2.0
	parent.add_child(sprite_node)
	return sprite_node
