/**
 * Lo que el juego le pide al backend sobre el modelo de lenguaje.
 *
 * Fíjate en lo que NO hay aquí: ninguna clave, ninguna URL de OpenAI ni de
 * ningún otro proveedor. Todo eso vive en el .env del servidor. El frontend
 * solo conoce su propio backend, que es lo único que puede conocer sin
 * publicarlo: el JavaScript de una página lo lee cualquiera con F12.
 *
 * Las tres funciones fallan en silencio a propósito. Que no haya modelo, ni
 * servidor, ni internet no es un error del juego: es el caso normal, y el
 * juego entero funciona igual sin ello.
 */
import { http, esFalloDeConexion } from "./cliente-http.js";
import { TIEMPO_LIMITE_MODELO_MS } from "./configuracion-api.js";

const SIN_MODELO = { disponible: false };

/**
 * Las dos peticiones que pasan por el modelo esperan mucho más que el resto.
 * El tiempo de verdad lo pone el backend con su `IA_TIEMPO_LIMITE_MS`; esto
 * solo se aparta para no cortarle antes de tiempo.
 */
const ESPERA_LARGA = { limiteMs: TIEMPO_LIMITE_MODELO_MS };

/**
 * ¿Tiene el servidor un modelo configurado?
 * Si ni siquiera contesta, se marca `sinServidor` para que el chat pueda
 * decir "arranca el backend" en vez de un vago "no hay IA".
 */
export async function comprobarModelo() {
  try {
    return await http.obtener("/mente");
  } catch (error) {
    return { ...SIN_MODELO, sinServidor: esFalloDeConexion(error) };
  }
}

/**
 * Le pide a LA MENTE su próxima tirada y su comentario.
 * @param {object} estado resumen de la partida
 * @returns {Promise<{disponible:boolean, tirada?:string, comentario?:string}>}
 */
export async function pedirJugadaDeLaMente(estado) {
  try {
    return await http.crear("/mente/jugada", estado, ESPERA_LARGA);
  } catch (error) {
    return SIN_MODELO;
  }
}

/**
 * Le pasa la conversación al ayudante.
 * @param {{role:string, content:string}[]} mensajes
 * @returns {Promise<{disponible:boolean, respuesta:string|null, sinServidor?:boolean}>}
 */
export async function preguntarAlAyudante(mensajes) {
  try {
    return await http.crear("/mente/ayuda", { mensajes }, ESPERA_LARGA);
  } catch (error) {
    return { disponible: false, respuesta: null, sinServidor: esFalloDeConexion(error) };
  }
}
