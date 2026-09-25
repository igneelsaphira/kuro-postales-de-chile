# Kuro — Hoja de ruta del prototipo

## Idea base

Kuro es un gatito viajero que recorre Chile para conocer sus paisajes, sacar fotos en miradores y mandarle cartas a su abuelita gata.

El juego será un plataformas de exploración cozy, con un mapa de nodos de norte a sur.

## Orden de trabajo

### 1. Diseñar el mapa de nodos en papel

- Trabajar primero con cajas, flechas y nombres simples.
- No hacer arte final todavía.
- Diseñar solo la primera zona jugable: Santiago/Valparaíso.
- Usar aproximadamente 8–12 nodos.
- Marcar qué nodos están disponibles desde el inicio y cuáles requieren una habilidad.

### 2. Probar el recorrido de Santiago

Recorrido inicial sugerido:

1. Inicio de Kuro.
2. Tejados tutorial.
3. Plaza o calle.
4. Primer mirador.
5. Estafeta Gatuna.
6. Camino bloqueado por agua.
7. Desvío para explorar.
8. Tótem del Agua.
9. Regreso al camino bloqueado.
10. Cruce del agua.
11. Nuevo mirador o salida de la zona.

### 3. Diseñar el bloqueo del agua

- Kuro ve el agua antes de obtener el tótem.
- No puede avanzar porque todavía le tiene miedo.
- El jugador debe devolverse y explorar un desvío.
- Encuentra el Tótem del Agua.
- Kuro aprende a cruzar, idealmente con una pequeña reacción emocional.
- El desvío debe ser claro y no demasiado largo, para que volver se sienta como exploración y no como castigo.

### 4. Hacer un standalone pequeño

Crear una prueba jugable sencilla en web con:

- Kuro moviéndose.
- Salto básico.
- Un mapa o recorrido pequeño.
- Un bloqueo de agua.
- El Tótem del Agua.
- La posibilidad de volver y cruzar.

El objetivo es comprobar si moverse, explorar y volver se sienten bien.

### 5. Recién después añadir más contenido

- Cámara con deadzone, look-ahead y lerp.
- Parallax de tres capas.
- Movimiento avanzado: salto variable, coyote time, jump buffer, pique gatuno y doble salto.
- NPCs e historia ambiental.
- Fotos, polaroids, Estafeta Gatuna y cartas.
- Arte consistente por paleta de zona.
- Música por zona y leitmotiv mutante.

## Zonas futuras

1. Norte desértico.
2. Santiago/Valparaíso.
3. Sur verde, con Isla Mocha como secreto.
4. Patagonia y Chiloé, con palafitos.
5. Cordillera final vertical.

Especiales posibles: Rapa Nui y Antártida.

## Regla importante

Primero validar la sensación de jugar una zona pequeña. No construir todo Chile antes de saber si Kuro se siente rico al moverse y explorar.

## Estado actual del prototipo

