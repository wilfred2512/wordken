/**
 * Las reglas básicas: piedra, papel, tijera, pistola y escudo.
 *
 * Todo vive en una tabla de datos, no en cadenas de `if`. Añadir lagarto y
 * spock sería tocar este objeto y nada más: el resto del juego no se entera.
 */

/** Las tres tiradas normales, las únicas que se pueden jugar siempre. */
export const TIRADAS = ["piedra", "papel", "tijera"];

/** Las dos cartas especiales. No están en TIRADAS a propósito: solo aparecen
 *  cuando un poder las pone en la mano. */
export const TIRADA_PISTOLA = "pistola";
export const TIRADA_ESCUDO = "escudo";

/**
 * A quién vence cada tirada. Se lee así:
 *   VENCE_A.piedra incluye "tijera"  ->  la piedra vence a la tijera.
 *
 * La tabla es simétrica y completa: para cualquier par de tiradas distintas,
 * exactamente una de las dos aparece en la lista de la otra. Por eso
 * `comparar` no necesita ningún caso especial.
 *
 *   · la PISTOLA gana a las tres normales, pero cae ante el escudo
 *   · el ESCUDO solo sirve para parar la pistola: pierde contra todo lo demás
 */
export const VENCE_A = {
  piedra: ["tijera", TIRADA_ESCUDO],
  papel: ["piedra", TIRADA_ESCUDO],
  tijera: ["papel", TIRADA_ESCUDO],
  pistola: ["piedra", "papel", "tijera"],
  escudo: [TIRADA_PISTOLA],
};

/** Texto en mayúsculas para los carteles. */
export const ETIQUETA = {
  piedra: "PIEDRA",
  papel: "PAPEL",
  tijera: "TIJERA",
  pistola: "PISTOLA",
  escudo: "ESCUDO",
};

/** Frase corta que aparece al pie de cada carta. */
export const LEMA = {
  piedra: "rompe la tijera",
  papel: "envuelve la piedra",
  tijera: "corta el papel",
  pistola: "les gana a las tres",
  escudo: "solo para la pistola",
};

/** Resultados posibles de comparar dos tiradas. */
export const VEREDICTO = {
  GANA: "gana",
  PIERDE: "pierde",
  EMPATE: "empate",
};

/**
 * La tirada NORMAL que vence a la indicada.
 * La usa la IA para elegir su contra, por eso solo mira entre las tres
 * normales y nunca devuelve una carta especial.
 */
export function loQueVenceA(tirada) {
  return TIRADAS.find((otra) => VENCE_A[otra].includes(tirada));
}

/** true si la tirada es una de las tres normales. */
export function esTiradaNormal(tirada) {
  return TIRADAS.includes(tirada);
}

/**
 * Compara la tirada propia contra la del rival.
 * Dos tiradas iguales siempre empatan, también pistola contra pistola y
 * escudo contra escudo.
 *
 * @returns {"gana"|"pierde"|"empate"}
 */
export function comparar(tiradaPropia, tiradaRival) {
  if (tiradaPropia === tiradaRival) return VEREDICTO.EMPATE;

  return VENCE_A[tiradaPropia].includes(tiradaRival) ? VEREDICTO.GANA : VEREDICTO.PIERDE;
}
