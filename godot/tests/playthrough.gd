extends SceneTree

const MAIN := preload("res://scenes/main.tscn")

var game: KuroGame
var folder: String
var screenshots := ""
var failures := 0


func _initialize() -> void:
	_run.call_deferred()


func _run() -> void:
	var temp := OS.get_environment("TMPDIR")
	if temp.is_empty():
		temp = OS.get_environment("TEMP")
	if temp.is_empty():
		temp = OS.get_user_data_dir()
	folder = temp.path_join("kuro-playthrough-%d" % OS.get_process_id())
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--capture="):
			screenshots = argument.trim_prefix("--capture=")
	game = MAIN.instantiate()
	game.saves = KuroSaves.new(folder)
	root.add_child(game)
	await _frames(3)

	await _tap(KEY_ENTER)
	_check(game.overlay.screen == "new", "La tecla Enter abre el formulario de partida")
	await _tap(KEY_ENTER)
	_check(game.in_game and game.place == "street", "Partida nueva en Barrio Yungay")

	await _walk(219)
	await _interact("enter_house")
	await _arrive("house")
	await _capture("01-casa")
	await _walk(414)
	await _interact("chair")
	_check(game.player.seat == "reading", "Kuro se sienta a leer")
	await _interact("leave_seat")
	await _walk(556)
	await _interact("window")
	await _frames(28)
	await _capture("02-dialogo-casa")
	await _finish_dialogue()
	await _tap(KEY_H)
	_check(game.guide.visible, "H abre la guía")
	var paused_x := game.player.position.x
	_key(KEY_RIGHT, true)
	await _frames(20)
	_key(KEY_RIGHT, false)
	_check(is_equal_approx(paused_x, game.player.position.x), "La guía pausa el movimiento")
	await _tap(KEY_ESCAPE)
	_check(not game.guide.visible, "Escape cierra la guía")
	await _jump_once(false)
	await _walk(232)
	await _interact("exit_house")
	await _arrive("street")

	await _walk(610)
	await _interact("mota")
	await _finish_dialogue()
	_check(game.progress.motaConversationComplete, "Se completa la conversación de Mota")
	await _walk(942)
	_check(game.hud.place_label.text == "Plaza Yungay", "HUD identifica Plaza Yungay")
	await _walk(1368)
	_check(game.hud.place_label.text == "Quinta Normal", "HUD identifica Quinta Normal")
	await _interact("photo")
	_check(game.overlay.screen == "photo" and game.progress.quintaPhotoCollected, "Foto guardada en el álbum")
	await _tap(KEY_E)
	await _walk(1570)
	await _interact("museum")
	await _arrive("museum")
	await _walk(880)
	await _interact("whale")
	await _finish_dialogue()
	_check(game.progress.whalePostcardCollected, "Postal de la ballena guardada")
	await _walk(100)
	await _interact("exit_museum")
	await _arrive("street")
	await _edge(KEY_RIGHT, "station")
	await _walk(425)
	await _interact("mail")
	_check(game.overlay.screen == "letter", "La carta abre desde Estafeta Gatuna")
	await _tap(KEY_E)
	await _finish_dialogue()
	_check(game.progress.firstLetterSent, "Carta para la abuelita enviada")
	await _walk(740)
	await _interact("train")
	await _tap(KEY_RIGHT)
	await _tap(KEY_E)
	_check(game.train.visible and game.hud.place_label.text == "Tren a Valparaíso", "Viaje y HUD del tren")
	await _frames(90)
	await _capture("03-tren")
	await _arrive("valparaiso")
	print("Santiago → Valparaíso · carta, foto, postal, diálogos y tren")

	await _walk(1560)
	await _interact("tizne")
	await _finish_dialogue()
	await _walk(3060)
	await _interact("bruma")
	await _finish_dialogue()
	await _edge(KEY_RIGHT, "cave")
	await _capture("04-cueva-oscura")
	await _walk(935)
	await _wait_until(func() -> bool: return game.hud.life_label.text == "2/3", 110, "Golpe de hollín actualiza el HUD")
	await _run_cave()
	await _interact("bell")
	await _finish_dialogue()
	_check(game.progress.caveBellCollected and game.hud.life_label.text == "3/3", "Cascabel, luz y recuperación de vida")
	await _capture("05-cueva-iluminada")
	await _jump_once(true)
	await _edge(KEY_LEFT, "valparaiso")
	await _walk(3070)
	await _interact("bruma")
	await _finish_dialogue()
	_check(game.progress.brumaBellReturned and game.progress.caveBellCollected, "Devolución conserva el doble salto")
	await _walk(1550)
	await _interact("tizne")
	await _finish_dialogue()
	_check(game.overlay.screen == "choices", "Aparecen las opciones de Tizne")
	await _tap(KEY_2)
	await _finish_dialogue()
	_check(game.progress.tizneResponse == "comprensivo", "Se guarda la respuesta a Tizne")
	await _walk(156)
	await _interact("return_train")
	await _tap(KEY_E)
	await _arrive("station")
	_check(game.progress.returnedFromValparaiso, "Regreso a Santiago")
	await _walk(425)
	await _interact("mail")
	await _finish_dialogue()
	_check(game.progress.grandmotherReplyRead, "Se lee la respuesta de la abuelita")
	print("Cueva del Chivato → Estación Mapocho · combate, doble salto, devolución y carta")

	await _walk(740)
	await _interact("train")
	await _tap(KEY_LEFT)
	await _tap(KEY_E)
	await _arrive("valdivia")
	await _walk(1694)
	await _interact("copo")
	await _finish_dialogue()
	_check(game.progress.copoFollowing, "Copo acompaña a Kuro")
	await _capture("06-valdivia")
	await _walk(2610)
	await _interact("tracks")
	await _finish_dialogue()
	await _walk(3190)
	await _interact("passage")
	await _finish_dialogue()
	await _arrive("bridge")
	await _climb()
	_check(game.progress.valdiviaFamilyHelped and game.progress.valdiviaBridgeCrossed, "Se ayuda a los coipos y se cruza el puente")
	_check(game.hud.place_label.text == "Isla Teja", "HUD identifica Isla Teja")
	await _capture("08-isla-teja")
	print("Valdivia → Isla Teja · Copo, huellas, barro, tronco, postal y coipos")

	var position_saved := game.player.position.x
	await _tap(KEY_ESCAPE)
	_check(game.overlay.screen == "pause", "Esc abre pausa")
	await _tap(KEY_DOWN)
	await _tap(KEY_ENTER)
	var saved := game.saves.load_file(game.saves.filename(1))
	_check(saved.checkpoint.place == "valdivia" and saved.progress.valdiviaFamilyHelped, "Guardado local tras la llegada")
	game.show_title()
	await _frames(4)
	await _tap(KEY_DOWN)
	await _tap(KEY_ENTER)
	_check(game.overlay.screen == "saves", "Menú Continuar encuentra la partida")
	await _tap(KEY_ENTER)
	await _frames(5)
	_check(game.place == "valdivia" and absf(game.player.position.x - position_saved) < .05, "Se reanuda el punto de guardado exacto")
	game.notebook.open_album()
	_check(game.notebook._unlocked().size() == 5, "Cinco recuerdos del recorrido completo")
	await _tap(KEY_ESCAPE)

	await _check_resolution(Vector2i(1100, 710), false, "escritorio")
	await _check_resolution(Vector2i(390, 844), true, "vertical")
	await _capture("09-isla-teja-vertical")
	await _check_resolution(Vector2i(844, 390), true, "horizontal")
	await _capture("10-isla-teja-horizontal")
	await _check_resolution(Vector2i(320, 568), true, "vertical compacta")
	await _check_resolution(Vector2i(1920, 620), false, "ultraancha")
	await _check_legacy_import()

	if failures == 0:
		print("PASS · Recorrido, guardados, importación, HUD y controles por resolución")
	quit(0 if failures == 0 else 1)


