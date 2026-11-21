class_name KuroRoute
extends RefCounted

const W := KuroStage.WIDTH
const H := KuroStage.HEIGHT

const STAGES := {
	"street": ["street", "Santiago", "Barrio Yungay", 446.0],
	"house": ["house", "Santiago", "Casa de Kuro", 225.0],
	"plaza": ["plaza", "Santiago", "Plaza Yungay", 170.0],
	"quinta": ["quinta", "Santiago", "Quinta Normal", 170.0],
	"museum": ["museum", "Santiago", "Museo · Sala de la Ballena", 220.0],
	"station": ["station", "Santiago", "Estación Mapocho", 170.0],
	"valparaiso": ["valparaiso", "Valparaíso", "Estación Puerto", 210.0],
	"cave": ["cave", "Valparaíso", "Cueva del Chivato", 235.0],
	"valdivia": ["valdivia", "Valdivia", "Costanera", 292.0],
	"bridge": ["bridge", "Valdivia", "Puente Pedro de Valdivia", W * 0.42],
}
const ENTRIES := {
	"street": {"from_house": 204.0, "from_museum": W * 1.29 + 50, "from_station": W * 1.6875 - 100, "from_plaza": W * 0.86 + 50, "from_quinta": W * 1.6875 - 100},
	"station": {"from_route": W - 100},
	"valparaiso": {"from_map": W * 0.24 + 50, "from_cave": W * 3.12 + 50},
	"valdivia": {"at_passage": W * 2.82 + 50, "at_island": W * 3.63 + 50},
	"bridge": {"from_island": W * 1.54},
}
const AREAS := {
	"street": [[1.08, "Quinta Normal"], [0.70, "Plaza Yungay"]],
	"valparaiso": [[1.60, "Cerros"], [1.05, "Plaza Sotomayor"], [0.40, "Paseo del puerto"]],
	"valdivia": [[3.00, "Isla Teja"], [2.00, "Feria Fluvial"]],
}


static func stage_scene(place: String) -> PackedScene:
	return load("res://scenes/%s.tscn" % STAGES[place][0]) as PackedScene


static func entry_x(place: String, entry: String) -> float:
	return float(ENTRIES.get(place, {}).get(entry, STAGES[place][3]))


static func entry_depth(entry: String) -> float:
	return H * (5.98 if entry == "from_island" else 0.16)


static func label(place: String, horizontal: float) -> String:
	for area in AREAS.get(place, []):
		if horizontal >= float(area[0]):
			return str(area[1])
	return str(STAGES[place][2])


static func city(place: String) -> String:
	return str(STAGES[place][1])