- Casa de Kuro con Álbum de Viaje interactivo.
- Barrio Yungay, Plaza Yungay y Quinta Normal forman un único recorrido exterior continuo.
- Mota y su primera conversación completa.
- Museo de la ballena explorable.
- Primera postal coleccionable: **La ballena de Quinta Normal**.
- La postal queda guardada aunque se recargue el juego y aparece como una página real dentro del álbum.
- Primer rincón fotográfico en Quinta Normal, con destello, polaroid y recuerdo persistente.
- El Álbum de Viaje permite cambiar entre la postal y la primera foto usando las flechas.
- Quinta Normal conecta con una primera versión explorable de **Estación Mapocho**.
- La estación incluye un tren antiguo, una ruta futura bloqueada y la primera **Estafeta Gatuna**.
- Kuro puede enviarle su primera carta a la abuelita; el envío queda guardado y la Estafeta permite revisar su estado sin marcadores flotantes.
- Primera pasada gráfica de la casa terminada: exterior ilustrado de Barrio Yungay e interior cozy coherente.
- Escala de Kuro corregida en la casa y puntos interactivos alineados con la puerta y el estante del álbum.
- Ambientación suave añadida: pétalos de jacarandá, luz interior, polvo dorado y brillo del álbum.
- Kuro puede mirar por la ventana y comentar cómo Santiago se siente enorme desde su casa.
- El sillón es interactivo: Kuro puede sentarse a leer con una animación tranquila y levantarse cuando quiera.
- La postura de lectura queda anclada continuamente al cojín; si la ventana cambia de tamaño mientras Kuro está sentado, su posición se recalcula y no se separa del sillón.
- Al mirar por la ventana, Kuro comenta de forma sencilla «Qué bonito está el jacarandá hoy» y los pétalos violetas se vuelven más visibles sobre la vista de Santiago.
- El álbum ya no usa una estrella genérica ni un símbolo ambiguo: lleva una pequeña etiqueta de cuero con la inicial «K», que brilla suavemente y escala junto con el escenario.
- Barrio Yungay tiene un segundo tramo ilustrado que continúa la calle hasta Plaza Yungay.
- La unión conserva la vereda, el skyline, las fachadas, faroles y jacarandás sin volver a los bloques provisionales.
- Plaza Yungay usa una sola ilustración continua: el Monumento al Roto Chileno queda a la izquierda y el sendero sombreado hacia Quinta Normal a la derecha.
- Mota permanece como sprite animable sobre un espacio diseñado especialmente para él; Kuro y Mota comparten correctamente la línea del suelo.
- El letrero hacia Quinta cambia de color después de conversar con Mota y reemplaza el antiguo bloqueo visual provisional.
- Al ser una escena unificada ya no necesita cortes, parches ni árboles añadidos para ocultar uniones.
- Mota fue reducido y suavizado; una sombra bajo su silla lo integra con la línea del suelo y mantiene su apariencia gordita sin verse gigante.
- Kuro, Mota y la silla comparten la superficie superior de la vereda; los márgenes transparentes de los sprites se compensan para que no floten ni se hundan.
- Mota tiene un rincón habitual de once junto al sendero: una mesita baja con taza, pancito y diarios doblados explica por qué está sentado allí y refuerza su personalidad viajera y hogareña.
- Quinta Normal conserva el museo y el mirador floral, pero ahora comparte la misma línea de suelo y panorámica con Plaza Yungay.
- El mirador de Quinta Normal no lleva un marcador físico: el jardín y la baranda comunican el lugar, y la indicación para fotografiar aparece solo al acercarse.
- Estación Mapocho usa una escena completa de una pantalla: entrada desde Quinta a la izquierda, Estafeta Gatuna interactiva en el centro y tren antiguo a la derecha.
- La Estafeta Gatuna es un buzón rojo visto de frente, con orejas, emblema de sobre y bandera de correo; en Mapocho queda instalada dentro del nicho de piedra y debe conservar esta silueta reconocible cuando aparezca en otras zonas.
- Kuro usa una línea de suelo más baja dentro del museo para que sus patas descansen sobre las baldosas y no parezca flotar.
- El tren de Estación Mapocho abre un primer mapa funcional de Chile. Santiago aparece completado; Valparaíso figura como próxima ruta y las zonas futuras permanecen bloqueadas.
- Desde el mapa solo se puede viajar a escenarios ya construidos: Barrio Yungay, Plaza Yungay, Quinta Normal y Estación Mapocho.
- Valparaíso ya tiene su primera escena jugable: **Estación Puerto**, con plataforma costera, tren antiguo, vista del puerto y los cerros.
- El nodo de Valparaíso está disponible en el mapa y funciona con teclado o toque; permite viajar desde Estación Mapocho hasta Estación Puerto.
- En Estación Puerto, Kuro puede volver al mapa acercándose al tren de la izquierda. La continuación hacia Plaza Sotomayor permanece como la próxima ruta por construir.

### Siguiente paso sugerido

