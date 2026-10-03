/**
 * Operaciones numéricas reutilizables.
 */

/** Deja el valor dentro del rango [minimo, maximo]. */
export function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/** Porcentaje de parte sobre total, entre 0 y 100. */
export function porcentaje(parte, total) {
  if (total <= 0) return 0;
  return limitar((parte / total) * 100, 0, 100);
}

/**
 * Lee un campo de texto que debe contener un entero.
 *
 * No se puede usar `parseInt(texto) || respaldo`, porque en JavaScript el 0 es
 * falsy: escribir "0" devolvería el respaldo en lugar de 0. Por eso la
 * comprobación es explícita con Number.isNaN.
 */
export function leerEntero(texto, respaldo, minimo, maximo) {
  const numero = Number.parseInt(texto, 10);
  if (Number.isNaN(numero)) return respaldo;
  return limitar(numero, minimo, maximo);
}

/** Redondea hacia arriba, nunca por debajo de 1. */
export function golpesNecesarios(vida, dano) {
  if (dano <= 0) return Infinity;
  return Math.max(1, Math.ceil(vida / dano));
}
