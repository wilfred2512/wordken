/**
 * Tratamiento de texto para el duelo de palabras.
 *
 * El jugador escribe "CHEVERE" o "CHÉVERE" y las dos deben valer. La solución
 * es comparar siempre una versión normalizada: mayúsculas, sin tildes y sin
 * espacios. La Ñ se respeta porque es una letra distinta, no una N con tilde.
 */

const MARCAS_DIACRITICAS = /[̀-ͯ]/g;
const LETRA_ENE = "Ñ";
const MARCADOR_ENE = "\u0001";
const SOLO_LETRAS = /^[A-ZÑ]+$/;

/**
 * Mayúsculas sin tildes, conservando la Ñ.
 *
 * El truco: se aparta la Ñ con un marcador antes de quitar las tildes, porque
 * la descomposición Unicode también separaría su virgulilla y la convertiría
 * en N.
 */
export function normalizar(texto) {
  return String(texto)
    .toUpperCase()
    .trim()
    .replaceAll(LETRA_ENE, MARCADOR_ENE)
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .replaceAll(MARCADOR_ENE, LETRA_ENE);
}

/** true si el texto normalizado solo tiene letras del alfabeto español. */
export function esSoloLetras(texto) {
  return SOLO_LETRAS.test(normalizar(texto));
}

/** Parte una palabra en un array de letras ya normalizadas. */
export function enLetras(palabra) {
  return normalizar(palabra).split("");
}
