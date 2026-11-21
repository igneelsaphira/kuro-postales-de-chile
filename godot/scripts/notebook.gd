class_name KuroNotebook
extends RefCounted

const MEMORIES := [
	["whalePostcardCollected", "La ballena de Quinta Normal", "Santiago · 01", "museum-whale-hall.png",
		"Algunas criaturas recorren océanos enteros.", "P. D. Quizás un viaje muy grande también puede comenzar cerquita de casa."],
	["quintaPhotoCollected", "Una tarde en Quinta Normal", "Santiago · 02", "quinta-normal-unificada-v1.png",
		"La primera foto que Kuro tomó durante su viaje.", "P. D. No hace falta ir muy lejos para empezar a mirar el mundo con otros ojos."],
	["tizneResponse", "Al volver de la cueva", "Valparaíso · 01", "valparaiso-continuo-pixel-v1.png",
		"Al entrar parecían monstruos. Al volver, Kuro pensó que quizás ellas también tenían miedo.", ""],
	["bridgePostcardCollected", "La islita del humedal", "Valdivia · ★", "bridge-islet-kuro-view-v2.webp",
		"Kuro movió el tronco y encontró una pequeña huella entre los juncos.", "Aunque a veces les dicen nutrias, los coipos son roedores nativos de Chile."],
	["valdiviaFamilyHelped", "Un refugio junto al río", "Valdivia · 01", "valdivia-riverside-background-v1.webp",
		"Kuro y Copo siguieron las huellas hasta encontrar a una familia de coipos en Isla Teja.", "P. D. A veces un misterio solo necesita un lugar seco y un poco de ayuda."],
]
const MAP_DESTINATIONS := [
	["santiago", "Santiago", "Barrio Yungay · Quinta Normal · Estación Mapocho"],
	["valparaiso", "Valparaíso", "Estación Puerto · Plaza Sotomayor · Cueva del Chivato"],
	["valdivia", "Valdivia", "Costanera · Feria Fluvial · Isla Teja"],
]

var game
var ui: KuroOverlay
var album_index := 0
var album_return: Callable
var map_index := 0
var map_return: Callable
var file_picker: FileDialog


func _init(runtime: Control, display: KuroOverlay) -> void:
	game = runtime
	ui = display


func open_title() -> void:
	ui.open_screen("title", "Kuro · Postales de Chile", 282)
	ui.text_line("Alpha v0.2", 15)
	ui.action("Nueva partida", new_game_form)
	ui.action("Continuar", list_saves).disabled = game.saves.list_all().is_empty()
	ui.action("Importar partida", begin_import)
	ui.focus_first()


func new_game_form() -> void:
	ui.open_screen("new", "Nueva partida", 250, open_title)
	ui.text_line("Nombre de la partida (opcional)")
	var field := LineEdit.new()
	field.max_length = 40
	field.custom_minimum_size.y = 42
	field.placeholder_text = "Nombre"
	field.virtual_keyboard_enabled = true
	ui.stack.add_child(field)
	field.text_submitted.connect(func(value: String) -> void: game.start_new_game(value))
	ui.action("Empezar partida", func() -> void: game.start_new_game(field.text))
	ui.action("Volver", open_title, true)
	# Keep the on-screen keyboard closed until the player chooses the field.
	ui.focus_first()


func list_saves() -> void:
	ui.open_screen("saves", "Continuar partida", 355, open_title)
	for save in game.saves.list_all():
		var name := _name(save)
		var checkpoint: Dictionary = save.checkpoint
		var place := KuroRoute.label(checkpoint.place, float(checkpoint.get("horizontal", 0.0)))
		ui.action("%s  ·  %s" % [name, place], game.resume_from.bind(save)).text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	ui.action("Importar partida", begin_import)
	ui.action("Volver", open_title, true)
	ui.focus_first()


func _name(save: Dictionary) -> String:
	if save.name.is_empty():
		return "Partida %d" % save.slot
	return save.name


func begin_import() -> void:
	if file_picker == null:
		file_picker = FileDialog.new()
		file_picker.title = "Importar partida de Kuro"
		file_picker.access = FileDialog.ACCESS_FILESYSTEM
		file_picker.file_mode = FileDialog.FILE_MODE_OPEN_FILE
		file_picker.filters = PackedStringArray(["*.json ; Partida de Kuro"])
		file_picker.file_selected.connect(_import_file)
		game.add_child(file_picker)
	file_picker.popup_centered_ratio(.8)