func _check(state: bool, description: String) -> void:
	if not state:
		failures += 1
		push_error("%s [%s x=%.1f profundidad=%.1f UI=%s]" % [
			description, game.place, game.player.position.x, game.depth, game.overlay.screen,
		])
		quit(1)


func _frames(count: int) -> void:
	for index in range(count):
		await process_frame


func _wait_until(condition: Callable, limit: int, description: String) -> void:
	for index in range(limit):
		if condition.call():
			return
		await process_frame
	_check(false, description)


func _key(code: Key, down: bool) -> void:
	var event := InputEventKey.new()
	event.physical_keycode = code
	event.keycode = code
	event.pressed = down
	Input.parse_input_event(event)


func _tap(code: Key) -> void:
	_key(code, true)
	await _frames(2)
	_key(code, false)
	await _frames(2)


func _walk(target: float) -> void:
	await _axis(target, false)


func _axis(target: float, vertical: bool) -> void:
	var position_of := func() -> float: return game.depth if vertical else game.player.position.x
	var sign_value := signf(target - float(position_of.call()))
	if absf(float(position_of.call()) - target) <= 4:
		return
	var code: Key
	if vertical:
		code = KEY_UP if sign_value > 0.0 else KEY_DOWN
	else:
		code = KEY_RIGHT if sign_value > 0.0 else KEY_LEFT
	_key(code, true)
	await _wait_until(func() -> bool: return sign_value * (target - float(position_of.call())) <= 2.0,
		2300, "Avanzar hasta %.1f en %s" % [target, "vertical" if vertical else "horizontal"])
	_key(code, false)
	await _frames(3)