Probar el mapa de nodos y luego construir la primera ruta nueva: **Valparaíso**. Hasta que exista su escenario, el nodo permanece visible pero bloqueado.

## Primer mapa: Santiago y conexión hacia Valparaíso

```text
[Casa de Kuro — Barrio Yungay]
              |
       [Plaza Yungay]
          /       \
 [Quinta Normal]  [Barrio Brasil]
          |          |
   [Estación Mapocho] [Centro de Santiago]
          \          /
           [Cerro Santa Lucía]
                    |
             [Mirador desbloqueado]
                    |
          [Ruta hacia Valparaíso]
```

### Función de cada nodo

1. **Casa de Kuro — Barrio Yungay:** inicio, descanso y futuro punto de introducción.
2. **Plaza Yungay:** primer espacio de exploración tranquila.
3. **Quinta Normal:** primer nivel más abierto y primer mirador opcional.
4. **Barrio Brasil:** desvío con NPCs, secretos y coleccionables.
5. **Estación Mapocho:** conexión importante y posible Estafeta Gatuna.
6. **Centro de Santiago:** nivel urbano con calles, alturas y atajos.
7. **Cerro Santa Lucía:** primer desafío vertical suave.
8. **Mirador desbloqueado:** foto importante y confirmación de progreso.
9. **Ruta hacia Valparaíso:** nodo de salida de la zona inicial.

### Bloqueos iniciales

- La Cordillera aparece en el mapa, pero queda bloqueada hasta completar las zonas base.
- Chiloé, Isla Mocha, Rapa Nui y Antártida aparecen como postales o nodos especiales bloqueados.
- El Tótem del Agua se reserva para Chiloé, donde el agua y los palafitos serán parte natural del nivel.

## Ajustes de los primeros nodos

### Nodo 1: Casa de Kuro — Barrio Yungay

En vez de una postal suelta, Kuro tendrá un **Álbum de Viaje**. Allí se guardarán:

- Postales encontradas.
- Fotos de los miradores.
- Posdatas o pequeños recuerdos.
- Respuestas de la abuelita.
- Curiosidades desbloqueadas sobre los lugares visitados.

El álbum será una forma tranquila de revisar el progreso y también puede mostrar páginas vacías para lugares que Kuro todavía no conoce.

### Nodo 2: Plaza Yungay

El NPC principal será **Mota**, un gato grande, gordito y relajado, diseñado con rasgos propios. La imagen de referencia sirve únicamente para la idea general de personalidad y postura; Mota no copiará su patrón de manchas, diseño ni detalles visuales.

Mota puede estar sentado leyendo un diario, mirando un mapa o descansando en una banca. Su función será despertar la curiosidad de Kuro hablando de:

- Otros países y lugares lejanos.
- Costumbres curiosas de distintos sitios.
- Viajes que nunca se atrevió a hacer.
- Pistas suaves sobre futuros destinos de Chile.

Mota no entregará misiones largas al principio. Su conversación será breve, cálida y opcional, pero ayudará a que Kuro quiera conocer el mundo.

### Primera conversación entre Kuro y Mota

**Mota:**

“¡Kuro! Ven a mirar esto. El diario dice que en Japón hay gatos que esperan trenes.”

**Kuro:**

“¿Gatos que esperan trenes? ¿Y para qué?”

**Mota:**

“Quién sabe. Quizás tienen trabajo.”

**Kuro:**

“¿Y tú esperarías el tren para ir al trabajo?”

**Mota:**

“Por supuesto. Aunque yo prefiero esperar la once.”

**Kuro:**

“Eso sí que se te da bien.”

**Mota:**

“Si algún día llegas a Japón, busca a los gatos de estación. Dicen que algunos tienen hasta uniforme.”

**Mota:**

“Yo también quería viajar… pero descubrí que la Plaza Yungay tiene sombra después de almuerzo.”

**Kuro:**

“Entonces tendré que viajar por los dos.”

**Mota:**

“Eso. Y cuando vuelvas, me cuentas si encontraste un lugar con mejor once que la de aquí.”

