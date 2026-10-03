# Autoevaluación

Repaso punto por punto del documento de requerimientos.
Leyenda: **[✓]** cumplido · **[!]** cumplido con matiz · **[ ]** pendiente del equipo.

---

## 1. Requisitos generales de entrega

| | Requisito | Estado |
|---|---|---|
| [ ] | Repositorio Git con commits de **ambos** integrantes | Pendiente: hay que crear el repo y que cada uno commitee de verdad. La nota es individual. |
| [✓] | `README.md` con nombre, integrantes, descripción, requisitos, instalación y capturas | Los nombres de los integrantes están por rellenar. |
| [✓] | `.gitignore` con `node_modules/`, `.env`, `dist/` y temporales | Añade también la base de datos local. |
| [✓] | `.env` con `.env.example` versionado, sin credenciales en el código | `CLAVE_API`, `IA_CLAVE` y el resto solo se leen desde `src/config/entorno.js`. La clave del modelo de lenguaje **no aparece en ningún archivo del frontend**: el navegador llama a `/api/mente` y es el servidor quien llama al proveedor. |
| [✓] | Nomenclatura uniforme: carpetas y archivos kebab-case, variables camelCase, clases PascalCase, constantes UPPER_SNAKE_CASE | Verificado automáticamente. |
| [!] | Un solo idioma para el código y los comentarios | **Todo el código y los comentarios están en español.** Las carpetas de la arquitectura (`src/css`, `js/modules`, `services`, `controllers`, `routes`…) mantienen el nombre del enunciado, porque el propio enunciado las dibuja así y son estructura obligatoria, no código. |

---

## 2. Organización del frontend

| | Requisito | Estado |
|---|---|---|
| [✓] | Estructura `frontend/index.html` + `src/{css,js,assets}` | Con `js/{main.js, modules, services, utils}` y los extras de videojuego. |
| [✓] | CSS separado, **sin `<style>` ni `style="..."`** | 14 hojas. El CSS de los efectos, que en la versión anterior se inyectaba desde JavaScript, ahora vive en `css/efectos.css`. |
| [✓] | Módulos ES6 (`import` / `export`), un archivo por responsabilidad | 71 módulos en el frontend y 31 en el backend. No hay ningún archivo con todo dentro. |
| [✓] | **Sin `onclick=`** en el HTML; todo con `addEventListener` | Verificado automáticamente. |
| [✓] | Sin variables globales sueltas | Todo va encapsulado en módulos y clases. La única propiedad que se cuelga de `window` es `JUEGO`, la puerta trasera de pruebas, y se documenta como tal. |
| [✓] | Comunicación con el backend centralizada en `services/` | La única llamada al backend está en `services/cliente-http.js`; los tres servicios tienen una función por punto de acceso. El otro `fetch` del proyecto carga el sprite de iconos, que es un recurso local, no el backend. |
| [✓] | Diseño responsivo verificable en móvil y escritorio | Tres saltos (altura baja, tableta, móvil) y respeto a `prefers-reduced-motion`. Comprobado a 390 px sin desbordamiento horizontal. |

### 2.2 Requisitos adicionales para videojuegos

| | Requisito | Estado |
|---|---|---|
| [✓] | `core/` con bucle principal, control del tiempo y renderizado | `bucle-animacion.js`, `reloj.js`, `gestor-escenas.js`, `bus-eventos.js`, `estado-juego.js`. El renderizado está aparte en `render/`, que es lo que pide el último punto. |
| [✓] | `entities/` con una clase por entidad | `Partida`, `Combatiente`, `Cadena`, `MedidorDeCarga`, `MochilaDePoderes`, `OponenteIA`, `RondaWordle`. |
| [✓] | Sin números mágicos en el equilibrio | Las probabilidades de la IA (usar poder, escudar, disparar bajo escudo) son constantes con nombre en `oponente-ia.js`. |
| [✓] | `scenes/` con menú, juego, pausa y fin | Cinco escenas: menú, partida, duelo, pausa y fin. |
| [✓] | Cuatro dificultades con personaje propio | EL MONGOLO, UNA GENTE, EL TÍGUERE y EL GENIO, esta última movida por un modelo de lenguaje real a través del backend. Cada una con avatar, frases y reacciones en `modules/personajes-ia.js` y `modules/frases-avatar.js`. |
| [✓] | `input/` con teclado, ratón y táctil aislados | `entrada-teclado.js` y `entrada-puntero.js`. Hay **un solo** `keydown` permanente en todo el proyecto; los otros dos son de un disparo (`{once:true}`) y solo desbloquean el audio. |
| [✓] | La lógica no depende del DOM ni del canvas | En `modules/` y `entities/` **no aparece ni un `document`**. El motor devuelve un parte de ronda y la escena lo escenifica. |

---

## 3. Organización del backend

