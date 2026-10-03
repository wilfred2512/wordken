/**
 * Controladores de /api/partidas.
 */
import * as servicio from "../services/servicio-partidas.js";
import { responderExito, responderCreado } from "../utils/respuesta-json.js";

/** GET /api/partidas?jugadorId=&limite= */
export function listarPartidas(req, res) {
  const partidas = servicio.obtenerPartidas({
    jugadorId: req.query.jugadorId,
    limite: req.query.limite,
  });

  responderExito(res, partidas, `${partidas.length} partidas encontradas.`);
}

/** GET /api/partidas/:id */
export function obtenerPartida(req, res) {
  const partida = servicio.obtenerPartidaPorId(req.identificador);
  responderExito(res, partida, "Partida encontrada.");
}

/** POST /api/partidas */
export function registrarPartida(req, res) {
  const resultado = servicio.registrarPartida(req.body);
  responderCreado(
    res,
    resultado,
    `Partida guardada con ${resultado.partida.puntuacion} puntos.`,
  );
}

/** DELETE /api/partidas/:id */
export function eliminarPartida(req, res) {
  const borrada = servicio.eliminarPartida(req.identificador);
  responderExito(res, borrada, "Partida eliminada.");
}