## Sistema de conversaciones

Las conversaciones aparecerán en un cuadro de texto en la parte inferior, inspirado en los juegos clásicos:

- Retrato pequeño del personaje que habla.
- Nombre del personaje.
- Texto que aparece letra por letra.
- Sonido suave asociado a la escritura.
- Indicador para avanzar al siguiente texto.
- Botón para mostrar la frase completa inmediatamente.
- Velocidad de texto ajustable.
- Opción de saltar conversaciones ya vistas.

La primera versión del prototipo solo necesita el cuadro, el nombre, el efecto de escritura y un botón para avanzar.

### Dirección visual elegida

Las conversaciones ocurrirán dentro de la escena, no en una pantalla separada:

- Kuro y los NPCs permanecen visibles en la parte superior.
- El cuadro ocupa la parte inferior.
- El cuadro tendrá bordes suaves y ondulados, como una postal o una hoja de álbum.
- Usará colores claros y acogedores.
- No será necesario un retrato grande porque los personajes ya estarán presentes en la escena.
- Los personajes podrán tener pequeñas animaciones mientras hablan: mover las orejas, la cola o cambiar de postura.
- El texto aparecerá lentamente, con opción de mostrar la frase completa.

## Primera misión de Valparaíso: la Cueva del Chivato

La misión se inspira libremente en la leyenda porteña de la **Cueva del Chivato**, pero no explicará de forma literal qué ocurrió allí. El terror quedará sugerido para que funcione como misterio para quienes no conozcan la historia y como un guiño más oscuro para quienes sí la conozcan.

### Tizne

- Tizne es un gato callejero original del juego; su nombre viene del hollín y no pertenece a la leyenda histórica.
- No conoce a Kuro de antemano. Se acerca al notar que parece turista.
- Inicio provisional de la conversación: «Oye… ¿eres turista? Conozco un lugar que no aparece en las guías».
- Le pide recuperar un cascabel y afirma falsamente que perteneció a su familia.
- Su motivación será venderlo a un coleccionista, pero no quedará condenado para siempre: podrá reaparecer más adelante e intentar reparar lo que hizo.

### La verdad del cascabel

- El cascabel pertenecía a **Doña Bruma**, una gata anciana que guiaba a los gatitos del barrio cuando la neblina cubría los cerros.
- Antes de entrar, un jugador precavido puede hablar con ella y conocer la historia.
- Un jugador aventurero puede entrar inmediatamente y descubrir la verdad dentro de la cueva.
- Las dos rutas son válidas y ninguna representa la respuesta moral correcta.

### Chivatos de Hollín

- Son sombras incompletas con formas de distintos animales.
- Al principio Kuro les teme y ellas escupen pequeñas masas de hollín.
- El zarpazo de Kuro no las mata: solo las dispersa durante unos segundos.
- No se confirma si son espíritus, recuerdos de la cueva o criaturas formadas por la suciedad.
- Al recuperar el cascabel dejan de atacar y sus siluetas se vuelven más claras.
- Durante el regreso, Kuro deja de sentir miedo y comienza a sentir curiosidad y lástima por ellas.
- No aparecerá una figura final del gran Chivato; el misterio permanecerá en estos seres pequeños.

### Cascabel y doble salto

- El cascabel está opaco y cubierto de hollín cuando Kuro lo encuentra.
- Al activarse suena claramente una sola vez y desprende un pulso dorado.
- Desbloquea el doble salto.
- El segundo salto muestra un pequeño destello dorado bajo las patitas y unas pocas partículas suaves.
- El cascabel no suena con cada salto para evitar que el efecto resulte agotador.
- Solo volverá a sonar en momentos narrativos importantes.
- El regreso por la cueva funciona como tutorial seguro del doble salto y puede abrir una ruta superior opcional.

### Primera decisión de personalidad

Cuando Tizne confiesa «Pensé que si te decía la verdad, no ibas a ayudarme», el jugador podrá responder de distintas maneras:

