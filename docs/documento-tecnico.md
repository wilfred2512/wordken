# Documento técnico

**Mini proyecto de evaluación — Resultado de Aprendizaje 1**
Aplicaciones Web con JavaScript · equipo de dos integrantes

---

## 1. Descripción del proyecto

### 1.1 Qué es

Un videojuego web de piedra, papel o tijera contra una IA, hecho con **HTML,
CSS y JavaScript puro** en el frontend y **Node.js con Express y SQLite** en el
backend. No hay frameworks ni librerías de terceros en el cliente: ni React, ni
jQuery, ni motor de juego.

Lo que lo separa de un piedra-papel-tijera normal son tres mecánicas encadenadas:

1. **Sistema de vida y cadenas.** En vez de un marcador hay puntos de vida.
   Ganar rondas seguidas construye una cadena que multiplica el daño; conseguir
   la racha siempre con la misma tirada la *sella*; sellar las tres tiradas es
   victoria instantánea.
2. **Círculo de carga.** El daño que el jugador inflige llena un medidor
   circular. El umbral lo configura el jugador antes de empezar.
3. **Duelo de palabras.** Al llenarse el círculo se desbloquea un Wordle a
   contrarreloj de jergas del español. Ganarlo da una bonificación; perderlo se
   la regala a la IA.

Y dos capas más, que son las que le ponen cara al rival:

4. **Un personaje por dificultad.** EL MONGOLO, UNA GENTE, EL TÍGUERE y EL GENIO.
   Cada uno tiene avatar, color y frases propias, y comenta lo que va pasando
   en la partida. La cuarta, EL GENIO, la mueve un **modelo de lenguaje real**
   a través del backend.
5. **Un ayudante.** Un chat que explica cómo se juega sin salir del juego, con
   el modelo detrás si lo hay y con respuestas propias si no.

### 1.2 Por qué está montado así

La decisión que ordena todo el proyecto es esta: **la lógica del juego no toca
el DOM**. El motor de la ronda recibe la jugada, cambia el estado y devuelve un
objeto que llamamos *parte de ronda*:

```js
{
  cartasJugador: ["piedra"], cartasIa: ["tijera"],
  resultado: "jugador", ganador: "jugador", perdedor: "ia",
  nivel: 3, dano: 3, explicacion: "cadena x3",
  tiradaSellada: "piedra", cadenaMaxima: false,
  duelosDesbloqueados: 1, anuncios: [...], cruces: [...]
}
```

La escena lee ese parte y lo *escenifica*: revela las cartas, congela la imagen,
sacude la pantalla, lanza partículas y enseña los carteles. Ninguna de esas dos
mitades sabe cómo funciona la otra.

Esto tiene tres consecuencias prácticas:

- Se puede jugar una partida entera desde la consola del navegador, sin
  interfaz, y comprobar que las reglas funcionan.
- Las pruebas automáticas del motor corren en Node, sin navegador
  (`node herramientas/...`, ver sección 6).
- Cambiar el ritmo o los efectos del juego es tocar un solo archivo
  (`scenes/escenificar-ronda.js`) sin riesgo de romper una regla.

La prueba de que la frontera está bien puesta: **en `modules/` y `entities/` no
aparece ni un `document`**, y en `render/` no aparece ni un `if` sobre quién
gana.

---

## 2. Arquitectura de carpetas

### 2.1 Frontend

