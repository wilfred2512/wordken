/**
 * Middleware final para URLs que no coinciden con ninguna ruta.
 *
 * Sin él, Express devolvería su página HTML por defecto y el frontend
 * recibiría HTML donde esperaba JSON.
 */
import { errorNoEncontrado } from "../utils/error-http.js";

export function rutaNoEncontrada(req, _res, siguiente) {
  siguiente(errorNoEncontrado(`La ruta ${req.method} ${req.originalUrl} no existe en esta API.`));
}