1. **Precavido:** «Quizás te habría ayudado. Pero ahora no sé si puedo creerte».
2. **Comprensivo:** «Podías pedírmelo. No necesitabas inventar una historia».
3. **Aventurero:** «La próxima vez dime la verdad. Probablemente habría venido igual».

La respuesta cambia la posdata del Álbum y la relación posterior con Tizne, pero no bloquea el progreso.

### Posdata provisional

> Al entrar parecían monstruos. Al volver, pensé que quizás ellas también tenían miedo.

El tema de fondo no tendrá una única respuesta: prevenir el peligro y atreverse a descubrir serán dos maneras legítimas de jugar. La idea central será que tener cuidado no significa dejar de vivir, y ser valiente no significa ignorar el peligro.

## Avance jugable de Valparaíso

- Estación Puerto ya funciona como punto de llegada y permite tomar el tren de regreso a Santiago.
- Estación Puerto, el paseo costero intermedio y Plaza Sotomayor forman ahora un único escenario exterior continuo construido con una sola imagen panorámica 3:1.
- Kuro puede caminar entre los tres sin fundidos ni cambios de pantalla; la cámara lo sigue durante todo el recorrido.
- El paseo intermedio desciende suavemente para unir de manera natural la altura del andén con la de la plaza.
- Plaza Sotomayor usa una escena propia, inspirada en el monumento, los edificios históricos, el puerto y los cerros de Valparaíso.
- El tren de regreso se encuentra únicamente en el extremo izquierdo del recorrido.
- El camino hacia los cerros no dependerá de hablar con Tizne y permanecerá abierto.
- Plaza Sotomayor ya continúa hacia un segundo panorama explorable: una calle ascendente entre fachadas de colores, balcones floridos, escaleras, vista al puerto y un funicular lejano.
- El nuevo tramo termina en la entrada exterior de la Cueva del Chivato. Kuro ya puede entrar al primer panorama interior; los ataques y el cascabel interactivo se construirán a continuación.
- La altura jugable sube de manera gradual desde la plaza hasta la cueva, mientras la cámara conserva el mismo seguimiento continuo.
- La unión entre Plaza Sotomayor y los cerros queda escondida por la arquitectura; el recorte conserva el cielo original del lado izquierdo para evitar un parche rectangular de otro cielo.
- La línea de suelo del tramo ascendente se interpola de forma continua y mantiene las patas de Kuro apoyadas en el pavimento.

### Prototipo aplicable de la Cueva del Chivato

