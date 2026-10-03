# Relevo del proyecto

Para ponerte al día y para pegárselo a una IA al empezar un chat nuevo.

> **Si vas a usar una IA gratuita** (contexto pequeño): pega **solo la PARTE 1**.
> Son las reglas que, si se rompen, bajan la nota. La PARTE 2 y la PARTE 3
> pégalas únicamente si el trabajo del día las necesita.

---
---

# PARTE 1 · NÚCLEO (pega siempre esto)

## Qué es el proyecto

Mini proyecto RA1 de Aplicaciones Web con JavaScript. Un **piedra, papel o
tijera contra una IA** con tres capas encima:

1. **Vida y cadenas.** No hay marcador, hay puntos de vida. Ganar rondas
   seguidas multiplica el daño (x2); si la racha es con la **misma tirada**,
   x3 y esa tirada queda **sellada**. Sellar las tres = victoria instantánea.
2. **Círculo de carga.** El daño que el jugador le hace a la IA llena un
   medidor. Cuánto hace falta lo elige el jugador en el menú.
3. **Duelo de palabras.** Al llenarse se abre un **Wordle a contrarreloj** de
   jergas del español (85 palabras, 42 dominicanas). Si aciertas eliges una
   bonificación; si fallas, se la queda la IA.
4. **Un personaje por dificultad.** EL MONGOLO (fácil), UNA GENTE (normal),
   EL TÍGUERE (difícil) y EL GENIO. Cada uno tiene avatar, color y frases propias,
   y comenta la partida. **EL GENIO la mueve un modelo de lenguaje real.**
5. **Un ayudante.** Botón `?` flotante con un chat que explica cómo se juega.

Frontend: **HTML + CSS + JavaScript puro**, sin librerías, con módulos ES6.
Backend: **Node + Express + SQLite** por capas.

El juego se llama **WordKen**. Está en UN solo sitio: `NOMBRE_JUEGO` en
`frontend/src/js/modules/constantes.js`. Cambiar esa línea cambia el menú
entero, el título de la pestaña y el resto de textos.

**Sobre el modelo de lenguaje (léelo antes de tocarlo):** la clave va en
`backend/.env`, en la variable `IA_CLAVE`, **y en ningún otro sitio**. El
enunciado prohíbe credenciales en el código fuente, y ponerla en el frontend
sería publicarla (el JS de una web lo lee cualquiera con F12). Si dejas
`IA_CLAVE` vacía **no pasa nada**: EL GENIO juega con la estrategia difícil y
el chatbot contesta con sus respuestas de repuesto. El juego funciona entero
sin ninguna API, y así tiene que seguir.

## Qué necesitas instalado

Solo hay **una cosa obligatoria**:

| Programa | Para qué | Comprobar |
|---|---|---|
| **Node.js 18 o superior** (probado con 22) | Backend, lanzador y servidor del frontend | `node --version` |
| **Git** | El repositorio con commits de los dos (lo exige el enunciado) | `git --version` |
| **Un navegador** moderno (Chrome, Edge, Firefox, Brave) | Jugar | — |
| **Un editor** (VS Code recomendado, no obligatorio) | Escribir código | — |

`npm` viene incluido con Node, no se instala aparte. Node se descarga de
<https://nodejs.org> (versión LTS).

**Opcional, solo para la dificultad EL GENIO y el chatbot bueno:** una clave de
algún proveedor con formato OpenAI (OpenAI, Groq, OpenRouter, Gemini) o un
**Ollama** instalado en tu portátil, que es gratis y funciona sin internet. Va
en `IA_CLAVE` e `IA_URL_BASE` de `backend/.env`; en `.env.example` están las
URL de cada proveedor. **Sin esto el juego funciona entero.**

### Lo que NO hace falta instalar

Esto es tan importante como lo anterior. Si una IA te dice que instales algo de
esta lista, **está equivocada**:

