class_name KuroStory
extends RefCounted

const W := KuroStage.WIDTH
const H := KuroStage.HEIGHT
const LABELS := {
	"enter_house": "Entrar a casa", "exit_house": "Salir a Barrio Yungay",
	"album": "Ver Álbum de Viaje", "window": "Mirar por la ventana",
	"chair": "Sentarse a leer", "leave_seat": "Levantarse",
	"street": "Volver a Barrio Yungay", "plaza": "Volver a Plaza Yungay",
	"mota": "Hablar con Mota", "museum": "Entrar al museo", "exit_museum": "Salir a Quinta Normal",
	"whale": "Revisar vitrina", "photo": "Sacar una foto", "mirador": "Mirar el paisaje",
	"train": "Tomar el tren", "return_train": "Tomar el tren a Santiago",
	"tizne": "Hablar con Tizne", "bell": "Recoger el cascabel",
	"river_bench": "Sentarse junto al río", "island_bench": "Sentarse junto al arrayán",
	"copo": "Hablar con Copo", "river": "Mirar el río",
	"return_bridge": "Volver al puente", "island": "Continuar a Isla Teja", "bridge_postcard": "Recoger la postal",
}
const MOTA := [
	["Mota", "¡Kuro! Ven a mirar esto. El diario dice que en Japón hay gatos que esperan trenes."],
	["Kuro", "¿Gatos que esperan trenes? ¿Y para qué?"],
	["Mota", "Quién sabe. Quizás tienen trabajo."],
	["Kuro", "¿Y tú esperarías el tren para ir al trabajo?"],
	["Mota", "Por supuesto. Aunque yo prefiero esperar la once."],
	["Kuro", "Eso sí que se te da bien."],
	["Mota", "Si algún día llegas a Japón, busca a los gatos de estación. Dicen que algunos tienen hasta uniforme."],
	["Mota", "Yo también quería viajar… pero descubrí que la Plaza Yungay tiene sombra después de almuerzo."],
	["Kuro", "Entonces tendré que viajar por los dos."],
	["Mota", "Eso. Y cuando vuelvas, me cuentas si encontraste un lugar con mejor once que la de aquí."],
]
const TIZNE := [
	["Tizne", "Oye… ¿eres turista?"],
	["Kuro", "Supongo. Llegué en el tren hace poquito."],
	["Tizne", "Conozco un lugar que no aparece en las guías."],
	["Kuro", "Eso suena como algo que debería preocuparme."],
	["Tizne", "O como algo que vale la pena descubrir. Perdí un cascabel allá arriba, en una cueva."],
	["Kuro", "¿Y por qué no vas a buscarlo tú?"],
	["Tizne", "Digamos que la cueva y yo no terminamos en muy buenos términos. Era de mi familia."],
	["Tizne", "Si quieres conocer el verdadero Valparaíso, podría mostrarte el camino."],
]
const TIZNE_RETURN := [
	["Tizne", "Volviste… y tienes el cascabel.", "neutral"],
	["Kuro", "La cueva no era como la contaste. Las sombras dejaron de atacar cuando lo hice sonar.", "annoyed"],
	["Tizne", "Pensé que si te decía la verdad, no ibas a ayudarme.", "remorseful"],
	["Kuro", "Entonces no era de tu familia.", "annoyed"],
	["Tizne", "No. Un coleccionista paga bien por cosas antiguas. Yo… necesitaba una salida.", "remorseful"],
]
const RESPONSES := {
	"precavido": {
		"line": "Quizás te habría ayudado. Pero ahora no sé si puedo creerte.",
		"reply": "Lo entiendo. Si vuelvo a pedirte algo, empezaré por la verdad.",
		"followUp": "No espero que confíes enseguida. Doña Bruma vive más arriba; puedes comprobarlo tú mismo.",
		"postscript": "P. D. Tener cuidado no cerró el camino; me ayudó a mirar mejor antes de seguir."
	},
	"comprensivo": {
		"line": "Podías pedírmelo. No necesitabas inventar una historia.",
		"reply": "No se me da bien pedir ayuda. Pero… gracias por volver.",
		"followUp": "Doña Bruma vive más arriba. Gracias por escucharme, incluso después de lo que hice.",
		"postscript": "P. D. A veces quien engaña también tiene miedo de pedir ayuda."
	},
	"aventurero": {
		"line": "La próxima vez dime la verdad. Probablemente habría venido igual.",
		"reply": "Hecho. Contigo ya veo que no hace falta adornar tanto las historias.",
		"followUp": "Doña Bruma vive más arriba. La próxima aventura te la cuento sin adornos… o con menos adornos.",
		"postscript": "P. D. Entré por curiosidad y volví con más preguntas. Quizás eso también sea una respuesta."
	}
}