- El interior será un corredor largo y continuo: la entrada introduce la amenaza, el centro aumenta la presión y el extremo final contiene el cascabel.
- Los seres de hollín serán sprites transparentes separados del fondo. Compartirán un cuerpo base modular y cambiarán orejas, pico, cola y postura para sugerir distintos animales sin dibujar enemigos completos desde cero.
- Cada criatura tendrá cuatro estados claros: oculta, aviso visible, escupitajo de hollín y retirada. El aviso dará tiempo para saltar o responder.
- Kuro puede dar un zarpazo corto con `F` para devolver las pelotas de hollín; en móvil aparece un botón contextual. Si la pelota devuelta alcanza al lobo marino, sólo lo dispersa y asusta durante un instante: no lo mata.
- Cada impacto oscurece un poco el pelaje de Kuro. Al tercero queda cubierto de hollín, dice «¡Ay, no! ¡Qué miedooo!» y sale corriendo de la cueva hacia Valparaíso, evitando una barra de vida o una pelea larga.
- El cascabel estará opaco y cubierto de hollín. Al recogerlo cambiará el estado de la cueva: las criaturas dejarán de atacar y sus siluetas animales se distinguirán mejor durante el regreso.
- El regreso permitirá que Kuro pase del miedo a la compasión y se pregunte qué eran esos seres, sin explicarlo de forma literal.
- En móvil aparece un único botón contextual de zarpazo; caminar, saltar y esquivar conservan los controles táctiles existentes.
- La cueva usa un recorrido lineal continuo de seis pantallas contenido en una sola imagen panorámica larga, sin cortes durante la carrera. No existen bifurcaciones ni bocas interiores que parezcan caminos alternativos.
- El panorama usa pixel art fino y nítido, con grupos de píxeles pequeños semejantes a los de la casa de Kuro; no utiliza desenfoque ni bloques sobredimensionados.
- El archivo de juego está preescalado a 7728 × 724, la proporción real del recorrido de seis pantallas. El fondo utiliza interpolación normal al reducirse, mientras los sprites conservan `image-rendering: pixelated`; así la cueva no amplía píxeles ni produce aliasing al correr.
- Durante la ida, una máscara casi negra sigue a Kuro y sólo revela un círculo pequeño a su alrededor. Los bordes de la cueva y las criaturas permanecen ocultos hasta que están peligrosamente cerca.
- Al recoger el cascabel, la máscara se aclara gradualmente y el regreso muestra la piedra azul, los reflejos húmedos y las formas más claras de los seres. La sombra circular continúa siguiendo a Kuro, pero con menor intensidad.
- El cascabel es un sprite independiente del fondo: desaparece al recogerlo y activa el estado visual del regreso.
- El lobo marino de hollín será la criatura piloto. Su sprite usa cuatro cuadros de respiración y acecho más un quinto cuadro de ataque con la boca abierta, separados del fondo y preparados para animarse por estados. Es una silueta azul-negra con ojos blancos sin pupilas y bordes que se disuelven en partículas de hollín.
- El lobo marino comienza orientado hacia la entrada. Si Kuro logra sobrepasarlo, se da vuelta para seguirlo con la mirada y dispara la siguiente pelota hacia su nueva posición.
- Cuando Kuro entra en su alcance, el lobo marino levanta la cabeza durante un aviso de 650 ms. Después abre la boca durante 110 ms y recién entonces escupe una pelota de hollín hacia la entrada. El ataque no ilumina ni rodea de brillo todo su cuerpo: los ojos blancos y la silueta bastan para leerlo en la oscuridad.
- La pelota es una entidad independiente con gravedad: toca el suelo, rebota una sola vez con menor velocidad y se desarma en el segundo contacto. Esto permitirá añadir después colisión y devolución mediante el zarpazo sin rehacer la animación del animal.
- El reparto inicial queda compuesto por cabrito, perro encorvado, ave tiznada y lobo marino. Todos comparten hollín y ojos verde mar, pero conservan siluetas y movimientos reconocibles.
- Cada acción tendrá su propia tira de sprites —reposo, aviso, ataque y retirada— y el proyectil será una entidad separada para poder esquivarlo o devolverlo con el zarpazo.
- Si Kuro vuelve a la entrada antes de conseguir el cascabel, dice «¡Ay, no! ¡Qué miedooo!» y sale corriendo; retirarse no castiga al jugador.

### Primer encuentro con Tizne

- Tizne aparece provisionalmente en Plaza Sotomayor como un gato joven, delgado y callejero.
- Su diseño usa pelaje gris hollín, ojos verde mar, una pequeña marca en la oreja y un pañuelo verde azulado gastado.
- Su aspecto busca transmitir astucia y cautela sin presentarlo inmediatamente como un villano.
- La primera conversación ya se puede jugar: Tizne reconoce que Kuro parece turista, menciona un lugar que no aparece en las guías y le habla del cascabel perdido en una cueva.
- Hablar con Tizne es opcional: Kuro puede pasar de largo y continuar hacia los cerros.
- La frase «O como algo que vale la pena descubrir» introduce el contraste entre actuar con cuidado y atreverse a explorar.
- El dibujo actual es un boceto conceptual provisional; se convertirá en sprites animados después de aprobar su aspecto y tamaño dentro de la escena.

### Regla visual del proyecto

