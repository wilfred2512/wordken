/**
 * El estado compartido entre escenas.
 *
 * No son variables globales sueltas: es un objeto exportado por un módulo, y
 * solo se puede tocar importándolo. Así queda claro en cada archivo quién
 * mira y quién cambia la partida.
 */
export const estadoDelJuego = {
  /** @type {import("../entities/partida.js").Partida|null} */
  partida: null,

  /** @type {import("../entities/ronda-wordle.js").RondaWordle|null} */
  dueloEnCurso: null,

  /** Última partida terminada, para la pantalla de resultados. */
  resultadoFinal: null,
};

/** Guarda la partida recién creada. */
export function ponerPartida(partida) {
  estadoDelJuego.partida = partida;
}

/** Tira la partida al volver al menú, sin dejar restos. */
export function tirarPartida() {
  estadoDelJuego.partida = null;
  estadoDelJuego.dueloEnCurso = null;
}

/** true si hay una partida viva en la que se puede jugar. */
export function hayPartidaJugable() {
  const partida = estadoDelJuego.partida;
  return Boolean(partida) && !partida.terminada && !partida.ocupada;
}