- ❌ **Live Server** ni ninguna extensión de VS Code. El proyecto trae su propio
  servidor en `herramientas/servidor-estatico.mjs`, escrito solo con lo que
  viene en Node.
- ❌ **Python**, **XAMPP**, **WAMP** o similares.
- ❌ Ningún gestor de bases de datos. **SQLite se crea sola** en
  `backend/datos/juego.db` la primera vez que arranca el backend.
- ❌ **React, Vite, webpack, TypeScript, jQuery, Tailwind, Bootstrap** ni
  ninguna librería de frontend. El enunciado pide JavaScript puro y el
  frontend **no tiene ni una dependencia**.
- ❌ **nodemon**, **live-server**, **express-generator** ni utilidades
  parecidas.

Las únicas dependencias del proyecto son tres, todas del backend, todas
JavaScript puro, y las instala el lanzador solo: `express`, `cors` y `dotenv`.
La base de datos es el SQLite que **trae Node dentro** (`node:sqlite`). Antes
era `better-sqlite3`, un módulo nativo que en Node 24 no traía binario hecho y
se compilaba con Visual Studio: en un PC sin Visual Studio, `npm install`
fallaba. **No volváis a meter dependencias nativas** (las que compilan con
node-gyp): son lo que hace que un proyecto funcione en tu PC y no en el del
profesor.

### Primera vez: comprobar que todo va

```bash
node --version                             # tiene que decir v22.13 o más (mejor la LTS)
npm install --prefix backend               # solo la primera vez
node herramientas/verificar-normas.mjs     # tiene que salir limpio
npm start                                  # abre el juego
```

> **Los 16 archivos .mp3 pueden no venir en el zip** (pesan 84 MB y se quitan
> para poder enviarlo). Si la carpeta `frontend/src/assets/audios/` solo tiene
> el `LEEME.md`, pídeselos a tu compañero o clónalos del repositorio de Git. El
> juego **funciona igual sin ellos**: se queda sin música, pero los efectos de
> sonido están generados por código y suenan de todas formas.

## Cómo se abre

Doble clic en **`jugar.bat`** (Windows) o `./jugar.sh` (mac/Linux), o
`npm start` desde la raíz. Levanta backend + frontend y abre el navegador.

**No funciona abrir `index.html` con doble clic**: son módulos ES6 y el
navegador los bloquea en `file://`. Por eso existe el lanzador.

El juego funciona **sin backend**; solo se pierde el guardado de partidas y la
tabla de puntuaciones.

## LAS 15 REGLAS QUE NO SE PUEDEN ROMPER

Salen del enunciado y se comprueban solas. Si una IA te propone un cambio que
viola alguna, **recházalo**.

1. **Ningún archivo pasa de 300 líneas.** El más largo ahora es
   `frontend/index.html` con 299. Antes de añadir algo ahí, quita otra cosa.
   Truco que ya usamos tres veces: si lo que ibas a añadir **aparece y
   desaparece** (un avatar, un panel, una capa de efectos), no va en el HTML;
   se construye desde JavaScript como hacen `render/avatar-ia.js` o
   `render/chat-ayuda.js`. Lo que va en el HTML es el esqueleto fijo.
2. **Ninguna función pasa de 40 líneas.** Si crece, se parte en dos.
3. **Máximo 3 niveles de anidación** dentro de una función.
4. **Cero `console.log`.** Ni para depurar. Se borra antes de guardar.
5. **Nada de `<style>` ni `style="..."` en el HTML.** Todo el CSS va en
   `frontend/src/css/`. Tampoco se inyecta CSS desde JavaScript.
6. **Nada de `onclick=`** ni ningún `on...=` en el HTML. Los eventos se
   registran con `addEventListener` desde JS.
7. **Todo en español**: variables, funciones, comentarios, ids del HTML,
   clases CSS. Las carpetas de arquitectura (`modules`, `services`,
   `controllers`…) se quedan en inglés porque el enunciado las dibuja así.
