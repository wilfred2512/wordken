/**
 * Forma del recurso "jugador" tal y como lo ve el cliente.
 *
 * La base de datos usa snake_case (creado_en) porque es la convención de SQL;
 * la API usa camelCase porque es la convención de JavaScript. Este archivo es
 * el único sitio donde se cruzan los dos vocabularios.
 */

/**
 * @typedef {object} Jugador
 * @property {number} id
 * @property {string} nombre
 * @property {string} creadoEn
 */

/**
 * Convierte una fila de SQLite en un jugador de la API.
 * @param {object|undefined} fila
 * @returns {Jugador|null}
 */
export function aJugador(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    nombre: fila.nombre,
    creadoEn: fila.creado_en,
  };
}

/** Convierte una lista de filas. */
export function aListaDeJugadores(filas) {
  return filas.map(aJugador);
}