```
frontend/
├── index.html                    estructura, sin estilos ni manejadores
└── src/
    ├── css/                      14 hojas, una por zona
    │   ├── base.css              tokens de color, reinicio, fondo animado
    │   ├── botones.css           botones y selectores
    │   ├── menu.css              pantalla de menú y tabla de puntuaciones
    │   ├── modales.css           ventanas emergentes
    │   ├── partida.css           paneles de vida y arena
    │   ├── cartas.css            mano del jugador e historial
    │   ├── carga-y-poderes.css   círculo de carga y fichas de poderes
    │   ├── duelo.css             pantalla del Wordle
    │   ├── efectos.css           partículas, golpes de cámara, carteles
    │   ├── efectos-interfaz.css  reacción de botones, barras, fichas y teclas
    │   ├── fanfarrias.css        una animación por habilidad especial
    │   ├── avatar-ia.css         la carita del rival y su bocadillo
    │   ├── chat-ayuda.css        el panel del ayudante
    │   ├── vida-propia.css       lo que se mueve solo, sin que pase nada
    │   └── responsivo.css        los tres saltos de tamaño
    ├── assets/
    │   ├── audios/               12 pistas con nombre descriptivo
    │   └── iconos.svg            sprite de los iconos de las tiradas
    └── js/
        ├── main.js                       punto de entrada: solo orquesta
        ├── core/        (engine)         infraestructura
        │   ├── bus-eventos.js            publicación y suscripción
        │   ├── reloj.js                  cuenta atrás del duelo
        │   ├── bucle-animacion.js        requestAnimationFrame compartido
        │   ├── gestor-escenas.js         quién se ve en cada momento
        │   └── estado-juego.js           estado compartido entre escenas
        ├── entities/                     una clase por entidad
        │   ├── partida.js                la ficha de la partida
        │   ├── combatiente.js            vida y umbrales de un bando
        │   ├── cadena.js                 racha, sub-racha y sellos
        │   ├── medidor-carga.js          el círculo del centro
        │   ├── mochila-poderes.js        poderes guardados y activos
        │   ├── oponente-ia.js            el rival
        │   └── ronda-wordle.js           una ronda del duelo
        ├── scenes/                       menú, partida, duelo, pausa, fin
        ├── input/                        teclado y puntero, aislados
        ├── render/                       todo lo que toca el DOM
        ├── modules/                      las reglas (sin DOM)
        │   ├── reglas-tiradas.js         tabla de quién vence a quién
        │   ├── motor-ronda.js            el corazón
        │   ├── resolutor-tiradas.js      veredicto, pistola y doble o nada
        │   ├── calculo-dano.js           multiplicadores y bonificaciones
        │   ├── gestion-cadenas.js        crecer, sellar y romper cadenas
        │   ├── eventos-de-ronda.js       bloqueos y umbrales de vida
        │   ├── efectos-poderes.js        qué hace cada bonificación
        │   ├── catalogo-poderes.js       cómo se llaman y cuánto duran
        │   ├── estrategias-ia.js         las tres estrategias clásicas
        │   ├── personajes-ia.js          quién es la IA en cada dificultad
        │   ├── frases-avatar.js          lo que dice cada personaje
        │   ├── mente-rival.js            la dificultad movida por un modelo
        │   ├── faq-juego.js              respuestas del ayudante sin modelo
        │   ├── logica-wordle.js          evaluación de intentos
        │   ├── diccionario-jergas.js     85 palabras (42 RD)
        │   ├── constantes.js             todos los números ajustables
        │   └── audio/                    catálogo, sintetizador, gestor, DJ
        ├── services/                     comunicación con el backend
        └── utils/                        dom, números, azar, tiempo, texto
```

Las capas, y la regla de que cada una solo usa las de su izquierda:

```
utils → entities/modules → render → scenes → main
                    ↑
                 services
```

### 2.2 Backend

```
backend/
├── server.js                  solo levanta el puerto
├── .env.example               plantilla de variables
└── src/
    ├── config/
    │   ├── entorno.js         el único archivo que lee process.env
    │   ├── base-datos.js      conexión única a SQLite
    │   ├── aplicacion.js      monta Express (separado para poder testear)
    │   └── sembrar-datos.js   datos de ejemplo
    ├── models/
    │   ├── esquema.sql        el esquema completo, idempotente
    │   ├── modelo-jugador.js  traduce snake_case ↔ camelCase
    │   └── modelo-partida.js
    ├── repositories/          el único sitio con SQL
    ├── services/              reglas de negocio
    │   ├── cliente-modelo.js  el ÚNICO archivo que llama a una IA externa
    │   ├── manual-juego.js    las reglas, escritas para que las lea un modelo
    │   └── servicio-mente.js  jugada de EL GENIO y respuestas del ayudante
    ├── controllers/           reciben la petición y responden
    ├── routes/                verbo → controlador, sin lógica
    │                          (incluye rutas-mente.js: el puente al modelo)
    ├── middlewares/           validación, autorización, 404 y errores
    └── utils/                 respuestas y errores HTTP
```