8. **Nombres**: archivos y carpetas en `kebab-case`, variables y funciones en
   `camelCase`, clases en `PascalCase`, constantes en `UPPER_SNAKE_CASE`.
9. **Sin números mágicos.** Los valores ajustables viven en
   `frontend/src/js/modules/constantes.js`.
10. **`modules/` y `entities/` NO pueden tocar el DOM.** Ni un `document`.
    Quien pinta es `render/`.
11. **Ninguna credencial en el código.** Ni la clave de la API interna
    (`CLAVE_API`) ni la del modelo de lenguaje (`IA_CLAVE`). Van en
    `backend/.env`, que está en `.gitignore`. Lo que sí se sube es
    `.env.example`, con los valores en blanco.
12. **El juego tiene que poder jugarse sin internet y sin clave de API.** Si
    añades algo que dependa del modelo de lenguaje, ponle su plan B. Es la
    diferencia entre un extra y una dependencia.

13. **Una animación infinita solo puede mover `transform`, `translate`,
    `rotate`, `scale`, `opacity` o `filter`.** Esas seis las resuelve la
    tarjeta gráfica. Cualquier otra —`box-shadow`, `text-shadow`,
    `background-position`, `width`, `letter-spacing`— obliga al navegador a
    repintar o a recalcular el diseño de la página SESENTA VECES POR SEGUNDO.

    Esto ya nos pasó: el juego se arrastraba en la segunda mitad de cada
    partida y parecía una fuga de memoria. No lo era. Eran trece animaciones
    infinitas pintando sombras, y como varias solo se encienden con la
    partida avanzada (la viñeta roja de vida baja, el medidor lleno, cada
    ficha de poder ganada), el coste crecía con el estado del juego. Medido:
    **206 ms de trabajo cada 6 segundos, contra 6 ms después de arreglarlo.**

    ¿Quieres un resplandor que palpite? Pon la sombra FIJA en un
    `::before`/`::after` y anímale la `opacity`. Se ve igual y no cuesta nada.
    Hay ejemplos resueltos en `carga-y-poderes.css` y `efectos.css`.

14. **Para añadir movimiento a algo que ya tiene `transform`, usa
    `translate` / `rotate` / `scale` sueltos.** Son propiedades
    independientes y se COMPONEN con el `transform` que el elemento ya
    tenga; una animación más sobre `transform` lo pisaría. Así conviven la
    inclinación de la carta con el ratón (que la pone el JS), su flote y el
    hundido al pulsarla. Todo `movimiento.css` va con esa técnica.

15. **Nada que se pulse puede estar moviéndose de sitio.** Un botón que
    flota es un blanco móvil. Si quieres que un botón parezca vivo, pásale
    un brillo por encima (`::after` con `translate`) en vez de moverlo. Las
    fichas de poder y las cartas de la mano paran su animación con `:hover`
    justo por esto.

    Ojo, además: dos hojas distintas no pueden declarar `animation` sobre el
    MISMO selector, porque solo hay una propiedad `animation` por elemento y
    gana la última hoja cargada — la otra animación desaparece sin avisar. Si
    necesitas las dos, decláralas juntas separadas por coma (hay ejemplos en
    `movimiento.css`, en `.sello.activo`).

### Cómo se comprueba

```bash
node herramientas/verificar-normas.mjs
```

Revisa los 107 archivos y ahora mismo sale limpio. **Ejecútalo después de cada
cambio que haga una IA**, sobre todo si tocó CSS o HTML: son los que más se
pasan de 300 líneas.

## La regla de oro de la arquitectura

> **La lógica calcula y devuelve un informe. El renderizado lo escenifica.**

`resolverRonda()` en `modules/motor-ronda.js` recibe la jugada, cambia el
estado y devuelve un objeto **parte de ronda**: quién ganó, cuánto daño, qué
nivel de cadena, qué carteles hay que enseñar. La escena lee ese parte y lo
convierte en animaciones.

