/**
 * Acceso a datos de la tabla `partidas` y a la vista agregada que alimenta
 * la tabla de puntuaciones.
 *
 * Todas las consultas van parametrizadas con `?`.
 */
import { obtenerBaseDatos } from "../config/base-datos.js";
import { aPartida, aListaDePartidas } from "../models/modelo-partida.js";

const COLUMNAS = `
  p.id, p.jugador_id, j.nombre AS nombre_jugador, p.gano, p.cadena_maxima,
  p.dificultad, p.rondas, p.dano_hecho, p.dano_recibido, p.mejor_cadena,
  p.sellos, p.duelos_ganados, p.duelos_perdidos, p.poderes_usados,
  p.puntuacion, p.jugada_en
`;

const SQL_LISTAR = `
  SELECT ${COLUMNAS}
  FROM partidas p
  JOIN jugadores j ON j.id = p.jugador_id
  ORDER BY p.jugada_en DESC
  LIMIT ?
`;

const SQL_LISTAR_POR_JUGADOR = `
  SELECT ${COLUMNAS}
  FROM partidas p
  JOIN jugadores j ON j.id = p.jugador_id
  WHERE p.jugador_id = ?
  ORDER BY p.jugada_en DESC
  LIMIT ?
`;

const SQL_BUSCAR_POR_ID = `
  SELECT ${COLUMNAS}
  FROM partidas p
  JOIN jugadores j ON j.id = p.jugador_id
  WHERE p.id = ?
`;

const SQL_INSERTAR = `
  INSERT INTO partidas (
    jugador_id, gano, cadena_maxima, dificultad, rondas,
    dano_hecho, dano_recibido, mejor_cadena, sellos,
    duelos_ganados, duelos_perdidos, poderes_usados, puntuacion
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const SQL_BORRAR = `
  DELETE FROM partidas
  WHERE id = ?
`;

const SQL_PUNTUACIONES = `
  SELECT
    j.id                          AS jugador_id,
    j.nombre                      AS nombre,
    MAX(p.puntuacion)             AS mejor_puntuacion,
    COUNT(p.id)                   AS partidas_jugadas,
    SUM(p.gano)                   AS partidas_ganadas,
    SUM(p.duelos_ganados)         AS duelos_ganados,
    SUM(p.cadena_maxima)          AS cadenas_maximas,
    MAX(p.jugada_en)              AS ultima_partida
  FROM partidas p
  JOIN jugadores j ON j.id = p.jugador_id
  GROUP BY j.id, j.nombre
  ORDER BY mejor_puntuacion DESC, partidas_ganadas DESC, ultima_partida ASC
  LIMIT ?
`;

/** Últimas partidas de todos los jugadores. */
export function listarPartidas(limite) {
  const filas = obtenerBaseDatos().prepare(SQL_LISTAR).all(limite);
  return aListaDePartidas(filas);
}

/** Últimas partidas de un jugador concreto. */
export function listarPartidasDeJugador(jugadorId, limite) {
  const filas = obtenerBaseDatos().prepare(SQL_LISTAR_POR_JUGADOR).all(jugadorId, limite);
  return aListaDePartidas(filas);
}

/** Una partida por su identificador, o null. */
export function buscarPartidaPorId(id) {
  const fila = obtenerBaseDatos().prepare(SQL_BUSCAR_POR_ID).get(id);
  return aPartida(fila);
}

/**
 * Inserta una partida ya validada y puntuada por la capa de servicios.
 * @param {object} datos valores en el orden del INSERT
 */
export function insertarPartida(datos) {
  const resultado = obtenerBaseDatos()
    .prepare(SQL_INSERTAR)
    .run(
      datos.jugadorId,
      datos.gano ? 1 : 0,
      datos.cadenaMaxima ? 1 : 0,
      datos.dificultad,
      datos.rondas,
      datos.danoHecho,
      datos.danoRecibido,
      datos.mejorCadena,
      datos.sellos,
      datos.duelosGanados,
      datos.duelosPerdidos,
      datos.poderesUsados,
      datos.puntuacion,
    );

  return buscarPartidaPorId(resultado.lastInsertRowid);
}

/** Borra una partida. Devuelve si borró algo. */
export function borrarPartida(id) {
  const resultado = obtenerBaseDatos().prepare(SQL_BORRAR).run(id);
  return resultado.changes > 0;
}

/** Filas agregadas de la tabla de puntuaciones, ya ordenadas. */
export function obtenerFilasDePuntuaciones(limite) {
  return obtenerBaseDatos().prepare(SQL_PUNTUACIONES).all(limite);
}
