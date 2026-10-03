/**
 * Controladores de /api/jugadores.
 *
 * Reciben la petición, delegan en el servicio y responden. No hay una sola
 * línea de SQL ni una sola regla de negocio en este archivo.
 */
import * as servicio from "../services/servicio-jugadores.js";
import { responderExito, responderCreado } from "../utils/respuesta-json.js";

/** GET /api/jugadores */
export function listarJugadores(_req, res) {
  const jugadores = servicio.obtenerJugadores();
  responderExito(res, jugadores, `${jugadores.length} jugadores registrados.`);
}

/** GET /api/jugadores/:id */
export function obtenerJugador(req, res) {
  const jugador = servicio.obtenerJugadorPorId(req.identificador);
  responderExito(res, jugador, "Jugador encontrado.");
}

/** POST /api/jugadores */
export function crearJugador(req, res) {
  const jugador = servicio.crearJugador(req.body.nombre);
  responderCreado(res, jugador, `Jugador "${jugador.nombre}" creado.`);
}

/** PUT /api/jugadores/:id */
export function actualizarJugador(req, res) {
  const jugador = servicio.renombrarJugador(req.identificador, req.body.nombre);
  responderExito(res, jugador, "Jugador actualizado.");
}

/** DELETE /api/jugadores/:id */
export function eliminarJugador(req, res) {
  const borrado = servicio.eliminarJugador(req.identificador);
  responderExito(res, borrado, "Jugador eliminado junto con sus partidas.");
}