Se comprueba en un segundo:

```bash
grep -r "document\." frontend/src/js/modules frontend/src/js/entities
# no devuelve nada
```

Si una IA te mete un `document.querySelector` dentro de `modules/` o
`entities/`, está rompiendo lo que más sube nota del proyecto.

## Cómo pedirle cambios a una IA (importante con modelos gratuitos)

Los modelos pequeños fallan casi siempre igual. Prevenlo así:

- **Pide el cambio archivo por archivo**, no "arregla el juego".
- **Pega el archivo completo** que quieres cambiar. Si no lo ve, se lo inventa.
- **Pide un `diff` o "dime qué línea cambio por cuál"**, no un volcado del
  archivo entero. Un modelo pequeño que reescribe un archivo de 250 líneas te
  borra la mitad de los comentarios sin avisar.
- **Recuérdale el límite de 300/40 líneas en el propio mensaje.** No se acuerda.
- **Después de aplicar, ejecuta el verificador** y abre el juego.

Frase que funciona bien para empezar un chat:

> Trabajo en un proyecto de JavaScript puro con módulos ES6. Reglas
> obligatorias: ningún archivo pasa de 300 líneas, ninguna función de 40, máximo
> 3 niveles de anidación, cero console.log, todo el código y los comentarios en
> español, sin estilos en el HTML ni en el JS. Te voy a pegar un archivo; dime
> solo las líneas que hay que cambiar, no me lo reescribas entero.

---
---

# PARTE 2 · MAPA DEL PROYECTO (pega si vas a tocar código)

## Carpetas

```
mini-proyecto-ra1/
├── jugar.bat / jugar.sh       lanzadores de un clic
├── package.json               npm start = lanzar todo
├── frontend/
│   ├── index.html             299 líneas, casi lleno
│   └── src/
│       ├── css/               14 hojas
│       ├── assets/            audios (11 músicas y 5 risas) e iconos.svg
│       └── js/
│           ├── main.js        punto de entrada, solo conecta cables
│           ├── core/          bus de eventos, reloj, escenas, bucle, estado
│           ├── entities/      una clase por entidad
│           ├── scenes/        menú, partida, duelo, pausa, fin
│           ├── input/         teclado y puntero
│           ├── render/        TODO lo que toca el DOM
│           ├── modules/       las reglas del juego (sin DOM)
│           ├── services/      llamadas al backend
│           └── utils/         dom, números, azar, tiempo, texto
├── backend/
│   ├── server.js              solo levanta el puerto
│   └── src/{config,routes,controllers,services,repositories,models,middlewares,utils}
├── docs/                      documento técnico, autoevaluación, guion, este relevo
└── herramientas/              lanzador, servidor estático, verificador
```

## Las cuatro dificultades

`modules/personajes-ia.js` dice quién es cada una y `modules/frases-avatar.js`
qué dice. Las tres primeras las mueve `modules/estrategias-ia.js`; la cuarta,
**EL GENIO**, la mueve un modelo de lenguaje.

Lo que hay que entender de EL GENIO antes de tocarla: **se le pregunta antes de
que haga falta**. `resolverRonda()` es síncrona y no puede esperar a nadie, así
que en `prepararMesa()` —cuando la mesa queda lista para tu jugada— se lanza la
petición y la respuesta se guarda en `partida.oponente.consejo`. Al resolver la
ronda se consume si está y se tira de la estrategia difícil si no. Por eso una
ronda con modelo tarda lo mismo que sin él (medido: 999 ms).

Si vas a tocar esto, dos cosas que parecen detalles y no lo son:

- El consejo **se valida** antes de usarse. Un modelo devuelve texto libre; si
  contesta «lagarto», la ronda se queda sin carta que jugar.