var game


func _init(runtime: Control) -> void:
	game = runtime


func _between(x: float, low: float, high: float) -> bool:
	return low <= x and x <= high


func current_action() -> String:
	var player: KuroPlayer = game.player
	if not player.grounded or game.transitioning or game.fleeing:
		return ""
	if player.seat != "":
		return "leave_seat"

	var center := player.position.x
	# The web hotspots use the left edge of a 100 px frame.
	var x := center - 50.0
	var flags: Dictionary = game.progress
	match game.place:
		"house":
			if x <= W * .25:
				return "exit_house"
			if _between(x, W * .27, W * .39):
				return "chair"
			if _between(x, W * .40, W * .58):
				return "window"
			if x >= W * .67:
				return "album"
		"street":
			if _between(x, W * .07, W * .22):
				return "enter_house"
			if _between(x, W * .523 - 180, W * .523 + 155):
				return "mota"
			if _between(x, W * 1.32, W * 1.49):
				return "museum"
			if _between(x, W * 1.12, W * 1.27):
				return "mirador" if flags.quintaPhotoCollected else "photo"
		"plaza":
			if x <= 180:
				return "street"
		"quinta":
			if x <= 145:
				return "plaza"
			if _between(x, W * .38, W * .57):
				return "museum"
			if _between(x, W * .72, W - 115):
				return "mirador" if flags.quintaPhotoCollected else "photo"
		"museum":
			if x <= 75:
				return "exit_museum"
			if x >= W - 300 and not flags.whalePostcardCollected:
				return "whale"
		"station":
			if _between(x, W * .20, W * .50):
				return "mail"
			if _between(x, W * .58, W - 125):
				return "train"
		"valparaiso":
			if x <= 145:
				return "return_train"
			if _between(x, W * 1.24, W * 1.56):
				return "tizne"
			if _between(x, W * 2.60, W * 2.90):
				return "bruma"
		"cave":
			if not flags.caveBellCollected and absf(center - 5.0 - KuroCave.BELL_X) <= 115:
				return "bell"
		"valdivia":
			return _valdivia_action(x, center, flags)
		"bridge":
			return _bridge_action(center, game.depth, flags)
	return ""


func _valdivia_action(x: float, center: float, flags: Dictionary) -> String:
	var river_stage: KuroValdivia = game.stage
	if x <= 145:
		return "return_train"
	if absf(center - river_stage.bench_center(false)) < 68:
		return "river_bench"
	if absf(center - river_stage.bench_center(true)) < 68:
		return "island_bench"
	if flags.valdiviaBridgeCrossed and _between(x, W * 2.94, W * 3.04):
		return "return_bridge"
	if _between(x, W * 2.20, W * 2.52):
		return "tracks"
	if _between(x, W * 2.72, W * 3.05):
		return "passage"
	if _between(x, W * 1.80, W * 2.03):
		return "river"
	if absf(center - river_stage.companion.position.x) < 85:
		return "copo"
	return ""


