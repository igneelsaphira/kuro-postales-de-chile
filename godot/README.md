# Kuro · Postales de Chile

Alpha v0.2 en Godot 4.7.2. En el editor, importa `godot/project.godot` y pulsa F5 para empezar una partida. [Godot 4.7.2](https://godotengine.org/download/archive/4.7.2-stable/).

El recorrido va de Barrio Yungay, Casa de Kuro y Quinta Normal a Estación Mapocho, Valparaíso y la Cueva del Chivato. Desde Santiago se puede viajar a Valdivia y seguir las huellas hasta el Puente Pedro de Valdivia e Isla Teja.

## Controles

| Acción | Teclado |
| --- | --- |
| Caminar | Flechas ← → o A / D |
| Subir y bajar por el puente | Flechas ↑ ↓ o W / S |
| Correr | Shift junto a una flecha |
| Saltar | Espacio |
| Doble salto tras recoger el cascabel | Espacio otra vez en el aire |
| Interactuar o avanzar un diálogo | E o Enter |
| Dar un zarpazo en la cueva | F |
| Abrir la guía | H |
| Pausar o cerrar un menú | Esc |

En un dispositivo táctil aparecen flechas y botones de acción. El HUD muestra la zona y la vida durante la partida.

## Partidas

La pausa permite guardar la ubicación actual. Los hitos del recorrido también se guardan en `user://partidas/`.

Para importar una partida del prototipo web, copia el valor de su entrada `kuro-save-v1-N` en el almacenamiento local del navegador a un archivo `.json`. Elige **Importar partida** en el menú inicial de Godot para crear una ranura con el progreso, el punto de guardado y la dirección de Kuro.

## Desarrollo

Cada lugar tiene una escena en `scenes/`. El terreno usa coordenadas lógicas de 1100 × 619 por pantalla. Las panorámicas, la cámara y los disparadores de interacción comparten esas coordenadas. La textura alfa `bridge-land-mask.png` dibuja la silueta y define dónde se puede caminar en el puente.

Con Godot en el PATH, desde la raíz del repositorio puedes importar los recursos y ejecutar la prueba de recorrido.

```sh
godot --headless --path godot --editor --import
godot --headless --path godot --script res://tests/playthrough.gd --fixed-fps 60
```

La prueba recorre las zonas con las entradas del juego. Comprueba los hitos, la guía, el guardado y la importación, el HUD y controles táctiles simultáneos en tamaños de escritorio y móvil. Usa partidas temporales.

Para exportar una compilación a un teléfono, configura las plantillas de exportación y las herramientas de la plataforma correspondiente. [Android](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html) · [iOS](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_ios.html).