- El consejo **se vacía siempre** al consumirlo, aunque no sirva. Un consejo
  pensado para la ronda pasada aplicado a la siguiente es peor que ninguno.

## Los archivos que más se tocan

| Quiero cambiar... | Archivo |
|---|---|
| El nombre del juego, la vida, el daño, los tiempos | `modules/constantes.js` |
| Quién le gana a quién | `modules/reglas-tiradas.js` |
| Cómo se resuelve una ronda | `modules/motor-ronda.js` |
| Qué hace cada bonificación | `modules/efectos-poderes.js` |
| Nombres y textos de las bonificaciones | `modules/catalogo-poderes.js` |
| Las palabras del Wordle | `modules/diccionario-jergas.js` |
| Lo lista o tonta que es la IA | `modules/estrategias-ia.js` y `entities/oponente-ia.js` |
| Las animaciones de la ronda | `scenes/escenificar-ronda.js` |
| Colores y tipografías | `css/base.css` |
| Efectos de la interfaz | `css/efectos-interfaz.css` |
| Efectos de la partida | `css/efectos.css` |
| Lo que se mueve solo (títulos, aros, teclado) | `css/vida-propia.css` |
| La animación de cada habilidad | el campo `gesto` del catálogo + `css/fanfarrias.css` |
| Quién es la IA en cada dificultad | `modules/personajes-ia.js` |
| Lo que dice el avatar | `modules/frases-avatar.js` |
| Respuestas del chatbot sin API | `modules/faq-juego.js` |
| Las instrucciones que lee el modelo | `backend/src/services/manual-juego.js` |

## Reglas del juego, en corto

- Piedra rompe tijera, tijera corta papel, papel envuelve piedra.
- **El empate no hace daño y NO rompe la cadena.**
- Daño base **fijo en 1** (a propósito: si creciera con la vida, subir la vida
  no alargaría la partida).
- 2 victorias seguidas = **doble cadena** (x2). Si son con la misma tirada =
  **triple** (x3) y esa tirada se **sella**.
- 3 sellos = **cadena máxima** = victoria instantánea.
- Perder rompe la cadena; si esa cadena no había sellado nada, pierdes los
  sellos.
- 5 empates seguidos = **bloqueo**: a cada bando se le prohíbe una tirada
  **distinta** (si fuera la misma, la probabilidad de empate subiría a 1/2).

## Las 11 bonificaciones

Diez se ganan en el duelo; el **escudo** no, se concede solo.

| Poder | Qué hace |
|---|---|
| PISTOLA | Cuarta carta, gana a las tres. **Al activarla el rival recibe un ESCUDO.** |
| ESCUDO | Solo para la pistola. Pierde contra piedra, papel y tijera. |
| DOBLE O NADA | Juegas dos cartas contra una. Las dos ganan = daño doble. |
| ESPEJO | La próxima derrota se convierte en victoria. |
| GANZÚA | Sella al instante una tirada que te falte. |
| VAMPIRO | 3 rondas curándote lo que haces de daño. |
| MARTILLO | +3 de daño plano en la próxima victoria. |
| CANDADO | Prohíbe al rival su tirada favorita 2 rondas. |
| RULETA | Multiplicador aleatorio x1–x5 la próxima ronda. |
| BOMBA | 3 de daño directo al activarla. Puede acabar la partida. |
| MAMAJUANA | Cura 4 al activarla, sin pasar de la vida máxima. |

Cada una tiene su **fanfarria**: una animación a pantalla completa distinta.
No hay nueve funciones, hay **un campo `gesto` en el catálogo** (`"disparo"`,
`"impacto"`, `"cerrojo"`…) y un bloque de CSS por gesto en `fanfarrias.css`.
Para inventar un poder con animación propia: una entrada en el catálogo y un
bloque de CSS. No toques `render/fanfarria-poder.js`.