- Los personajes y objetos interactivos definitivos deben estar dibujados como pixel art real, no como ilustraciones suaves reducidas de tamaño.
- Tizne conserva su boceto pintado únicamente como referencia conceptual; su versión jugable ya utiliza pixel art.
- Plaza Sotomayor ya fue convertida a pixel art conservando su composición y colores.
- Los demás fondos creados hasta ahora se conservarán mientras se prueba el recorrido, pero se convertirán uno por uno al mismo estilo antes de considerarlos definitivos.

### Regla de continuidad del mundo

- Los lugares exteriores cercanos se conectarán mediante calles, senderos o paisajes intermedios dentro de un mismo escenario desplazable.
- No habrá fundido entre hitos de una misma ciudad o zona cuando Kuro pueda llegar caminando.
- En el tramo ascendente de Valparaíso, la altura de Kuro sigue la pendiente hasta la boca de la cueva para mantener sus patas apoyadas sobre la vereda, también durante la huida automática.
- Las transiciones de pantalla se reservarán para interiores, cuevas, trenes y viajes entre regiones.
- Los NPCs opcionales podrán llamar la atención de Kuro, pero no bloquearán físicamente las rutas principales.

### Cámara del recorrido

- La cámara utiliza una zona muerta central para no reaccionar a cada pequeño movimiento de Kuro.
- El adelanto de cámara apunta suavemente hacia la dirección de avance.
- Al detenerse, el adelanto desaparece de manera gradual para evitar tirones bruscos.
- Cuando varios lugares formen un solo recorrido, se preferirá una ilustración panorámica única antes que pegar fondos con transparencias.
- El panorama definitivo de Valparaíso no contiene uniones internas, faroles duplicados, plantas cortadas ni barcos incompletos; se conserva únicamente el barco completo cercano al monumento.
- La posición de Kuro en Valparaíso se bajó ligeramente para que sus patas descansen con más naturalidad sobre el pavimento inclinado.

## Recorrido continuo de Barrio Yungay

- La casa de Kuro, el tramo residencial de Barrio Yungay y Plaza Yungay forman ahora un único escenario exterior desplazable.
- El recorrido utiliza una sola panorámica 3:1 en pixel art, sin costuras, fondos pegados ni cambios de pantalla entre el barrio y la plaza.
- Kuro puede caminar desde la puerta de su casa hasta Mota y continuar hacia Quinta Normal.
- Mota conserva su rincón de lectura y su mesita como elementos interactivos sobre la nueva plaza.
- La segunda casa del recorrido, de fachada rosada y puerta azul, será la casa de Mota. Su silla y su mesita quedan frente a ella para que parezca que salió a leer al barrio.
- Mota mantiene una escala mayor que Kuro por ser un gato adulto y corpulento, pero respeta la proporción de la puerta y la fachada; su sprite conserva la relación de aspecto original y usa escalado pixelado nítido.
- La silla y la mesita apoyan sus patas sobre la misma línea de vereda que Kuro, sin márgenes que las hagan flotar.
- El rincón de Mota ahora es un módulo único: Mota, silla, mesa y sombra comparten un solo anclaje y una sola escala, por lo que no pueden separarse al cambiar el tamaño de la ventana.
- Los módulos del escenario usan una escala de referencia basada en 1100 px y conservan un mínimo legible en pantallas pequeñas.
- Los objetos interactivos se posicionarán mediante anclajes normalizados del fondo; las coordenadas sueltas quedarán reservadas para elementos que no necesiten alinearse con el arte.
- Las transiciones quedan reservadas para entrar a la casa, al museo y para viajar a Estación Mapocho; el paseo exterior dentro de Yungay y Quinta Normal permanece continuo.
- Plaza Yungay y Quinta Normal ya no usan una transición de pantalla: el monumento, el sendero arbolado y el museo aparecen dentro de la misma panorámica 3:1.
- Hablar con Mota es completamente opcional. Su conversación aporta historia y personalidad, pero nunca bloquea el camino hacia Quinta Normal.
- El museo, el rincón fotográfico y la salida hacia Estación Mapocho conservan sus interacciones dentro del recorrido unificado.
