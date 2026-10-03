/**
 * Reglas de negocio de las partidas.
 *
 * Aquí se decide quién es el jugador, cuánto vale la partida y qué se guarda.
 * El repositorio solo obedece; el controlador solo traduce.
 */
import * as repositorio from "../repositories/repositorio-partidas.js";
import { obtenerOCrearJugador, obtenerJugadorPorId } from "./servicio-jugadores.js";
import { calcularPuntuacion, desglosarPuntuacion } from "./servicio-puntuacion.js";
import { errorNoEncontrado } from "../utils/error-http.js";

const LIMITE_POR_DEFECTO = 20;
const LIMITE_MAXIMO = 100;

/** Recorta el límite pedido para que nadie descargue la tabla entera. */
function normalizarLimite(limiteCrudo) {
  const limite = Number.parseInt(limiteCrudo, 10);
  if (Number.isNaN(limite) || limite < 1) return LIMITE_POR_DEFECTO;
  return Math.min(limite, LIMITE_MAXIMO);
}

/** Últimas partidas, de todos o de un jugador. */
export function obtenerPartidas({ jugadorId, limite } = {}) {
  const tope = normalizarLimite(limite);

  if (jugadorId) {
    obtenerJugadorPorId(jugadorId);
    return repositorio.listarPartidasDeJugador(jugadorId, tope);
  }

  return repositorio.listarPartidas(tope);
}

/** Una partida por id. Lanza 404 si no existe. */
export function obtenerPartidaPorId(id) {
  const partida = repositorio.buscarPartidaPorId(id);
  if (!partida) {
    throw errorNoEncontrado(`No existe ninguna partida con id ${id}.`);
  }
  return partida;
}

/**
 * Registra una partida terminada.
 * El cuerpo llega ya validado por el middleware; aquí se resuelve el jugador
 * y se calcula la puntuación antes de escribir.
 *
 * @param {object} datos estadísticas de la partida + nombre del jugador
 */
export function registrarPartida(datos) {
  const jugador = obtenerOCrearJugador(datos.nombreJugador);
  const puntuacion = calcularPuntuacion(datos);

  const partida = repositorio.insertarPartida({
    ...datos,
    jugadorId: jugador.id,
    puntuacion,
  });

  return {
    partida,
    desglose: desglosarPuntuacion(datos),
  };
}

/** Elimina una partida concreta. */
export function eliminarPartida(id) {
  const borrada = repositorio.borrarPartida(id);
  if (!borrada) {
    throw errorNoEncontrado(`No existe ninguna partida con id ${id}.`);
  }
  return { id };
}
