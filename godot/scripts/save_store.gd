class_name KuroSaves
extends RefCounted

const FLAGS := [
	"whalePostcardCollected", "quintaPhotoCollected", "bridgePostcardCollected",
	"firstLetterSent", "returnedFromValparaiso", "grandmotherReplyRead",
	"caveBellCollected", "brumaBellReturned", "brumaMet", "valdiviaTracksFound",
	"valdiviaPassageFound", "valdiviaBridgeCrossed", "valdiviaFamilyHelped",
	"copoFollowing", "motaConversationComplete", "tizneConversationComplete", "bridgeMudLearned",
]

var directory: String


func _init(folder: String = "user://partidas") -> void:
	directory = folder


static func clean_progress(source: Dictionary) -> Dictionary:
	var flags := {}
	for flag in FLAGS:
		var value = source.get(flag, false)
		flags[flag] = value is bool and value
	flags.copoFollowing = flags.copoFollowing or flags.valdiviaTracksFound
	flags.caveBellCollected = flags.caveBellCollected or flags.brumaBellReturned
	var answer = source.get("tizneResponse")
	flags.tizneResponse = str(answer) if answer in ["precavido", "comprensivo", "aventurero"] else ""
	flags.bridgeLogProgress = clampf(_finite(source.get("bridgeLogProgress"), 0), 0, 1)
	return flags


static func _finite(value: Variant, fallback: float) -> float:
	if (value is int or value is float) and is_finite(float(value)):
		return float(value)
	return fallback


func load_file(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null or file.get_length() > 65536:
		return {}
	var payload = JSON.parse_string(file.get_as_text())
	if not payload is Dictionary or not payload.get("checkpoint") is Dictionary or not payload.get("progress") is Dictionary:
		return {}
	var checkpoint: Dictionary = payload.checkpoint
	var place = checkpoint.get("place")
	if not place is String or not KuroRoute.STAGES.has(place) or not payload.get("name") is String:
		return {}
	var state := {"place": place, "facing": -1 if _finite(checkpoint.get("facing"), 1) == -1 else 1}
	var horizontal := _finite(checkpoint.get("horizontal"), INF)
	if is_finite(horizontal):
		state.horizontal = horizontal
	var depth := _finite(checkpoint.get("depth"), INF)
	if is_finite(depth):
		state.depth = depth
	return {
		"slot": int(clampf(_finite(payload.get("slot"), 0), 0, 2147483646)),
		"name": payload.name.strip_edges().left(40),
		"savedAt": maxi(0, int(clampf(_finite(payload.get("savedAt"), 0), 0, 9.0e15))),
		"checkpoint": state,
		"progress": clean_progress(payload.progress),
	}


func filename(slot: int) -> String:
	return directory.path_join("partida-%d.json" % slot)


func list_all() -> Array[Dictionary]:
	var results: Array[Dictionary] = []
	var dir := DirAccess.open(directory)
	if dir == null:
		return results
	for file in dir.get_files():
		if file.begins_with("partida-") and file.ends_with(".json"):
			var saved := load_file(directory.path_join(file))
			if not saved.is_empty() and saved.slot > 0 and filename(saved.slot) == directory.path_join(file):
				results.append(saved)
	results.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		return a.savedAt > b.savedAt if a.savedAt != b.savedAt else a.slot < b.slot)
	return results


func free_slot() -> int:
	var slot := 1
	while FileAccess.file_exists(filename(slot)):
		slot += 1
	return slot


func save(state: Dictionary) -> bool:
	var absolute := ProjectSettings.globalize_path(directory)
	if DirAccess.make_dir_recursive_absolute(absolute) != OK:
		return false
	var final_path := ProjectSettings.globalize_path(filename(state.slot))
	var temporary := "%s.%d.tmp" % [final_path, OS.get_process_id()]
	var file := FileAccess.open(temporary, FileAccess.WRITE)
	if file == null:
		return false
	file.store_string(JSON.stringify(state, "\t"))
	file.flush()
	var written := file.get_error() == OK
	file.close()
	if written and DirAccess.rename_absolute(temporary, final_path) == OK:
		return true
	DirAccess.remove_absolute(temporary)
	return false