Además de la fanfarria, cada poder tiene un **impacto**: la escena que ocurre
ENCIMA de lo que toca (el martillo sobre la barra, la bala en la carta). Son
datos en `render/escenas-impacto.js` (qué elemento recibe, de dónde sale,
cuándo golpea) y CSS en `impactos.css` / `impactos-extra.css`. Qué impacto
toca en cada momento lo decide `scenes/impactos-de-poder.js`. Para darle
impacto a un poder nuevo: una entrada en escenas-impacto.js y un bloque de CSS.

**El pulso pistola/escudo** es la pieza de equilibrio: disparar es una apuesta
y escudarse también. Las dos cartas se gastan al jugarse, y cuando la pistola
se dispara el escudo se retira solo (si no, habría bloqueo eterno).

## El duelo de palabras

- 5 intentos, 35–60 segundos según la dificultad.
- Visible **desde el segundo cero**: tipo, región, número de letras y la pista
  con el significado.
- **Pista extra** al segundo fallo: revela la primera letra.
- Al perder, el tablero se queda con la solución escrita 2,6 segundos.
- En el diccionario, `tipo` (de qué habla) y `region` (de dónde es) son campos
  **distintos**. No los vuelvas a juntar: antes salía «España / España».

## La API

Base `http://localhost:3000/api`. Respuestas siempre `{ success, data, message }`.

- `/jugadores` — GET, GET/:id, POST, PUT/:id, DELETE/:id
- `/partidas` — GET, GET/:id, POST, DELETE/:id
- `/puntuaciones` — GET (solo lectura, es una consulta agregada)
- `/mente` — GET (¿hay modelo?), POST `/jugada`, POST `/ayuda`

`/mente` no guarda nada: es el puente al modelo de lenguaje, y existe para que
la clave no salga del servidor. **Nunca devuelve error por no haber modelo**:
contesta `disponible: false` con un 200, porque que no haya clave es el caso
normal, no un fallo.

`PUT` y `DELETE` piden la cabecera `x-clave-api` (valor en `backend/.env`); sin
ella devuelven **401**.

**La puntuación la calcula el servidor**, no el navegador: el cliente manda
hechos (rondas, daño, duelos) y el backend deduce el número. Si la mandara el
cliente, cualquiera pondría 999999 desde la consola.

## Probar sin jugar

Consola del navegador (F12):

```js
JUEGO.partida                          // el estado entero
JUEGO.forzarTiradaIa(() => "tijera")   // la IA juega siempre lo que pierde
JUEGO.regalarPoder("pistola")
JUEGO.llenarCarga()                    // abre el duelo ya
JUEGO.duelo.palabraSecreta             // hacer trampa en el Wordle
JUEGO.poderes                          // los 9 identificadores del catálogo
JUEGO.partida.oponente.consejo         // lo que ha contestado EL GENIO
```

Para ver una fanfarria concreta sin ganar el duelo:

```js
const f = await import("./src/js/render/fanfarria-poder.js");
f.lanzarFanfarria("ruleta", "jugador", "multiplicador x5");
```

Y para comprobar si el servidor tiene modelo configurado, sin abrir el `.env`:

```bash
curl http://localhost:3000/api/mente
```

Guion determinista que provoca una **cadena máxima** (con la IA forzada a
perder): `papel, papel, tijera, tijera, piedra, piedra`.

---
---

# PARTE 3 · ESTADO Y PENDIENTES (pega si vas a organizar el trabajo)

## Qué está hecho

- Juego completo: cadenas, sellos, cadena máxima, bloqueo por empates,
  círculo de carga, duelo de palabras, 11 bonificaciones con su impacto.
- **Cuatro dificultades con personaje**: EL MONGOLO, UNA GENTE, EL TÍGUERE y
  EL GENIO (esta movida por un modelo de lenguaje real), con avatar que
  comenta la partida.
- **Chatbot de ayuda** con dos cerebros: el modelo si lo hay, una tabla de
  respuestas si no.
