/**
 * Cálculo del daño de una ronda ganada.
 *
 * Orden de las operaciones, y el motivo:
 *
 *   daño = base x nivelDeCadena x multiplicadorDeJugada x ruleta + martillo
 *
 * Los multiplicadores van primero y la bonificación plana al final, porque si
 * el martillo se sumara antes también se multiplicaría, y un +3 se
 * convertiría en +9 con una triple cadena. Sumándolo después, el martillo
 * vale siempre lo mismo y es fácil de explicar.
 */
import { bonificacionPlanaDe, multiplicadorDeRuleta } from "./efectos-poderes.js";
import { DANO_BASE } from "./constantes.js";

/**
 * @param {object} partida
 * @param {string} ganador
 * @param {number} nivelDeCadena        1, 2 o 3
 * @param {number} multiplicadorDeJugada 1 o 2 (doble o nada)
 * @returns {{total:number, ruleta:number, martillo:number}}
 */
export function calcularDano(partida, ganador, nivelDeCadena, multiplicadorDeJugada) {
  const ruleta = multiplicadorDeRuleta(partida, ganador);
  const martillo = bonificacionPlanaDe(partida, ganador);

  const multiplicado = DANO_BASE * nivelDeCadena * multiplicadorDeJugada * ruleta;
  const total = multiplicado + martillo;

  return { total, ruleta, martillo };
}

/**
 * Texto corto que explica de dónde sale el número, para el cartel flotante.
 * Se calcula aquí y no en el pintor porque depende de las mismas reglas.
 */
export function explicarDano(nivelDeCadena, multiplicadorDeJugada, ruleta, martillo) {
  const partes = [];

  if (nivelDeCadena > 1) partes.push(`cadena x${nivelDeCadena}`);
  if (multiplicadorDeJugada > 1) partes.push("doble o nada");
  if (ruleta > 1) partes.push(`ruleta x${ruleta}`);
  if (martillo > 0) partes.push(`martillo +${martillo}`);

  return partes.join(" · ");
}