func _import_file(path: String) -> void:
	var imported: Dictionary = game.saves.load_file(path)
	if imported.is_empty():
		ui.show_error("El archivo no contiene una partida de Kuro que se pueda leer.")
		return
	imported.slot = game.saves.free_slot()
	if not game.saves.save(imported):
		ui.show_error("No se pudo importar la partida.")
		return
	list_saves()


func open_pause() -> void:
	ui.open_screen("pause", "Pausa", 355, ui.close_screen)
	ui.action("Seguir jugando", ui.close_screen)
	ui.action("Guardar partida", _save_manually)
	ui.action("Cuaderno de viaje", open_notebook)
	ui.action("Guardar y volver al inicio", _save_to_title)
	ui.action("Salir del juego", open_exit)
	ui.focus_first()


func _save_manually() -> void:
	if game.save_checkpoint():
		ui.show_status("Partida guardada.")
	else:
		ui.show_error("No se pudo guardar la partida.")


func _save_to_title() -> void:
	if game.save_checkpoint():
		game.show_title()
	else:
		ui.show_error("No se pudo guardar la partida.")


func open_exit() -> void:
	ui.open_screen("exit", "¿Salir del juego?", 255, open_pause)
	ui.text_line(_name(game.active_save))
	ui.action("Guardar y salir", _save_and_exit)
	ui.action("Salir sin guardar", func() -> void: game.get_tree().quit())
	ui.action("Cancelar", open_pause, true)
	ui.focus_first()


func _save_and_exit() -> void:
	if game.save_checkpoint():
		game.get_tree().quit()
	else:
		ui.show_error("No se pudo guardar la partida.")


func open_notebook() -> void:
	ui.open_screen("notebook", "Cuaderno de viaje", 314, open_pause)
	var checkpoint: Dictionary = game.active_save.checkpoint
	var place := KuroRoute.label(checkpoint.place, float(checkpoint.get("horizontal", 0.0)))
	ui.text_line("%s · %s" % [_name(game.active_save), place], 15)
	ui.action("Mapa de viaje", open_map.bind(open_notebook))
	ui.action("Álbum de Viaje", open_album.bind("", open_notebook))
	if game.progress.caveBellCollected:
		var bell := "Doble salto · Cascabel devuelto a Doña Bruma" if game.progress.brumaBellReturned else "Cascabel · Doble salto"
		ui.text_line(bell, 15)
	ui.action("Volver", open_pause, true)
	ui.focus_first()


func open_guide(display: KuroOverlay) -> void:
	display.open_screen("guide", "Controles", 420, display.close_screen)
	display.text_line("Moverse   ← →  o  A D")
	if game.place == "bridge":
		display.text_line("Subir y bajar   ↑ ↓  o  W S")
	display.text_line("Correr   Shift")
	display.text_line("Saltar   Espacio")
	if game.progress.caveBellCollected:
		display.text_line("Doble salto   Espacio otra vez en el aire")
	display.text_line("Interactuar   E  o  Enter")
	if game.place == "cave" and not game.progress.caveBellCollected:
		display.text_line("Zarpazo   F")
	if game.touch.visible:
		display.text_line("En pantalla, mantén las flechas y pulsa Saltar o Acción. Para correr, mantén Correr junto con una flecha.", 15)
	display.action("Volver al juego", display.close_screen, true)
	display.focus_first()


func open_photo() -> void:
	ui.open_screen("photo", "Una tarde en Quinta Normal", 390, ui.close_screen)
	ui.picture("quinta-normal-unificada-v1.png", 190)
	ui.text_line("¡Nuevo recuerdo para el Álbum de Viaje!")
	ui.action("Guardar foto", ui.close_screen, true)
	ui.on_confirm = ui.close_screen


func open_album(focus: String = "", back: Callable = Callable()) -> void:
	album_return = back if back.is_valid() else ui.close_screen
	if not focus.is_empty():
		var cards := _unlocked()
		for index in range(cards.size()):
			if cards[index][0] == focus:
				album_index = index
	_render_album()