### 2.3 Herramientas

```
herramientas/
├── arrancar-todo.mjs       levanta backend + frontend y abre el navegador
├── servidor-estatico.mjs   servidor del frontend, sin dependencias
└── verificar-normas.mjs    comprueba la sección 4 del enunciado
```

`servidor-estatico.mjs` está escrito solo con módulos de Node porque el
frontend usa ES6 y el navegador los bloquea en `file://`: hace falta un
servidor sí o sí, y depender de una extensión de editor es frágil el día de la
presentación. Son unas 100 líneas con tipos MIME y una comprobación de que
ninguna petición se sale de `frontend/`.

El flujo de una petición, sin saltarse ninguna capa:

```
petición → ruta → middleware de validación → controlador
                                                  ↓
                                              servicio  (reglas)
                                                  ↓
                                            repositorio (SQL)
                                                  ↓
                                              SQLite
```

Y el de un error:

```
servicio lanza ErrorHttp(404, "...")
        ↓
Express lo recoge
        ↓
manejadorDeErrores → { success:false, data:null, message:"..." } + estado 404
```

Ningún controlador construye SQL, ninguna ruta consulta la base de datos y
ningún servicio toca `req` ni `res`.

---

## 3. Base de datos

### 3.1 Diagrama

```
┌───────────────────────────┐
│         jugadores         │
├───────────────────────────┤
│ PK id          INTEGER    │
│    nombre      TEXT  UNIQ │
│    creado_en   TEXT       │
└─────────────┬─────────────┘
              │ 1
              │
              │ N          ON DELETE CASCADE
┌─────────────┴──────────────────────────────┐
│                  partidas                  │
├────────────────────────────────────────────┤
│ PK id                INTEGER               │
│ FK jugador_id        INTEGER → jugadores.id│
│    gano              INTEGER  (0 / 1)      │
│    cadena_maxima     INTEGER  (0 / 1)      │
│    dificultad        TEXT  (facil|normal|  │
│                             dificil)       │
│    rondas            INTEGER               │
│    dano_hecho        INTEGER               │
│    dano_recibido     INTEGER               │
│    mejor_cadena      INTEGER               │
│    sellos            INTEGER               │
│    duelos_ganados    INTEGER               │
│    duelos_perdidos   INTEGER               │
│    poderes_usados    INTEGER               │
│    puntuacion        INTEGER  ← lo calcula │
│                                 el servidor│
│    jugada_en         TEXT                  │
└────────────────────────────────────────────┘

Índices:  idx_partidas_jugador     (jugador_id)
          idx_partidas_puntuacion  (puntuacion DESC)
```

La tabla de puntuaciones **no es una tabla**: es una consulta agregada sobre
`partidas`, agrupada por jugador. Guardar el ranking materializado obligaría a
mantenerlo sincronizado en cada inserción; calculándolo, no puede quedarse
desfasado.

### 3.2 Decisiones

- **SQLite** y no PostgreSQL: cero configuración y funciona sin internet el día
  de la presentación. En la nube hay que montar un disco persistente.
- **El SQLite de Node (`node:sqlite`) y no `better-sqlite3`**: la librería es
  nativa y, sin binario prehecho para la versión de Node del equipo, necesita
  Visual Studio para compilarse. El módulo integrado no tiene dependencias, y
  el backend se queda con tres paquetes de JavaScript puro.
- **`CHECK` en las columnas**: `gano IN (0,1)`, `dificultad IN (...)`,
  contadores `>= 0`. La validación del servidor es la primera barrera, pero la
  base de datos es la última.