func _interact(id: String) -> void:
	_check(game.story.current_action() == id, "Interacción %s (actual %s)" % [id, game.story.current_action()])
	await _tap(KEY_E)


func _finish_dialogue() -> void:
	for index in range(40):
		if game.overlay.screen != "dialogue":
			return
		await _tap(KEY_E)
	_check(false, "El diálogo termina")


func _arrive(location: String) -> void:
	await _wait_until(func() -> bool: return game.place == location and not game.transitioning, 500, "Llegada a %s" % location)
	await _frames(3)


func _edge(code: Key, location: String) -> void:
	_key(KEY_SHIFT, true)
	_key(code, true)
	await _wait_until(func() -> bool: return game.place == location or game.transitioning, 1600, "Cambio a %s al llegar al borde" % location)
	_key(code, false)
	_key(KEY_SHIFT, false)
	await _arrive(location)


func _jump_once(expect_double: bool) -> void:
	var initial_y := game.player.position.y
	_key(KEY_SPACE, true)
	await _frames(9)
	_check(game.player.position.y < initial_y - 25 and game.player.jumps_used == 1, "Salto con Espacio")
	_key(KEY_SPACE, false)
	await _frames(3)
	_key(KEY_SPACE, true)
	await _frames(3)
	_check(game.player.jumps_used == (2 if expect_double else 1), "Disponibilidad del doble salto")
	_key(KEY_SPACE, false)
	await _wait_until(func() -> bool: return game.player.grounded, 90, "Kuro vuelve al suelo")


func _run_cave() -> void:
	_key(KEY_SHIFT, true)
	_key(KEY_RIGHT, true)
	for step in range(1150):
		if game.player.position.x >= 6242 or game.place != "cave":
			break
		var current: KuroCave = game.stage
		var feet := game.player.position
		if step % 2 == 0:
			for enemy in ["dog", "goat"]:
				var actor: Sprite2D = current.sprites[enemy]
				if actor.visible and absf(actor.position.x - feet.x) < 130 and (actor.position.x - feet.x) * game.player.facing >= -12:
					_key(KEY_F, true)
					break
			if current.lion_shot.visible or current.dog_shot.visible:
				var shot := current.lion_shot if current.lion_shot.visible else current.dog_shot
				var ahead := shot.position.x - feet.x
				if ahead >= 0 and ahead < 135:
					_key(KEY_F, true)
				elif ahead >= 145 and ahead < 210 and game.player.grounded:
					_key(KEY_SPACE, true)
		else:
			_key(KEY_F, false)
			if step % 10 == 1:
				_key(KEY_SPACE, false)
		await process_frame
	_key(KEY_F, false)
	_key(KEY_SPACE, false)
	_key(KEY_RIGHT, false)
	_key(KEY_SHIFT, false)
	await _frames(3)
	_check(game.place == "cave" and game.player.position.x >= 6150, "Cruzar la cueva antes de recoger el cascabel")