func _unlocked() -> Array:
	return MEMORIES.filter(func(memory: Array) -> bool:
		var flag = game.progress[memory[0]]
		return not flag.is_empty() if flag is String else bool(flag))


func _render_album() -> void:
	var cards := _unlocked()
	ui.open_screen("album", "Álbum de Viaje", 486, album_return)
	if cards.is_empty():
		ui.text_line("Todavía quedan muchos lugares por conocer.")
	else:
		album_index = clampi(album_index, 0, cards.size() - 1)
		var card: Array = cards[album_index]
		ui.picture(card[3], 174)
		ui.text_line(card[1], 19)
		ui.text_line(card[2] + " · %d/%d" % [album_index + 1, cards.size()], 14)
		ui.text_line(card[4])
		var note: String = card[5]
		if card[0] == "tizneResponse":
			note = KuroStory.RESPONSES[game.progress.tizneResponse].postscript
		ui.text_line(note, 14)
	if cards.size() > 1:
		ui.action("‹", _turn_page.bind(-1), true)
		ui.action("›", _turn_page.bind(1), true)
	ui.action("Cerrar", album_return, true)
	ui.on_horizontal = _turn_page


func _turn_page(direction: int) -> void:
	var count := _unlocked().size()
	if count > 1:
		album_index = posmod(album_index + direction, count)
		_render_album()


func open_letter() -> void:
	ui.open_screen("letter", "Carta para la abuelita", 536, ui.close_screen)
	ui.text_line("Querida abuelita:")
	ui.text_line("Llegué bien a Estación Mapocho. Estoy por subir al tren. Me da un poquito de nervio, pero tengo muchas ganas de ver qué hay más allá.")
	ui.text_line("Te escribo cuando llegue. Un besito,\nKuro")
	var attachments: Array[String] = []
	if game.progress.whalePostcardCollected:
		attachments.append("una postal de la ballena")
	if game.progress.quintaPhotoCollected:
		attachments.append("una foto de Quinta Normal")
	if not attachments.is_empty():
		ui.text_line("P. D. Te mando %s." % " y ".join(attachments))
		var memories := HBoxContainer.new()
		ui.stack.add_child(memories)
		for flag in ["whalePostcardCollected", "quintaPhotoCollected"]:
			if game.progress[flag]:
				var file := "museum-whale-hall.png" if flag == "whalePostcardCollected" else "quinta-normal-unificada-v1.png"
				var attachment := KuroStyle.artwork(file, 74)
				attachment.size_flags_horizontal = Control.SIZE_EXPAND_FILL
				memories.add_child(attachment)
	ui.action("Enviar carta", _send_letter, true)
	ui.action("Cerrar", ui.close_screen, true)
	ui.on_confirm = _send_letter
	ui.focus_first()


func _send_letter() -> void:
	game.mark("firstLetterSent")
	game.speak([["Estafeta Gatuna", "Carta enviada a la abuelita."]])


func open_map(back: Callable = Callable()) -> void:
	map_return = back if back.is_valid() else ui.close_screen
	map_index = 0
	_render_map()


func _render_map() -> void:
	ui.open_screen("map", "Mapa de viaje", 516, map_return)
	ui.picture("mapa-chile-pixel-magico-v2.png", 190)
	var stops := HBoxContainer.new()
	stops.add_theme_constant_override("separation", 5)
	ui.stack.add_child(stops)
	for index in range(MAP_DESTINATIONS.size()):
		var stop := KuroStyle.button(MAP_DESTINATIONS[index][1], true)
		stop.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		stop.toggle_mode = true
		stop.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
		stop.set_pressed_no_signal(index == map_index)
		stop.pressed.connect(_choose_map_index.bind(index))
		stops.add_child(stop)
	var destination: Array = MAP_DESTINATIONS[map_index]
	ui.text_line(destination[2], 15)
	ui.action("Viajar a %s" % destination[1], _travel, true)
	ui.action("Cerrar", map_return, true)
	ui.on_confirm = _travel
	ui.on_horizontal = _map_step


func _choose_map_index(index: int) -> void:
	map_index = index
	_render_map()


func _map_step(direction: int) -> void:
	map_index = posmod(map_index + direction, MAP_DESTINATIONS.size())
	_render_map()


func _travel() -> void:
	game.travel(MAP_DESTINATIONS[map_index][0])