func _bridge_action(center: float, depth: float, flags: Dictionary) -> String:
	if depth >= KuroBridge.TOP - 24:
		return "island"
	if float(flags.bridgeLogProgress) < 1 and absf(center - KuroBridge.LOG_X) < 85 and _between(depth, H * 3.20, H * 3.40):
		return "log"
	if not flags.bridgePostcardCollected and float(flags.bridgeLogProgress) >= 1 and absf(center - KuroBridge.LOG_X) < 55 and _between(depth, H * 3.68, H * 3.90):
		return "bridge_postcard"
	if absf(center - W * 1.52) < 135 and _between(depth, H * 5.46, H * 5.80):
		return "family"
	for index in range(KuroBridge.CLUES.size()):
		var clue: Array = KuroBridge.CLUES[index]
		if index not in game.stage.clue_seen and absf(center - clue[0] * W) < 58 and absf(depth - clue[1] * H) < 54:
			return "clue_%d" % index
	return ""


func label(id: String) -> String:
	var flags: Dictionary = game.progress
	match id:
		"tracks":
			return "Mirar las huellas" if flags.valdiviaTracksFound else "Investigar huellitas"
		"passage":
			return "Entrar a la subida" if flags.valdiviaPassageFound else "Investigar bajo el puente"
		"family":
			return "Visitar a los coipos" if flags.valdiviaFamilyHelped else "Ayudar a los coipos"
		"bruma":
			return "Devolver el cascabel" if flags.caveBellCollected and not flags.brumaBellReturned else "Hablar con Doña Bruma"
		"log":
			return "Mantén %s para empujar · %d%%" % ["Acción" if game.touch.visible else "E", roundi(float(flags.bridgeLogProgress) * 100)]
		"mail":
			if flags.firstLetterSent and flags.returnedFromValparaiso and flags.tizneResponse != "":
				return "Releer carta de la abuelita" if flags.grandmotherReplyRead else "Leer carta de la abuelita"
			return "Revisar Estafeta" if flags.firstLetterSent else "Enviar carta a la abuelita"
	if id.begins_with("clue_"):
		return KuroBridge.CLUES[int(id.get_slice("_", 1))][2]
	return LABELS.get(id, "")


func perform(id: String) -> void:
	match id:
		"enter_house": game.change_place("house")
		"exit_house": game.change_place("street", "from_house")
		"street": game.change_place("street", "from_plaza")
		"plaza": game.change_place("street", "from_quinta")
		"museum": game.change_place("museum")
		"exit_museum": game.change_place("street", "from_museum")
		"return_bridge": game.change_place("bridge", "from_island")
		"album": game.notebook.open_album()
		"window": game.speak([["Kuro", "Qué bonito está el jacarandá hoy."]])
		"chair": game.sit("reading", W * .34 + 50)
		"river_bench", "island_bench": game.sit("bench", game.stage.bench_center(id == "island_bench"))
		"leave_seat": game.stand_up()
		"mota": _talk_to_mota()
		"photo":
			game.mark("quintaPhotoCollected")
			game.notebook.open_photo()
		"whale":
			game.mark("whalePostcardCollected")
			game.speak([
				["Álbum de Viaje", "Postal: La ballena de Quinta Normal"],
				["Álbum de Viaje", "Algunas criaturas recorren océanos enteros. Kuro se pregunta cuántos lugares podría conocer él."],
			])
		"mirador": game.speak([["Kuro", "Desde aquí todo se ve distinto. Me alegra haber guardado este momento."]])
		"train", "return_train": game.notebook.open_map()
		"mail": _mail()
		"tizne": _talk_to_tizne()
		"bruma": _talk_to_bruma()
		"bell":
			game.mark("caveBellCollected")
			game.play_cue("bell")
			game.speak([
				["Kuro", "Está cubierto de hollín… pero todavía es un cascabel."],
				["Kuro", "¡Sonó! Siento las patas mucho más ligeras…"],
				["Nuevo movimiento", "Doble salto desbloqueado · Vuelve a saltar mientras estás en el aire."],
			])
		"copo": _talk_to_copo()
		"river": game.speak([["Kuro", "Desde este muelle se ve hasta la otra orilla. Me pregunto qué habrá más allá."]])
		"tracks":
			if not game.progress.copoFollowing:
				game.stage.join_player(game.player.position.x)
			game.progress.copoFollowing = true
			game.mark("valdiviaTracksFound")
			game.speak([
				["Kuro", "Son huellitas de barro… van desde los puestos hacia el puente."],
				["Copo", "¡Te dije que no eran mías! Mi gorro no deja huellas."],
				["Kuro", "Sigámoslas. Alguien pequeño pasó por aquí."],
			])
		"passage": _passage()
		"family": _coipo_family()
		"island":
			game.progress.valdiviaBridgeCrossed = true
			game.change_place("valdivia", "at_island", true)
		"log": game.push_log(.065)
		"bridge_postcard":
			game.mark("bridgePostcardCollected")
			game.notebook.open_album("bridgePostcardCollected")
		_:
			if id.begins_with("clue_"):
				var idx := int(id.get_slice("_", 1))
				game.stage.clue_seen.append(idx)
				game.speak([["Kuro", KuroBridge.CLUES[idx][3]]])


