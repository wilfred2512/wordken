/**
 * Comunicación con /api/jugadores.
 */
import { http } from "./cliente-http.js";

/** Cabecera que autoriza las operaciones destructivas. */
function cabeceraDeClave(claveApi) {
  return { "x-clave-api": claveApi };
}

/** GET /api/jugadores */
export function obtenerJugadores() {
  return http.obtener("/jugadores");
}

/** GET /api/jugadores/:id */
export function obtenerJugador(id) {
  return http.obtener(`/jugadores/${id}`);
}

/** POST /api/jugadores */
export function crearJugador(nombre) {
  return http.crear("/jugadores", { nombre });
}

/** PUT /api/jugadores/:id — necesita la clave de la API. */
export function renombrarJugador(id, nombre, claveApi) {
  return http.actualizar(`/jugadores/${id}`, { nombre }, cabeceraDeClave(claveApi));
}

/** DELETE /api/jugadores/:id — necesita la clave de la API. */
export function eliminarJugador(id, claveApi) {
  return http.borrar(`/jugadores/${id}`, cabeceraDeClave(claveApi));
}
