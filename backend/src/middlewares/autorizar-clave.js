/**
 * Autorización mínima por clave compartida.
 *
 * Protege las operaciones destructivas (PUT y DELETE). La clave vive en .env,
 * nunca en el código: por eso este archivo la lee de `entorno` y no la escribe
 * en ningún sitio.
 */
import { entorno } from "../config/entorno.js";
import { errorNoAutorizado } from "../utils/error-http.js";

const CABECERA_CLAVE = "x-clave-api";

/**
 * Deja pasar solo si la cabecera x-clave-api coincide con CLAVE_API.
 * Si el servidor arrancó sin clave configurada, rechaza todo: es preferible
 * quedarse sin borrar nada a dejar el endpoint abierto por descuido.
 */
export function autorizarClave(req, _res, siguiente) {
  if (!entorno.claveApi) {
    return siguiente(errorNoAutorizado("El servidor no tiene CLAVE_API configurada."));
  }

  const claveRecibida = req.get(CABECERA_CLAVE);

  if (claveRecibida !== entorno.claveApi) {
    return siguiente(errorNoAutorizado(`Falta la cabecera ${CABECERA_CLAVE} o no coincide.`));
  }

  return siguiente();
}