func _talk_to_mota() -> void:
	if game.progress.motaConversationComplete:
		game.speak([["Mota", "La sombra sigue buena, Kuro. Cuando vuelvas, me cuentas del viaje."]])
	else:
		game.speak(MOTA, game.mark.bind("motaConversationComplete"))


func _talk_to_tizne() -> void:
	var flags: Dictionary = game.progress
	var reply: String = flags.tizneResponse
	if reply != "":
		game.speak([["Tizne", RESPONSES[reply].followUp, "remorseful"]])
	elif flags.caveBellCollected:
		var lines: Array = TIZNE_RETURN.duplicate(true)
		if flags.brumaBellReturned:
			lines[0][1] = "Volviste… ¿encontraste el cascabel?"
			lines[1][1] = "Sí. Ya se lo devolví a Doña Bruma. Ella me contó a quién pertenecía."
		game.speak(lines, _tizne_choices)
	elif flags.tizneConversationComplete:
		game.speak([["Tizne", "No tienes que decidir ahora. Los cerros no se irán a ninguna parte."]])
	else:
		game.speak(TIZNE, game.mark.bind("tizneConversationComplete"))


func _tizne_choices() -> void:
	var ui: KuroOverlay = game.overlay
	ui.open_screen("choices", "¿Qué le dices a Tizne?", 260, ui.close_screen)
	var choices := ["precavido", "comprensivo", "aventurero"]
	for index in range(choices.size()):
		var choice: String = choices[index]
		var button := ui.action("%d · %s" % [index + 1, RESPONSES[choice].line], _tizne_response.bind(choice))
		button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		button.custom_minimum_size.y = 55
	ui.focus_first()


func _tizne_response(choice: String) -> void:
	var answer: Dictionary = RESPONSES[choice]
	game.mark("tizneResponse", choice)
	game.speak([
		["Kuro", answer.line, "annoyed"],
		["Tizne", answer.reply, "remorseful"],
		["Tizne", "El cascabel pertenece a Doña Bruma. Guiaba a los gatitos del barrio cuando bajaba la neblina.", "remorseful"],
		["Kuro", "Ya se lo devolví. Ella me contó por qué era importante." if game.progress.brumaBellReturned else "Entonces debería devolvérselo.", "annoyed"],
		["Álbum de Viaje", "Nueva postal: Al volver de la Cueva del Chivato."],
	])


