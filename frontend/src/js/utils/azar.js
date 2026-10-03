/**
 * Funciones de azar.
 *
 * Están juntas para poder sustituirlas por una versión determinista cuando se
 * quieran hacer pruebas reproducibles.
 */

/** Un elemento cualquiera de la lista. */
export function elegirAlAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Entero aleatorio entre minimo y maximo, ambos incluidos. */
export function enteroAlAzar(minimo, maximo) {
  return minimo + Math.floor(Math.random() * (maximo - minimo + 1));
}

/** true con la probabilidad indicada (0 a 1). */
export function ocurreCon(probabilidad) {
  return Math.random() < probabilidad;
}

/**
 * Copia barajada de la lista (Fisher-Yates).
 * Devuelve una copia para no estropear el array original, que en este
 * proyecto suele ser una constante compartida.
 */
export function barajar(lista) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
}

/** Los primeros `cantidad` elementos de una baraja. */
export function tomarAlAzar(lista, cantidad) {
  return barajar(lista).slice(0, cantidad);
}
