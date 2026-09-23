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
- Barrio Yungay, Plaza Yungay y Quinta Normal conectados.
- Mota y su primera conversación completa.
- Museo de la ballena explorable.
- Primera postal coleccionable: **La ballena de Quinta Normal**.
- La postal queda guardada aunque se recargue el juego y aparece como una página real dentro del álbum.
- Primer rincón fotográfico en Quinta Normal, con destello, polaroid y recuerdo persistente.
- El Álbum de Viaje permite cambiar entre la postal y la primera foto usando las flechas.

### Siguiente paso sugerido

Diseñar la salida de Quinta Normal hacia el próximo nodo y decidir si el recorrido continúa por **Estación Mapocho** o por **Barrio Brasil**. El ciclo explorar → descubrir → fotografiar → guardar ya está funcionando.

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