func _talk_to_bruma() -> void:
	if game.progress.brumaBellReturned:
		game.speak([
			["Doña Bruma", "Cuánta nostalgia… Cuando vuelva la neblina, podré hacerlo sonar otra vez."],
			["Kuro", "Todavía siento su impulso en mis patitas."],
		])
	elif game.progress.caveBellCollected:
		var reunion := [
			["Doña Bruma", "Volviste… Ese cascabel que llevas, ¿lo encontraste en la cueva?"],
			["Kuro", "Sí. Perdón por llevármelo. Vine a devolvérselo."],
			["Doña Bruma", "Lo creía perdido. Solía hacerlo sonar para que los gatitos encontraran el camino entre la neblina."],
			["Doña Bruma", "¿Cómo te llamas, pequeño viajero?"],
			["Kuro", "Kuro."],
			["Doña Bruma", "Gracias, Kuro. El cascabel vuelve conmigo, pero el impulso que te dio se quedará contigo."],
		]
		if not game.progress.brumaMet:
			reunion = [
				["Doña Bruma", "Espera… Ese cascabel que llevas, ¿dónde lo encontraste?"],
				["Kuro", "En la cueva. Perdón, no sabía que era suyo. Se lo devuelvo."],
				["Doña Bruma", "Gracias. Soy Bruma. Solía hacerlo sonar para que los gatitos encontraran el camino entre la neblina."],
				["Kuro", "Yo soy Kuro. Me ayudó a salir de allí."],
				["Doña Bruma", "Me alegra. El cascabel vuelve conmigo, pero el impulso que te dio se quedará contigo."],
			]
		game.speak(reunion, func() -> void:
			game.progress.brumaMet = true
			game.mark("brumaBellReturned"))
	else:
		game.speak([
			["Doña Bruma", "Soy Bruma. Antes guiaba a los gatitos de estos cerros con el sonido de mi cascabel."],
			["Doña Bruma", "Se perdió en la cueva, más arriba. Si entras, ve con cuidado."],
			["Kuro", "Si lo encuentro, se lo traeré."],
		], game.mark.bind("brumaMet"))


func _mail() -> void:
	var flags: Dictionary = game.progress
	if flags.firstLetterSent and flags.returnedFromValparaiso and flags.tizneResponse != "":
		game.mark("grandmotherReplyRead")
		game.speak([
			["Estafeta Gatuna", "¡Llegó una carta para Kuro! Es de tu abuelita."],
			["Abuelita", "¡Kuro, mi niño! Me llegó tu primera carta. Me alegró saber que llegaste bien a Mapocho."],
			["Abuelita", "Cuando visites otro lugar, mándame otra, ¿sí? Así puedo imaginar por dónde andan tus patitas… y saber que estás bien."],
			["Kuro", "Le mandaré una desde el próximo lugar."],
		])
	elif flags.firstLetterSent:
		game.speak([["Estafeta Gatuna", "Tu carta para la abuelita ya va en camino."]])
	else:
		game.notebook.open_letter()


func _talk_to_copo() -> void:
	if game.progress.valdiviaFamilyHelped:
		game.speak([
			["Copo", "¡La familia ya tiene dónde refugiarse! Gracias por ayudarme, Kuro."],
			["Kuro", "Me alegra haber seguido esas huellitas."],
			["Copo", "Cuando llueva, estarán protegidos bajo los juncos."],
		], game.mark.bind("copoFollowing"))
	else:
		game.speak([
			["Copo", "Hola, soy Copo. ¿De dónde vienes?"],
			["Kuro", "Vengo de Santiago. ¿Me acompañas a conocer la feria?"],
			["Copo", "Claro. Hay unas huellas raras por ahí y todos bromean con que son mías."],
		], game.mark.bind("copoFollowing"))


func _passage() -> void:
	if not game.progress.valdiviaTracksFound:
		game.speak([["Kuro", "Hay una subida oculta bajo el puente. Antes quiero ver adónde llevan esas huellas de la feria."]])
	elif game.progress.valdiviaPassageFound:
		game.change_place("bridge")
	else:
		game.mark("valdiviaPassageFound")
		game.speak([
			["Copo", "Mira, las huellas siguen por aquí. Hay plataformas para subir por el puente."],
			["Kuro", "Voy a subir saltando. Isla Teja nos espera arriba."],
		], game.change_place.bind("bridge"))


func _coipo_family() -> void:
	if game.progress.valdiviaFamilyHelped:
		game.speak([["Copo", "Ahora tienen un rincón seco. Qué bueno que seguimos las huellas."]])
	else:
		game.mark("valdiviaFamilyHelped")
		game.speak([
			["Kuro", "¡Eran coipos de verdad! Los pequeños están temblando bajo la lluvia."],
			["Copo", "Hay juncos y ramas secas junto al jardín. Podemos cubrir la entrada de su refugio."],
			["Kuro", "Listo. Ya tienen un lugar calentito donde quedarse."],
			["Copo", "Mi gorro les manda saludos."],
			["Álbum de Viaje", "Nueva postal: Un refugio junto al río."],
		])
