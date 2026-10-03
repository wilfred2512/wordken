# Los audios

Esta carpeta va con **11 músicas .mp3** y una subcarpeta `risas/` con **5
risas**. Las músicas son las mismas que ya tenías en el proyecto anterior, solo
que **renombradas a kebab-case y con nombre descriptivo**, porque el enunciado exige que los archivos sigan esa convención
y porque `9.mp3` no le dice nada a nadie.

Si el paquete que te llegó viene **sin** los mp3 (para que pesara poco), cópialos
desde tu proyecto viejo con esta equivalencia:

| Archivo antiguo | Nombre nuevo | Cuándo suena |
|---|---|---|
| `menu.mp3` | `menu.mp3` | menú principal |
| `2.mp3` | `partida.mp3` | partida, estado normal |
| `4.mp3` | `cadena-doble.mp3` | mientras hay DOBLE CADENA (x2) |
| `9.mp3` | `cadena-triple.mp3` | mientras hay TRIPLE CADENA (x3) |
| `8.mp3` | `cadena-maxima.mp3` | al desatarse la CADENA MÁXIMA |
| `3.mp3` | `vida-75.mp3` | alguien ha bajado del 75 % |
| `6.mp3` | `vida-50.mp3` | alguien ha bajado del 50 % |
| `5.mp3` | `vida-25.mp3` | alguien ha bajado del 25 % |
| `1.mp3` | `duelo-wordle.mp3` | **nuevo**: durante el duelo de palabras |
| `7.mp3` | `victoria.mp3` | pantalla de victoria |
| `10.mp3` | `derrota.mp3` | pantalla de derrota |
| `Gerson (Old Man) Laughing…mp3` | `risas/gerson.mp3` | una de las risas del rival (ver más abajo) |

> `1.mp3` estaba sin usar en la versión anterior (el menú ya usaba `menu.mp3`),
> así que se ha aprovechado para la música del duelo.

## Copiarlos de golpe

**Windows (PowerShell)** — cambia la primera línea por la ruta de tu carpeta vieja:

```powershell
$viejo = "C:\ruta\a\Piedra, Papel o Tijera\assets\audios"
$mapa = @{
  "menu.mp3"="menu.mp3"; "2.mp3"="partida.mp3"; "4.mp3"="cadena-doble.mp3"
  "9.mp3"="cadena-triple.mp3"; "8.mp3"="cadena-maxima.mp3"; "3.mp3"="vida-75.mp3"
  "6.mp3"="vida-50.mp3"; "5.mp3"="vida-25.mp3"; "1.mp3"="duelo-wordle.mp3"
  "7.mp3"="victoria.mp3"; "10.mp3"="derrota.mp3"
}
foreach ($k in $mapa.Keys) { Copy-Item "$viejo\$k" ".\$($mapa[$k])" }
New-Item -ItemType Directory -Force ".\risas" | Out-Null
Copy-Item "$viejo\Gerson*.mp3" ".\risas\gerson.mp3"
```

**macOS o Linux (bash)**:

```bash
VIEJO="/ruta/a/Piedra, Papel o Tijera/assets/audios"
cp "$VIEJO/menu.mp3" menu.mp3
cp "$VIEJO/2.mp3" partida.mp3
cp "$VIEJO/4.mp3" cadena-doble.mp3
cp "$VIEJO/9.mp3" cadena-triple.mp3
cp "$VIEJO/8.mp3" cadena-maxima.mp3
cp "$VIEJO/3.mp3" vida-75.mp3
cp "$VIEJO/6.mp3" vida-50.mp3
cp "$VIEJO/5.mp3" vida-25.mp3
cp "$VIEJO/1.mp3" duelo-wordle.mp3
cp "$VIEJO/7.mp3" victoria.mp3
cp "$VIEJO/10.mp3" derrota.mp3
mkdir -p risas
cp "$VIEJO"/Gerson*.mp3 risas/gerson.mp3
```

## La carpeta de risas

Cuando el rival se ríe de ti (pierdes un duelo, te roba una bonificación o usa
un poder) suena **una risa al azar** de `risas/`, y nunca la misma dos veces
seguidas. Mientras una risa sigue sonando no se lanza otra encima.

| Archivo | Dura |
|---|---|
| `risas/gerson.mp3` | 2,9 s |
| `risas/brook.mp3` | 3,6 s |
| `risas/luffy.mp3` | 4,0 s |
| `risas/nelson.mp3` | 3,7 s |
| `risas/patricio.mp3` | 5,8 s |

Las cinco están **niveladas al mismo volumen** (unos -15 LUFS). Venían con hasta
10 dB de diferencia entre la más floja y la más fuerte, y al salir al azar una
pegaba un susto y otra casi no se oía.

### Añadir una risa

1. Mete el `.mp3` en `risas/`, con el nombre en minúsculas y guiones
   (`risa-nueva.mp3`, no `Risa Nueva.mp3`).
2. Apunta su nombre, sin la extensión, en la lista `NOMBRES_DE_RISAS` de
   `src/js/modules/audio/catalogo-audio.js`.

El paso 2 hace falta porque un navegador no puede mirar qué archivos hay en una
carpeta: solo puede pedir uno cuyo nombre ya conozca. Para quitar una risa,
bórrala de la lista. Si la lista se queda vacía suena el pitido sintetizado.

## Si falta algún archivo no pasa nada

El catálogo de audio (`src/js/modules/audio/catalogo-audio.js`) tolera pistas
vacías: si una ruta no existe, esa situación simplemente no suena y el juego
sigue. Y **todos los efectos puntuales son pitidos generados por código** con la
Web Audio API (`sintetizador.js`), así que el juego suena desde el primer
arranque aunque esta carpeta esté vacía. El único efecto con archivos propios
es la risa del rival.

## Los efectos de sonido nuevos

No hacía falta buscar archivos: los 20 efectos del juego (teclas del duelo,
letra correcta, letra en otra posición, carga subiendo, carga llena, poder
ganado, poder activado, disparo de pistola, tiempo agotado…) se sintetizan con
osciladores. Están definidos como melodías de notas en
`src/js/modules/audio/sintetizador.js`, y se pueden retocar cambiando
frecuencias y duraciones.
