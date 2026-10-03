/**
 * Forma del recurso "partida" y de una fila de la tabla de puntuaciones.
 *
 * SQLite no tiene tipo booleano: guarda 0 y 1. La traducción a true/false
 * ocurre aquí y en ningún otro sitio.
 */

/**
 * @typedef {object} Partida
 * @property {number} id
 * @property {number} jugadorId
 * @property {string} nombreJugador
 * @property {boolean} gano
 * @property {boolean} cadenaMaxima
 * @property {string} dificultad
 * @property {number} rondas
 * @property {number} puntuacion
 */

/** 0 y 1 de SQLite -> booleano de JavaScript. */
function aBooleano(valor) {
  return valor === 1;
}

/** Convierte una fila de SQLite en una partida de la API. */
export function aPartida(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    jugadorId: fila.jugador_id,
    nombreJugador: fila.nombre_jugador ?? null,
    gano: aBooleano(fila.gano),
    cadenaMaxima: aBooleano(fila.cadena_maxima),
    dificultad: fila.dificultad,
    rondas: fila.rondas,
    danoHecho: fila.dano_hecho,
    danoRecibido: fila.dano_recibido,
    mejorCadena: fila.mejor_cadena,
    sellos: fila.sellos,
    duelosGanados: fila.duelos_ganados,
    duelosPerdidos: fila.duelos_perdidos,
    poderesUsados: fila.poderes_usados,
    puntuacion: fila.puntuacion,
    jugadaEn: fila.jugada_en,
  };
}

/** Convierte una lista de filas. */
export function aListaDePartidas(filas) {
  return filas.map(aPartida);
}

/** Convierte una fila agregada de la tabla de puntuaciones. */
export function aFilaDePuntuaciones(fila, posicion) {
  return {
    posicion,
    jugadorId: fila.jugador_id,
    nombre: fila.nombre,
    mejorPuntuacion: fila.mejor_puntuacion,
    partidasJugadas: fila.partidas_jugadas,
    partidasGanadas: fila.partidas_ganadas,
    duelosGanados: fila.duelos_ganados,
    cadenasMaximas: fila.cadenas_maximas,
    ultimaPartida: fila.ultima_partida,
  };
}
