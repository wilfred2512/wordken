/**
 * Controlador de /api/puntuaciones (tabla de puntuaciones).
 *
 * Es un recurso de solo lectura: las filas nacen de las partidas, así que no
 * tiene POST, PUT ni DELETE propios.
 */
import { obtenerTablaDePuntuaciones } from "../services/servicio-puntuaciones.js";
import { responderExito } from "../utils/respuesta-json.js";

/** GET /api/puntuaciones?limite= */
export function listarPuntuaciones(req, res) {
  const tabla = obtenerTablaDePuntuaciones(req.query.limite);
  responderExito(res, tabla, `Top ${tabla.length} de la tabla de puntuaciones.`);
}
