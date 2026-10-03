/**
 * Decide quién gana la ronda a partir de las cartas jugadas.
 *
 * Contempla los dos casos raros que introducen los poderes:
 *   · PISTOLA: una cuarta carta que vence a las tres normales.
 *   · DOBLE O NADA: un bando juega DOS cartas contra la única del rival.
 *
 * Solo decide el veredicto y el multiplicador que aporta la jugada; el daño
 * final lo calcula calculo-dano.js.
 */
import { comparar, VEREDICTO } from "./reglas-tiradas.js";
import { JUGADOR, IA } from "./constantes.js";

const EMPATE = "empate";
const MULTIPLICADOR_SENCILLO = 1;
const MULTIPLICADOR_DOBLE = 2;

/** Traduce el veredicto del jugador en el nombre del bando ganador. */
function bandoSegunVeredicto(veredicto) {
  if (veredicto === VEREDICTO.GANA) return JUGADOR;
  if (veredicto === VEREDICTO.PIERDE) return IA;
  return EMPATE;
}

/** Ronda normal: una carta contra una carta. */
function resolverSencilla(tiradaJugador, tiradaIa) {
  return {
    resultado: bandoSegunVeredicto(comparar(tiradaJugador, tiradaIa)),
    multiplicadorDeJugada: MULTIPLICADOR_SENCILLO,
  };
}

/**
 * Ronda de DOBLE O NADA: las dos cartas del apostante se comparan contra la
 * única del rival y se hace balance.
 *
 *   balance  2 -> el apostante gana con daño doble
 *   balance  1 -> gana normal
 *   balance  0 -> nadie hace daño
 *   balance -1 -> pierde normal
 *   balance -2 -> pierde con daño doble
 */
function calcularBalance(cartasApostante, cartaRival) {
  return cartasApostante.reduce((total, carta) => {
    const veredicto = comparar(carta, cartaRival);
    if (veredicto === VEREDICTO.GANA) return total + 1;
    if (veredicto === VEREDICTO.PIERDE) return total - 1;
    return total;
  }, 0);
}

/**
 * @param {string} apostante     bando que juega dos cartas
 * @param {string[]} cartasApostante
 * @param {string} cartaRival
 */
function resolverDoble(apostante, cartasApostante, cartaRival) {
  const balance = calcularBalance(cartasApostante, cartaRival);

  if (balance === 0) {
    return { resultado: EMPATE, multiplicadorDeJugada: MULTIPLICADOR_SENCILLO };
  }

  const ganador = balance > 0 ? apostante : bandoOpuesto(apostante);
  const multiplicador =
    Math.abs(balance) === 2 ? MULTIPLICADOR_DOBLE : MULTIPLICADOR_SENCILLO;

  return { resultado: ganador, multiplicadorDeJugada: multiplicador };
}

/** Evita importar bandoContrario solo para esto. */
function bandoOpuesto(bando) {
  return bando === JUGADOR ? IA : JUGADOR;
}

/**
 * Punto de entrada único.
 * @param {{cartasJugador:string[], cartasIa:string[], apostante:string|null}} jugada
 * @returns {{resultado:string, multiplicadorDeJugada:number}}
 */
export function resolverJugada(jugada) {
  const { cartasJugador, cartasIa, apostante } = jugada;

  if (apostante === JUGADOR) return resolverDoble(JUGADOR, cartasJugador, cartasIa[0]);
  if (apostante === IA) return resolverDoble(IA, cartasIa, cartasJugador[0]);

  return resolverSencilla(cartasJugador[0], cartasIa[0]);
}

/** Nombre del empate, expuesto para que nadie escriba la cadena a mano. */
export const RESULTADO_EMPATE = EMPATE;