- **`ON DELETE CASCADE`**: borrar un jugador se lleva sus partidas. Sin esto
  quedarían filas huérfanas apuntando a un id que ya no existe.
- **Consultas parametrizadas siempre.** Ni una sola concatenación de texto en
  todo el repositorio. `WHERE id = ?` con el valor aparte: así el motor trata el
  dato como dato y nunca como SQL, que es exactamente lo que impide la
  inyección.

### 3.3 Cálculo de la puntuación

Vive en `src/services/servicio-puntuacion.js`.

```
puntuación = 1000 (si gana)
           + 1500 (si es cadena máxima)
           +   10 × daño hecho
           +   50 × mejor cadena
           +  150 × sellos
           +  120 × duelos ganados
           −   60 × duelos perdidos
           −    5 × rondas
```

Nunca baja de cero. Las rondas restan para premiar las victorias rápidas: ganar
en 12 rondas vale más que ganar en 40.

---

## 4. Puntos de acceso de la API

Base: `http://localhost:3000/api`
Todas las respuestas: `{ success, data, message }`.

### 4.1 Jugadores

| Verbo | Ruta | Cuerpo | Respuesta | Códigos |
|---|---|---|---|---|
| GET | `/jugadores` | — | lista de jugadores | 200 |
| GET | `/jugadores/:id` | — | un jugador | 200 · 400 · 404 |
| POST | `/jugadores` | `{ nombre }` | el jugador creado | 201 · 400 |
| PUT | `/jugadores/:id` | `{ nombre }` | el jugador actualizado | 200 · 400 · 401 · 404 |
| DELETE | `/jugadores/:id` | — | `{ id }` | 200 · 400 · 401 · 404 |

### 4.2 Partidas

| Verbo | Ruta | Cuerpo | Respuesta | Códigos |
|---|---|---|---|---|
| GET | `/partidas?jugadorId=&limite=` | — | lista de partidas | 200 · 404 |
| GET | `/partidas/:id` | — | una partida | 200 · 400 · 404 |
| POST | `/partidas` | estadísticas | `{ partida, desglose }` | 201 · 400 |
| DELETE | `/partidas/:id` | — | `{ id }` | 200 · 400 · 401 · 404 |

Cuerpo de `POST /partidas`:

```json
{
  "nombreJugador": "Tiguere",
  "gano": true,
  "cadenaMaxima": false,
  "dificultad": "dificil",
  "rondas": 14,
  "danoHecho": 20,
  "danoRecibido": 6,
  "mejorCadena": 6,
  "sellos": 2,
  "duelosGanados": 2,
  "duelosPerdidos": 0,
  "poderesUsados": 2
}
```

El jugador se crea solo si no existía. La puntuación **no se manda**.

### 4.3 Puntuaciones

| Verbo | Ruta | Respuesta | Códigos |
|---|---|---|---|
| GET | `/puntuaciones?limite=` | ranking numerado | 200 |

```json
{
  "success": true,
  "data": [
    { "posicion": 1, "jugadorId": 1, "nombre": "Tiguere",
      "mejorPuntuacion": 3620, "partidasJugadas": 1, "partidasGanadas": 1,
      "duelosGanados": 2, "cadenasMaximas": 1,
      "ultimaPartida": "2026-09-19 02:50:39" }
  ],
  "message": "Top 1 de la tabla de puntuaciones."
}
```

### 4.4 El puente al modelo de lenguaje

| Verbo | Ruta | Respuesta | Códigos |
|---|---|---|---|
| GET | `/mente` | `{ disponible }` | 200 |
| POST | `/mente/jugada` | `{ disponible, tirada, comentario }` | 200 |
| POST | `/mente/ayuda` | `{ disponible, respuesta }` | 200, 400 |

Tres cosas que explican por qué este recurso está hecho así:

**No guarda nada.** Es un intermediario, no un CRUD. Por eso no tiene `PUT` ni
`DELETE`, y por eso no exige `x-clave-api`: no hay nada destructivo que
proteger.

