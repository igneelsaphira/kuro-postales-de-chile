# Kuro: Postales de Chile

Juego cozy de exploración y plataformas protagonizado por Kuro, un gatito viajero que recorre Chile, fotografía miradores y llena su Álbum de Viaje para compartir sus aventuras con su abuelita.

## Dos versiones jugables

- **Web**. El prototipo se abre en el navegador desde [`web/index.html`](web/index.html) con un servidor local.
- **Godot alpha v0.2**. Importa [`godot/project.godot`](godot/project.godot) en Godot 4.7.2 y pulsa **F5**. La alpha incluye la ruta hasta Isla Teja. Consulta la [guía del proyecto Godot](godot/README.md).

### Grabaciones

- [Partida completa en Godot · 6:53, con audio](outputs/partida-completa-kuro-godot.mp4)
- [Comparación web y Godot · 38 segundos](outputs/comparacion-kuro-web-godot.mp4)
- [Prueba del prototipo web · 2:42](outputs/prueba-kuro-web.mp4)
- [Godot en escritorio y vista móvil](outputs/kuro-godot-v02.png)

## Prototipo web

El standalone web incluye:

- Casa de Kuro y Barrio Yungay.
- Exterior e interior ilustrados de la casa, con escala corregida para Kuro.
- Continuación ilustrada de Barrio Yungay hasta la entrada de Plaza Yungay.
- Plaza Yungay y conversación con Mota.
- Plaza Yungay completamente ilustrada, con monumento, senderos y rincón propio para Mota.
- Quinta Normal.
- Museo y postal de la ballena.
- Mirador fotográfico y Álbum de Viaje con páginas.
- Estación Mapocho, tren antiguo y primera Estafeta Gatuna.
- Primera carta de Kuro para su abuelita.
- Primer recorrido continuo por Valparaíso, desde Estación Puerto hasta la entrada de la Cueva del Chivato.
- Cueva oscura de seis pantallas, cascabel recuperable y lobo marino de hollín.
- Cabrito perseguidor y una emboscada coordinada del quiltro con el ave tiznada, cada uno con forma oscura y forma revelada para el regreso.
- Disparo del quiltro del tamaño de su cabeza, con un rebote y posibilidad de devolverlo mediante el zarpazo.
- Regreso por la cueva con criaturas reveladas y un cabrito espiritual que se esconde detrás de una roca en lugar de atacar.
- Ataque con pelota de hollín, un rebote y zarpazo para devolverla.
- Cascabel persistente que desbloquea el doble salto y transforma el regreso por la cueva.
- Reencuentro con Tizne, tres respuestas de personalidad y postal de Valparaíso con posdata variable.
- Encuentro con Doña Bruma en los cerros: cuenta la historia del cascabel y Kuro puede devolvérselo sin perder el doble salto.
- Movimiento, salto, carrera, cámara e interacciones.
- Subida y bajada de tierra vistas desde arriba dentro del Puente Pedro de Valdivia. El recorrido se extiende hacia ambos lados de la pantalla: terrazas de barro, desvíos entre vigas, huellas, una orilla con bote y juncos y un humedal antes de llegar a los coipos de Isla Teja. El barro movedizo atasca a Kuro y lo hace volver a tierra firme; en otro atajo puede empujar un tronco con `E` para cruzar un charco, o tomar la ruta larga. Kuro se ve de espaldas al subir y de frente al bajar, alternando las patas y la cola al caminar.

## Abrir la versión web

Desde la raíz del repositorio, inicia `python3 -m http.server 8000` y abre [Kuro en localhost](http://127.0.0.1:8000/web/). La entrada de la raíz también abre el juego web y conserva los parámetros de prueba.

Controles principales: flechas o `A`/`D` para moverse, `Shift` para correr, `Espacio` para saltar, `E` para interactuar y `F` para dar un zarpazo dentro de la cueva.

Pulsa `H` o el botón `?` para consultar los controles durante la partida.

El encuadre se adapta a la ventana. En vertical, la cámara muestra menos terreno a los lados para que Kuro se vea más grande. En pantallas táctiles puedes usar las flechas junto con **Correr**, **Saltar**, **Acción** y **Zarpazo** al entrar en la cueva.

Para revisar directamente la subida del puente, abre `web/index.html?preview=bridge`. Usa `↑`/`W` para subir, `↓`/`S` para bajar y `←`/`→` para seguir los giros del camino. Pulsa `E` arriba para cruzar hacia los coipos o abajo para volver a la feria.

## Coordenadas y cámara

Los escenarios, las interacciones y los guardados web usan la misma unidad de mundo en todas las pantallas. `web/game-camera.js` calcula la escala, el ancho visible y el desplazamiento horizontal. `web/script.js` le entrega la posición de Kuro y los límites de la escena, y aplica el encuadre al escenario. El HUD y los menús se ajustan por separado con CSS.

La Casa de Kuro y el recorrido de Barrio Yungay hasta Quinta Normal usan [Phaser 4.2.1](https://phaser.io/download/release/v4.2.1). `web/phaser-world.js` recibe la posición, el fotograma y la cámara de la partida. Las dos escenas comparten el lienzo y las texturas de Kuro. El motor se pausa al salir de ese recorrido. La distribución oficial y su licencia MIT están en `web/vendor/phaser` para jugar sin conexión.

Abre `web/index.html?preview=street` para probar Barrio Yungay junto a la puerta de la casa, o `web/index.html?preview=street&at=mota` para ir al rincón de Mota. Agrega `&renderer=dom` para comparar con el renderizador original.

## Estado

Prototipo temprano. El arte y las mecánicas todavía están en desarrollo.

La subida bajo el Puente Pedro de Valdivia incluye una islita opcional separada por agua: al empujar el tronco se puede cruzar y recoger la postal secreta del humedal para el álbum. La ruta principal hacia los coipos sigue por tierra.
