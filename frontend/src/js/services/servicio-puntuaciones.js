/**
 * Comunicación con /api/puntuaciones (la tabla de puntuaciones).
 */
import { http } from "./cliente-http.js";

const LIMITE_POR_DEFECTO = 10;

/** GET /api/puntuaciones?limite= */
export function obtenerTablaDePuntuaciones(limite = LIMITE_POR_DEFECTO) {
  return http.obtener(`/puntuaciones?limite=${limite}`);
}