**No devuelve error cuando no hay modelo.** Contesta `disponible: false` con un
**200**. Que el `.env` no tenga clave no es un fallo del servidor; es el caso
normal, y el cliente sabe seguir sin ella.

**El guion lo pone el servidor, no el navegador.** `/mente/ayuda` solo acepta
la lista de mensajes; las instrucciones y el manual del juego se añaden aquí
(`services/manual-juego.js`). Si el cliente pudiera mandar su propio guion, el
chatbot dejaría de ser el chatbot del juego y pasaría a ser lo que quisiera
quien abriera la consola.

### 4.5 Errores y seguridad

- **400** — datos mal formados. La respuesta lleva la **lista completa** de
  campos que fallan, no solo el primero, para poder corregirlo todo de una vez.
- **401** — falta la cabecera `x-clave-api` o no coincide con `CLAVE_API`.
  Protege `PUT` y `DELETE`.
- **404** — recurso o ruta inexistente. Hay un middleware final que convierte
  cualquier URL desconocida en un 404 en JSON; sin él Express devolvería HTML
  y el frontend recibiría HTML donde espera JSON.
- **500** — cualquier excepción no prevista. En producción el mensaje interno
  se oculta y el cliente solo ve «Error interno del servidor».
- **CORS** configurado explícitamente con la lista de orígenes del `.env`.
- **La clave del modelo de lenguaje vive en `backend/.env` y en ningún otro
  sitio.** El enunciado prohíbe credenciales en el código fuente, y además
  ponerla en el frontend sería publicarla: el JavaScript de una página lo lee
  cualquiera con F12. El navegador le habla a `/api/mente` y es el proceso de
  Node —que sí puede guardar un secreto— el que llama al proveedor.

---

## 5. Detalles de implementación que merecen explicación

### 5.1 Guardar hechos, derivar conclusiones

La clase `Cadena` guarda **la lista de tiradas ganadoras** y nada más. El nivel
(x1, x2, x3) y la longitud de la sub-racha se **calculan** cada vez que se
piden.

Si en cambio se guardara una propiedad `nivel`, habría que acordarse de
actualizarla en todos los puntos donde la cadena cambia. Olvidarlo en uno solo
daría una insignia que dice x3 mientras el daño aplicado es x2. Calculándolo,
es **imposible** que se contradigan.

### 5.2 El daño base es fijo en 1

Si el daño creciera con la vida, subir la vida no alargaría la partida: harían
falta los mismos golpes. Con daño fijo, más vida es de verdad más rondas.

### 5.3 Los vetos cruzados tras cinco empates

A cada bando se le prohíbe una tirada **distinta**. Si se les quitara la misma,
los dos se quedarían con las mismas dos cartas y la probabilidad de empate
subiría a 1/2 — justo lo contrario de lo que se busca. Con vetos cruzados baja
a 1/4.

### 5.4 La pistola y el escudo: una tabla, cero casos especiales

La pistola vence a las tres tiradas normales y el escudo solo vence a la
pistola. La tentación es escribir eso con `if` encadenados:

```js
if (propia === "pistola") return GANA;          // ...pero no contra el escudo
if (rival === "pistola") return PIERDE;         // ...salvo que yo tenga escudo
```

Cada carta nueva añadiría dos excepciones más y antes o después una se
contradiría con otra. La solución es una **tabla completa** de a quién vence
cada tirada:

```js
export const VENCE_A = {
  piedra:  ["tijera", "escudo"],
  papel:   ["piedra", "escudo"],
  tijera:  ["papel",  "escudo"],
  pistola: ["piedra", "papel", "tijera"],
  escudo:  ["pistola"],
};
```

La tabla cumple una invariante: para cualquier par de tiradas distintas,
exactamente una aparece en la lista de la otra. Con eso, comparar son tres
líneas y **no hay ningún caso especial**:

```js
export function comparar(propia, rival) {
  if (propia === rival) return EMPATE;
  return VENCE_A[propia].includes(rival) ? GANA : PIERDE;
}
```

