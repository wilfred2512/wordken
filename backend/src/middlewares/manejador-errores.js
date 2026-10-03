/**
 * Manejador global de errores.
 *
 * Es el único punto de la aplicación que convierte una excepción en una
 * respuesta. Los controladores lanzan y se olvidan.
 *
 * Express reconoce este middleware como manejador de errores porque recibe
 * CUATRO argumentos. Si se quita el `_siguiente`, deja de funcionar aunque
 * el cuerpo sea idéntico.
 */
import { responderError } from "../utils/respuesta-json.js";
import { ErrorHttp } from "../utils/error-http.js";
import { esProduccion } from "../config/entorno.js";

const ESTADO_ERROR_INTERNO = 500;
const MENSAJE_GENERICO = "Error interno del servidor.";

/** Decide qué texto ve el cliente cuando el error no es un ErrorHttp. */
function mensajeSeguro(error) {
  if (esProduccion()) return MENSAJE_GENERICO;
  return error.message || MENSAJE_GENERICO;
}

/** Vuelca el error en el registro del servidor, con la ruta que lo provocó. */
function registrarError(error, req) {
  const marca = new Date().toISOString();
  process.stderr.write(`[${marca}] ${req.method} ${req.originalUrl} -> ${error.stack ?? error}\n`);
}

export function manejadorDeErrores(error, req, res, _siguiente) {
  registrarError(error, req);

  if (error instanceof ErrorHttp) {
    return responderError(res, error.estado, error.message, error.detalles);
  }

  return responderError(res, ESTADO_ERROR_INTERNO, mensajeSeguro(error));
}