- **Una animación por habilidad especial**, dirigida por el catálogo.
- Diccionario reequilibrado: 85 palabras, 42 dominicanas.
- Backend por capas con SQLite, validación, manejo de errores, CORS y los seis
  códigos de estado (200, 201, 400, 401, 404, 500), más `/api/mente` como
  puente al modelo de lenguaje con la clave guardada en el servidor.
- 124 archivos, verificador de normas en verde.
- Lanzador de un clic sin dependencias.
- Rendimiento: ronda de **0,7 a 2 s** (antes 1,8–4,2), y todas las esperas se
  saltan con un clic o una tecla.
- Diseño comprobado en siete tamaños, de 1920×915 a 390×740, y repetido con la
  letra un 40 % más grande.
- Documentación: `README.md`, `docs/documento-tecnico.md`,
  `docs/autoevaluacion.md`, `docs/guion-defensa.md`.

## Qué falta (esto es lo nuestro)

1. **Rellenar los integrantes** en la tabla del `README.md`.
2. **Crear el repositorio Git** con commits **de los dos**. El enunciado lo
   exige como evidencia de trabajo colaborativo y **la nota es individual**.
3. **Desplegar** (Netlify/Vercel el frontend, Render/Railway el backend) o
   dejar la demo local lista. Pasos en el README.
4. **Grabar el vídeo de 5–8 minutos** con los dos explicando.
5. **Estudiar `docs/guion-defensa.md`**: tiene las preguntas más probables con
   la respuesta y el archivo donde enseñarla.
6. **Decidir si enseñamos EL GENIO en la defensa.** Si sí, hay que configurar
   `IA_CLAVE` en `backend/.env`. Lo más barato es un **Ollama** en local
   (`IA_URL_BASE=http://localhost:11434/v1`), que no cuesta nada y no necesita
   internet el día de la presentación. Si no la enseñamos, no hay que tocar
   nada: el juego funciona igual.
7. **Jugar varias partidas y ajustar el equilibrio.** Las probabilidades de la
   IA (45 % gastar poder, 40 % escudar, 35 % disparar bajo escudo) están
   razonadas pero **no medidas**. Son constantes con nombre al principio de
   `entities/oponente-ia.js`.

## Trampas del entorno que ya nos costaron tiempo

1. **OneDrive.** Si los `.mp3` salen con icono de nube, el navegador se queda
   esperando y no suena la música. Clic derecho en la carpeta → *Conservar
   siempre en este dispositivo*.
2. **Brave** bloquea el autoplay más que Chrome. No es un fallo: el audio
   arranca con el primer clic o tecla.
3. **`file://` no vale.** Módulos ES6 = hace falta servidor.
4. **Puerto 3000.** Es el del backend. Si sirves el frontend con `npx serve`
   sin `-l 5500`, chocan.
5. **Si sale «Ahora mismo no se pueden ver las puntuaciones»**, es que falta
   levantar el backend. No es un bug. Con `?diagnostico` en la dirección sale
   el aviso completo, con el comando para arrancarlo.
6. **Windows con «reducir movimiento» activado** (Configuración →
   Accesibilidad → Efectos visuales → Animaciones). Antes eso apagaba TODAS
   las animaciones del juego y parecía que no había ninguna. Ahora solo apaga
   lo que marea (sacudidas de pantalla, destellos) y lo decorativo del fondo.
   Si alguien dice que «no se mueve nada», es lo primero que hay que mirar.
7. **`localhost` puede resolverse a IPv6.** Ollama solo escucha en IPv4, así que
   `http://localhost:11434` fallaba desde el backend aunque `curl` en
   PowerShell funcionara. `config/entorno.js` ya lo cambia por `127.0.0.1`.