| | Requisito | Estado |
|---|---|---|
| [✓] | Estructura por capas con `config`, `routes`, `controllers`, `services`, `repositories`, `models`, `middlewares`, `utils` | Completa. |
| [✓] | `server.js` únicamente levanta el servidor | 36 líneas: abre la base de datos, monta la app y escucha. |
| [✓] | Separación estricta: la ruta no consulta la BD, el controlador no construye SQL, el servicio no toca `req`/`res` | Todo el SQL está en `repositories/`. Los servicios lanzan `ErrorHttp` en vez de responder. |
| [✓] | Rutas en plural y verbos correctos | `/api/jugadores`, `/api/partidas`, `/api/puntuaciones`. `/api/mente` va en singular a propósito: no es una colección de recursos, es un intermediario hacia el modelo de lenguaje. |
| [✓] | Códigos de estado 200, 201, 400, 401, 404 y 500 | Los seis, probados con `curl`. |
| [✓] | Respuestas JSON uniformes `{ success, data, message }` | Centralizado en `utils/respuesta-json.js`. |
| [✓] | Middleware global de errores, sin devolver el error interno en crudo | `middlewares/manejador-errores.js`. En producción oculta el mensaje interno. |
| [✓] | Validación de entrada en el servidor | Validación manual documentada en `utils/validaciones.js` y dos middlewares. Devuelve la lista completa de campos que fallan. |
| [✓] | Consultas parametrizadas contra inyección SQL | Todas con `?`. Cero concatenación de texto. |
| [✓] | CORS configurado explícitamente | Lista de orígenes desde `.env`, con métodos y cabeceras declarados. |
| [✓] | Servicio de apoyo mínimo (registro / guardado / leaderboard) | Los tres: jugadores, partidas y tabla de puntuaciones persistida en SQLite. |

---

## 4. Normas contra el código espagueti

Comprobado automáticamente con `node herramientas/verificar-normas.mjs` sobre
**124 archivos**. Resultado: **0 incumplimientos**.

| | Norma | Estado |
|---|---|---|
| [✓] | Ninguna función pasa de 40 líneas | |
| [✓] | Ningún archivo pasa de 300 líneas | El más largo es `frontend/index.html` con 299. Cuando se quedó sin sitio, lo que se añadió (avatar, chat, fanfarrias) se construyó desde JavaScript, que además es donde le tocaba: son capas que aparecen y desaparecen, no esqueleto de la página. |
| [✓] | Máximo 3 niveles de anidación | |
| [✓] | Sin código duplicado | El patrón `{ jugador, ia }` permite escribir la lógica de bandos una sola vez. |
| [✓] | Sin código comentado ni `console.log` de depuración | El backend escribe en `process.stdout` / `process.stderr` cuando arranca y cuando hay un error, que es registro de servidor, no depuración. |
| [✓] | Sin números mágicos | Todos los valores ajustables están en `modules/constantes.js` (frontend) y en constantes con nombre en cada archivo del backend. |
| [✓] | Una tarea por función, nombre verbo + sustantivo | `calcularPuntuacion`, `pintarHud`, `resolverRonda`, `crecerCadena`… |
| [✓] | Indentación consistente | 2 espacios en todo el proyecto. |

---

## 5. Entregables del día de la presentación

| | Entregable | Estado |
|---|---|---|
| [ ] | Enlace al repositorio | Pendiente de crearlo. |
| [ ] | Aplicación desplegada (Netlify/Vercel + Render/Railway) o demo local sin errores | La demo local arranca con un doble clic en `jugar.bat` (o `npm start`), que levanta backend y frontend sin depender de ninguna extensión. El despliegue en la nube está pendiente; los pasos están en el README. |
| [✓] | Documento técnico de 3 a 5 páginas | `docs/documento-tecnico.md`, con diagrama de carpetas, diagrama de base de datos y descripción de la API. |
| [ ] | Vídeo de 5 a 8 minutos con los dos integrantes | Pendiente. |
| [!] | Defensa oral: cada integrante explica cualquier parte | Preparado el guion en `docs/guion-defensa.md`, pero hay que estudiarlo. |
| [✓] | Autoevaluación | Este documento. |

---

## 6. Autocrítica honesta

Cosas que un profesor exigente podría señalar, y qué responderíamos:

1. **Los nombres de las carpetas de arquitectura están en inglés mientras el
   código está en español.** Es deliberado: el enunciado dibuja esa estructura
   literalmente y la marca como obligatoria. Si prefiere verlas en español, es
   un renombrado mecánico de carpetas y de las rutas de los `import`.

2. **La clave de la API es una clave compartida, no autenticación real.** Para
   el alcance de la práctica sirve y justifica el 401, pero en producción haría
   falta un sistema de usuarios con contraseñas cifradas y tokens.

3. **SQLite en la nube es frágil.** En Render el disco es efímero salvo que se
   monte un volumen persistente. Para el día de la presentación es una ventaja
   (funciona sin internet); para producción habría que pasar a PostgreSQL, y
   como todo el SQL está en `repositories/`, el cambio se limita a esa carpeta.

4. **No hay pruebas automáticas dentro del repositorio.** Las pruebas se
   escribieron y se ejecutaron durante el desarrollo (48 comprobaciones de
   lógica y **ocho recorridos completos en navegador**: recorrido general,
   duelo ganado, escudo contra pistola, las nueve fanfarrias, el avatar, el
   diseño en siete tamaños, el juego sin clave de API y el juego con ella),
   pero no se dejaron integradas como suite. Lo que sí queda es el verificador
   de normas.

7. **EL GENIO depende de un servicio de terceros.** Es la única parte del
   proyecto que no es autosuficiente, y por eso se diseñó para que su ausencia
   no se note: sin clave juega con la estrategia difícil y habla con frases
   propias, y el chatbot tira de su tabla de respuestas. Se puede corregir el
   proyecto entero sin configurar ninguna API. Lo que no se puede es enseñar
   esa dificultad en la defensa sin conectarla antes; para eso vale un Ollama
   en local, que no cuesta nada.

5. **Los audios pesan 84 MB.** GitHub los admite, pero el clonado tarda. Si
   molesta, se mueven a Git LFS.

6. **El equilibrio de la pistola y el escudo está sin jugar de verdad.** Las
   probabilidades de la IA (45 % de gastar un poder, 40 % de escudar, 35 % de
   disparar con el escudo enfrente) son un punto de partida razonado, no medido.
   Están en constantes con nombre al principio de `oponente-ia.js` para poder
   moverlas después de un par de partidas.