Añadir lagarto y spock sería tocar el objeto y nada más.

#### Por qué existe el escudo

Por equilibrio. La pistola, sola, era una victoria regalada: activarla y
dispararla ganaba la ronda sí o sí. El escudo la convierte en una apuesta.

Reglas del pulso, todas simétricas:

1. En cuanto un bando **activa** la pistola, el otro recibe un escudo
   (`efectos-poderes.js` → `entregarEscudoAlRival`).
2. Las dos cartas se gastan al jugarse, acierten o no.
3. Cuando la pistola se dispara, el escudo se retira: ya no hay amenaza que
   parar (`limpiarEscudosSinAmenaza`).

Esa tercera regla es la que evita un bloqueo eterno: sin ella, el que tiene la
pistola podría no disparar nunca para que el escudo del rival no le sirviera de
nada, y el escudo se quedaría puesto para siempre.

El escudo **no entra en el sorteo de premios** del duelo. Para eso existe
`IDS_SORTEABLES`, que filtra los poderes marcados como `esConcedido`: un escudo
ganado en una ruleta saldría sin nada que parar.

### 5.5 El orden de las operaciones del daño

```
daño = base × nivelDeCadena × multiplicadorDeJugada × ruleta + martillo
```

Los multiplicadores van primero y la bonificación plana al final. Si el martillo
se sumara antes también se multiplicaría, y un +3 se convertiría en +9 con una
triple cadena.

### 5.6 El bloqueo dura dos rondas, no una

El bloqueo se reparte **durante** la ronda que lo provoca, y al terminar esa
ronda el motor descuenta uno a todos los vetos. Con una sola ronda de duración
se quedaría en cero antes de llegar a aplicarse nunca.

### 5.7 Letras repetidas en el Wordle

Si la palabra es MANGO y el jugador escribe MAMMA, solo la primera M puede
marcarse. La solución es contar cuántas veces aparece cada letra de la palabra
secreta y **consumir** una aparición en cada acierto. Dos pasadas: primero las
que están en su sitio exacto, después las que están en otra posición.

### 5.8 Tildes y eñes

El duelo compara siempre una versión normalizada: mayúsculas, sin tildes. Para
no convertir la Ñ en N, se aparta con un marcador antes de descomponer el texto
en Unicode y se restaura después.

### 5.9 Zoom y sacudida en una sola animación

Las dos usan `transform`, y en CSS dos animaciones peleándose por la misma
propiedad se pisan: gana una y la otra no se ve. Por eso el golpe de cámara es
una única regla `@keyframes`.

### 5.10 El autoplay del navegador

Ningún navegador deja reproducir audio antes de que el usuario interactúe con
la página. No es un fallo: es política del navegador. El gestor de audio espera
al primer clic o tecla, detecta si le rechazan el `play()` y lo reintenta solo
en el siguiente gesto.

### 5.11 Las pistas del duelo: tipo y región son cosas distintas

La primera versión guardaba una sola `categoria` por palabra, y ahí se mezclaba
el tema (Comida, Música) con la geografía (España, México). El resultado era
que el duelo llegaba a enseñar «categoría: España · de dónde: España», dos
recuadros con la misma palabra y cero información.

Ahora cada entrada tiene `tipo` (de qué habla: Persona, Dinero, Baile,
Cualidad…) y `region` (de dónde viene), y los dos recuadros siempre dicen algo
distinto.

Con el cambio se replanteó también cuándo se enseña cada cosa. Antes la pista
con el significado estaba escondida hasta el tercer intento; con un reloj
corriendo desde el primer segundo, eso no era dificultad, era perder el tiempo.
Ahora:

- **Desde el segundo cero:** tipo, región, número de letras y la pista con el
  significado.
- **Al segundo fallo:** una pista extra que revela la primera letra. Se calcula
  a partir de la propia palabra (`pistaExtra()`), así que ninguna entrada del
  diccionario se puede quedar sin ella.

