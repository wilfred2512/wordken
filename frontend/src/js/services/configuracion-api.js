/**
 * Dirección del backend.
 *
 * El frontend es estático (no pasa por un empaquetador), así que no puede
 * leer un .env en tiempo de ejecución. Este archivo hace de equivalente: es
 * el ÚNICO sitio donde aparece la URL del servidor, igual que el .env es el
 * único sitio donde aparece en el backend.
 *
 * Al desplegar en Netlify o Vercel se cambia esta constante por la URL
 * pública del backend (Render o Railway).
 */

const URL_LOCAL = "http://localhost:3000/api";

/** Detecta si la página se está sirviendo desde el ordenador del equipo. */
function esEntornoLocal() {
  const anfitrion = window.location.hostname;
  return anfitrion === "localhost" || anfitrion === "127.0.0.1" || anfitrion === "";
}

/**
 * URL base de la API.
 * En producción hay que sustituir la segunda rama por la URL real.
 */
export const URL_BASE_API = esEntornoLocal() ? URL_LOCAL : "/api";

/** Milisegundos antes de dar una petición por perdida. */
export const TIEMPO_LIMITE_MS = 6000;

/**
 * Lo que se espera a las peticiones que pasan por un modelo de lenguaje.
 *
 * Tiene que ser MÁS LARGO que el `IA_TIEMPO_LIMITE_MS` del .env del backend,
 * y esa es toda la razón de que exista. Si el navegador corta antes que el
 * servidor, el que decide es el de fuera y el del .env no sirve de nada:
 * daba igual subirlo a 12 segundos porque a los 6 el navegador ya había
 * abandonado, y el ayudante contestaba siempre con sus frases de repuesto
 * aunque el modelo estuviera respondiendo perfectamente al otro lado.
 *
 * Pedirle una tirada al modelo son diez palabras de JSON; pedirle al
 * ayudante que explique una regla son dos o tres frases con el manual
 * entero como contexto. Lo segundo tarda bastante más, sobre todo con un
 * modelo local.
 */
export const TIEMPO_LIMITE_MODELO_MS = 30000;

/**
 * Si el backend no responde, el juego debe seguir siendo jugable: la tabla de
 * puntuaciones es un extra, no un requisito para jugar.
 */
export const EL_JUEGO_FUNCIONA_SIN_BACKEND = true;