8. **El chat no usa el modelo.** Al jugador no se le dice nada técnico, así
   que abre el juego con `?diagnostico` al final de la dirección
   (`http://127.0.0.1:5500/?diagnostico`): la cabecera del chat y una nota
   naranja debajo de la respuesta dicen el motivo. Luego abre
   `http://localhost:3000/api/mente/prueba`, que hace una consulta real y
   devuelve cuánto tardó y por qué falló. Los fallos también salen en la
   terminal del backend, empezando por `[modelo]`.

## Bugs que ya arreglamos (no volver a introducirlos)

| Bug | Causa | Arreglo |
|---|---|---|
| La música no sonaba al recargar | el navegador prohíbe audio sin gesto previo | `desbloquear()` en el primer clic + reintento |
| Escribir 0 en la vida ponía 1 sin avisar | `parseInt("0") \|\| 20` devuelve 20: **el 0 es falsy** | `leerEntero()` con `Number.isNaN` |
| El menú de configuración se quedaba encima de la partida | la escena no cerraba sus ventanas al salir | `escenaMenu.salir()` las cierra |
| Los botones de pausa se salían de la tarjeta | con la fuente pixel son más anchos | `flex-wrap` en `.pie-modal` |
| Las cartas parecían planas al pasar el ratón | faltaba el anillo `::after` de la versión vieja | restaurado en `cartas.css` |
| La IA ganaba poderes y nunca los usaba | `elegirPoderParaActivar` no la llamaba nadie | se llama al **final** de la ronda |
| «España / España» en el duelo | `categoria` mezclaba tema y geografía | campos `tipo` y `region` separados |
| Dos animaciones peleando por `transform` | zoom y sacudida por separado | fusionadas en un `@keyframes` |
| Las cartas se metían dentro de los paneles de vida en pantallas bajas | se medían por **ancho** cuando lo que falta es **alto** | `height: clamp(...vh...)` + `aspect-ratio` + `flex: 0 1 auto` |
| Esperar 5–12 s tras pulsar una carta | no era lentitud, eran esperas encadenadas a propósito | `RITMO` a la mitad y todas las esperas saltables |
| El rival se quedaba mudo media partida | el saludo bloqueaba todas las frases siguientes | tiempo mínimo en pantalla de 1,3 s, no bloqueo permanente |
| El campo del chat salía gigante | `modales.css` estiliza `input[type="text"]`, que gana en especificidad | seleccionar con `.chat-pie .chat-campo` |
| El chat nunca usaba el modelo aunque la dificultad sí | el navegador cortaba a los 6 s y la respuesta del ayudante tarda más | `TIEMPO_LIMITE_MODELO_MS = 30000`, siempre MAYOR que `IA_TIEMPO_LIMITE_MS` |
| El chat se quedaba sin modelo si abrías el juego antes que el backend | solo se comprobaba una vez al cargar | vuelve a comprobarlo antes de cada pregunta mientras no haya modelo |
| La IA se apagaba en silencio al arrancar desde la raíz | `dotenv.config()` busca el `.env` en la carpeta de arranque | ruta fija a `backend/.env` |
| El juego se trababa en la segunda mitad de la partida | 13 animaciones infinitas pintando sombras | solo `transform`/`opacity`/`filter`; lo vigila `verificar-normas` |
| El martillo se deslizaba durante el golpe | `translate` solo al 16 % y al 100 % del `@keyframes`: se interpolaba por el camino | repetir el valor en cada keyframe donde deba quedarse quieto |

## Lección de depuración transferible

Cuando algo **funciona a medias** (una parte del efecto sí y la otra no), casi
siempre es una **excepción que corta la función por la mitad**: todo lo que va
después de la línea que falla no ocurre. La consola (F12) lo dice en rojo.

Y cuando un botón **no responde aunque esté habilitado**, comprueba qué hay
encima:

```js
const b = document.querySelector("#boton-duelo");
const r = b.getBoundingClientRect();
document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
```

Si eso devuelve un elemento que no es tu botón, hay algo tapándolo. Así
encontramos lo del menú de configuración.
