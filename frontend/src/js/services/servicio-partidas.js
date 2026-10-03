/**
 * Comunicación con /api/partidas.
 *
 * Una función por punto de acceso. Nadie más construye la ruta ni el cuerpo.
 */
import { http } from "./cliente-http.js";

/**
 * Convierte las estadísticas de la partida en el cuerpo que espera la API.
 *
 * Se manda lo que PASÓ, no la puntuación: el cálculo lo hace el servidor,
 * para que nadie pueda inflarla desde la consola del navegador.
 */
function construirCuerpo(partida, haGanadoElJugador, porCadenaMaxima) {
  const estadisticas = partida.estadisticas;

  return {
    nombreJugador: partida.ajustes.nombre,
    gano: haGanadoElJugador,
    cadenaMaxima: porCadenaMaxima,
    dificultad: partida.ajustes.dificultad,
    rondas: partida.ronda,
    danoHecho: estadisticas.danoHecho,
    danoRecibido: estadisticas.danoRecibido,
    mejorCadena: estadisticas.mejorRacha,
    sellos: estadisticas.sellos,
    duelosGanados: estadisticas.duelosGanados,
    duelosPerdidos: estadisticas.duelosPerdidos,
    poderesUsados: estadisticas.poderesUsados,
  };
}

/** POST /api/partidas — registra una partida terminada. */
export function registrarPartida(partida, haGanadoElJugador, porCadenaMaxima) {
  return http.crear("/partidas", construirCuerpo(partida, haGanadoElJugador, porCadenaMaxima));
}

/** GET /api/partidas — últimas partidas, opcionalmente de un jugador. */
export function obtenerPartidas({ jugadorId, limite } = {}) {
  const parametros = new URLSearchParams();

  if (jugadorId) parametros.set("jugadorId", jugadorId);
  if (limite) parametros.set("limite", limite);

  const consulta = parametros.toString();
  return http.obtener(`/partidas${consulta ? `?${consulta}` : ""}`);
}

/** GET /api/partidas/:id */
export function obtenerPartida(id) {
  return http.obtener(`/partidas/${id}`);
}