func _climb() -> void:
	# Safe waypoints along the shoreline, in the same game units as the map.
	await _axis(324, true)
	await _walk(1430)
	await _axis(865, true)
	await _walk(1595)
	_key(KEY_UP, true)
	await _wait_until(func() -> bool: return game.progress.bridgeMudLearned, 220, "El barro hunde y devuelve a Kuro")
	_key(KEY_UP, false)
	await _frames(35)
	await _walk(2190)
	await _axis(1399, true)
	await _walk(697)
	await _axis(1987, true)
	await _walk(1154)
	await _axis(2027, true)
	_check(game.story.current_action() == "log", "Se encuentra el tronco")
	_key(KEY_E, true)
	await _wait_until(func() -> bool: return game.progress.bridgeLogProgress >= 1, 260, "Mantener E mueve el tronco")
	_key(KEY_E, false)
	await _frames(3)
	await _axis(2348, true)
	await _interact("bridge_postcard")
	_check(game.overlay.screen == "album", "Postal secreta del puente")
	await _capture("07-puente-postal")
	await _tap(KEY_ESCAPE)
	await _axis(2027, true)
	await _walk(1845)
	await _axis(2600, true)
	await _walk(497)
	await _axis(3160, true)
	await _walk(1720)
	await _axis(3494, true)
	await _interact("family")
	await _finish_dialogue()
	await _axis(3736, true)
	await _interact("island")
	await _arrive("valdivia")


func _check_resolution(window_size: Vector2i, tactile: bool, label: String) -> void:
	game.force_touch = tactile
	root.size = window_size
	await _frames(8)
	var hud_bounds := game.hud.get_global_rect()
	_check(hud_bounds.encloses(game.hud.life_label.get_global_rect()), "Vida visible en %s" % label)
	_check(hud_bounds.encloses(game.hud.place_label.get_global_rect()), "Ubicación visible en %s" % label)
	_check(is_equal_approx(game.camera.zoom.x, game.camera.zoom.y) and game.field.size.y > 100,
		"Escala uniforme del mundo en %s" % label)
	if tactile:
		var touch_bounds := game.touch.get_global_rect()
		var pixels_per_point := minf(root.size.x / game.size.x, root.size.y / game.size.y)
		for child in game.touch.get_children():
			if child.visible:
				_check(touch_bounds.encloses(child.get_global_rect()), "Botón táctil cabe en %s" % label)
				_check(child.size.y * pixels_per_point >= 42.0, "Tamaño del botón táctil en %s" % label)
		var x := game.player.position.x
		_touch(&"move_left", 1, true)
		_touch(&"jump", 2, true)
		await _frames(12)
		_check(game.player.position.x < x - 15 and not game.player.grounded, "Saltar y moverse con dos dedos en %s" % label)
		_touch(&"jump", 2, false)
		_touch(&"move_left", 1, false)
		await _wait_until(func() -> bool: return game.player.grounded, 90, "Suelta ambas acciones táctiles")


func _touch(id: StringName, index: int, pressed: bool) -> void:
	var event := InputEventScreenTouch.new()
	event.index = index
	event.pressed = pressed
	event.position = game.touch.widgets[id].get_global_rect().get_center()
	# Scene-tree events delivered here use the root viewport's logical resolution.
	game.touch._input(event)


func _check_legacy_import() -> void:
	var legacy := {
		"slot": 7, "name": "Desde el prototipo", "savedAt": null,
		"checkpoint": {"place": "bridge", "horizontal": 1.05, "depth": 3.28, "facing": -1},
		"progress": {"valdiviaTracksFound": true, "bridgeLogProgress": .43},
	}
	var file_path := folder.path_join("web.json")
	var file := FileAccess.open(file_path, FileAccess.WRITE)
	file.store_string(JSON.stringify(legacy))
	file.close()
	game.notebook._import_file(file_path)
	var imported := game.saves.load_file(game.saves.filename(2))
	_check(imported.slot == 2 and imported.checkpoint.facing == -1 and imported.progress.copoFollowing,
		"Importación preserva un guardado del prototipo web")
	_check(is_equal_approx(imported.progress.bridgeLogProgress, .43), "Importación conserva el avance del tronco")
	game.resume_from(imported)
	await _frames(6)
	_check(game.place == "bridge" and is_equal_approx(game.depth, 3.28 * KuroStage.HEIGHT),
		"La partida importada reanuda la altura guardada en el puente")
	_check(game.player.facing == -1 and is_equal_approx(game.player.position.x, KuroBridge.LOG_X),
		"La partida importada reanuda la posición horizontal y la orientación")


func _capture(name: String) -> void:
	if screenshots.is_empty() or DisplayServer.get_name() == "headless":
		return
	DirAccess.make_dir_recursive_absolute(screenshots)
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(screenshots.path_join(name + ".png"))