Y al perder, el tablero se queda a la vista con la solución escrita durante
`ESPERA_TRAS_PERDER_DUELO` milisegundos antes de volver a la partida: si la
pantalla saltara al instante no daría tiempo a comparar lo que escribiste con
lo que era, que es justo donde se aprende la palabra.

### 5.12 La pausa no reutiliza el silencio

Parar la música al pausar parece que se resuelve llamando a `silenciar(true)`,
pero entonces al volver se desharía el silencio que el jugador hubiera puesto a
mano con el botón de sonido. Son dos estados distintos: `silenciado` es del
jugador y `enPausa` es del juego. `reanudar()` solo vuelve a sonar si el
jugador no lo tenía silenciado.

### 5.13 `parseInt(texto) || respaldo` no sirve

En JavaScript el **0 es falsy**, así que `parseInt("0") || 20` devuelve 20 en
vez de 0. Por eso la lectura de las casillas numéricas comprueba
`Number.isNaN` explícitamente. Fue un error real de una versión anterior: la
configuración decía 20 mientras la pantalla enseñaba un 0.

### 5.14 Cada habilidad se anima sola: el catálogo manda

Las nueve bonificaciones entran en escena con una animación distinta cada una.
La tentación era escribir nueve funciones; lo que hay es **un campo más en el
catálogo**:

```js
pistola: { …, gesto: "disparo" },
martillo: { …, gesto: "impacto" },
```

`render/fanfarria-poder.js` pone la clase `gesto-disparo` en la capa y el CSS
tiene un bloque por gesto. Inventar un poder con animación propia es una
entrada en el catálogo y un bloque de CSS: **ni una línea del renderizador**.
El sonido va igual, porque el sintetizador tiene una melodía con el nombre del
gesto y no hace falta ninguna tabla de conversión.

Las fanfarrias **no esperan a nadie**: se lanzan y siguen solas mientras la
ronda continúa. De hecho sustituyeron a los carteles de texto que antes
anunciaban esos mismos poderes, y como aquellos sí bloqueaban, la ronda con
poderes salió **más rápida** que antes.

### 5.15 El avatar se construye desde JavaScript

El rival tiene cara, nombre y bocadillo, y nada de eso está en `index.html`.
Hay dos razones y la segunda es la de fondo:

1. El enunciado limita los archivos a 300 líneas e `index.html` iba justo.
2. **Lo que es estructura fija vive en el HTML; lo que aparece y desaparece con
   la partida, no.** Es la misma regla que ya seguían las capas de efectos y
   las fichas de las mochilas. El avatar nace al empezar una partida y muere al
   salir de ella: es estado, no esqueleto.

`render/avatar-ia.js` tampoco sabe ninguna regla. Recibe el nombre de un
momento (`"ganaIa"`, `"dueloPerdido"`…) y se ocupa de la cara, el bocadillo y
la animación. Quién decide que ha pasado eso es la escena, igual que con todo
lo demás.

Un detalle que costó dos intentos: cuándo puede una frase pisar a otra. Con la
regla «no interrumpas nunca», el saludo bloqueaba media partida; sin regla, las
frases se cambiaban antes de poder leerlas. La solución fue un **tiempo mínimo
en pantalla** de 1,3 s —lo que cuesta leer una línea corta— con dos
excepciones: los momentos importantes (el final, el duelo) y **cualquier frase
escrita por el modelo para esa ronda concreta**, que por definición es más
interesante que una frase enlatada.

### 5.16 EL GENIO piensa mientras tú piensas

La cuarta dificultad la mueve un modelo de lenguaje de verdad, y el problema no
era conectarlo: era el tiempo. Preguntarle tarda entre medio segundo y varios,
y `resolverRonda()` es **síncrona**. Hacerla asíncrona habría contaminado media
base de código, y esperar habría devuelto el juego al problema que acabábamos
de arreglar: la espera eterna al pulsar una carta.

La solución no toca el motor. En cuanto la mesa queda lista para tu jugada
—`prepararMesa()`— se le pide al modelo su tirada y su comentario, y la
respuesta se guarda en un cajón dentro del oponente
(`OponenteIA.consejo`). Cuando eliges carta, `resolverRonda()` lo consume si
está y tira de la estrategia difícil si no:

```js
const consejo = partida.oponente.consumirConsejo();
parte.cartasIa = elegirCartasDeLaIa(partida, apostante, consejo?.tirada);
```

Medido con el modelo conectado: **999 ms de ronda**, exactamente lo mismo que
sin él. Y el consejo se valida antes de usarse, porque lo que devuelve un
modelo es texto libre: si contestara «lagarto», la ronda se quedaría sin carta
que jugar.

El cajón se vacía **siempre** al consumirlo, aunque la tirada no sirva. Un
consejo pensado para la ronda pasada aplicado a la siguiente sería peor que no
tener ninguno.

### 5.17 El chatbot tiene dos cerebros

El enunciado pide un chatbot que explique cómo se juega. Un chatbot que solo
arranca si alguien paga una API no explica nada el día que se corrige el
proyecto sin clave, así que el ayudante funciona en los dos casos:

- **Con modelo**: `services/servicio-mente.js` le manda la conversación junto
  con el manual del juego, que vive en el servidor.
- **Sin modelo**: `modules/faq-juego.js`, una tabla de respuestas emparejadas
  por palabras clave.

El emparejamiento de la tabla es deliberadamente tonto —cuenta cuántas claves
de cada entrada aparecen en la pregunta— porque ahí lo que importa es acertar
el **tema**, no entender la frase. Para entender la frase ya está el modelo.

Que sean dos archivos distintos y no uno compartido también es a propósito: el
manual del servidor es **contexto para un modelo** y la tabla son **respuestas
ya escritas**. Parecen lo mismo y no lo son.

---

## 6. Pruebas

El proyecto se ha verificado en tres niveles:

1. **Lógica pura, sin navegador.** 48 comprobaciones sobre el motor de ronda,
   las cadenas, los poderes y el Wordle, corriendo en Node contra los módulos
   reales. Cubren el guion determinista de la cadena máxima, el ascenso de una
   cadena mezclada a triple, el orden del daño con martillo, el veto del
   bloqueo, el caso MAMMA/MANGO y las ocho combinaciones de pistola y escudo.
2. **Interfaz, en Chromium.** Recorrido completo: menú → configuración →
   partida → duelo ganado → elección de poder → activación → fin de partida →
   guardado en el servidor → tabla de puntuaciones. Cero errores de consola.
3. **Normas del enunciado.** `node herramientas/verificar-normas.mjs` revisa los
   124 archivos del proyecto y comprueba los límites de la sección 4.

A esos tres niveles se añadieron, con los requisitos nuevos, cuatro recorridos
más en navegador:

- **Las nueve fanfarrias**: se lanza cada una y se comprueba que pone su gesto,
  que se apaga sola y que la capa no se come los clics.
- **El avatar**: los cuatro personajes en el menú, el saludo al empezar, el
  comentario tras la ronda, y que la cara no pise la carta del rival ni en
  pantallas bajas.
- **El diseño en siete tamaños** (de 1920×915 a 390×740), comprobando que no se
  solapan HUD, cartas, mano, avatar y botones, **repitiéndolo todo con la letra
  un 40 % más grande**: la fuente de píxeles real es más ancha que la de
  repuesto del contenedor donde se probó, y sin ese margen el diseño habría
  pasado las pruebas y fallado en la máquina del equipo.
- **El juego sin clave de API**: que el chatbot siga contestando, que reconozca
  lo que no sabe y que EL GENIO se pueda jugar igual.

---

## 7. Lo que quedó fuera

- Modo de dos jugadores locales.
- Guardado de la partida a medias (solo se guarda al terminar).
- Autenticación real: la clave de la API es una clave compartida, suficiente
  para el alcance de la práctica pero no para producción.
- Traducción de la interfaz a otros idiomas.
