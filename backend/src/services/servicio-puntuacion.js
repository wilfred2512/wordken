/**
 * Cálculo de la puntuación de una partida.
 *
 * Vive en el servidor a propósito: si el cliente mandara la puntuación ya
 * calculada, cualquiera podría escribir 999999 desde la consola del navegador
 * y encabezar la tabla. El cliente manda hechos (rondas, daño, duelos); el
 * servidor deduce el número.
 */

/** Pesos de cada logro. Nombres explícitos para que no haya números sueltos. */
const PUNTOS_POR_VICTORIA = 1000;
const PUNTOS_POR_CADENA_MAXIMA = 1500;
const PUNTOS_POR_UNIDAD_DE_DANO = 10;
const PUNTOS_POR_NIVEL_DE_CADENA = 50;
const PUNTOS_POR_SELLO = 150;
const PUNTOS_POR_DUELO_GANADO = 120;
const CASTIGO_POR_DUELO_PERDIDO = 60;
const CASTIGO_POR_RONDA = 5;
const PUNTUACION_MINIMA = 0;

/**
 * Suma de todo lo que aporta puntos.
 * @param {object} estadisticas estadísticas validadas de la partida
 */
function calcularBonificaciones(estadisticas) {
  const porVictoria = estadisticas.gano ? PUNTOS_POR_VICTORIA : 0;
  const porInstawin = estadisticas.cadenaMaxima ? PUNTOS_POR_CADENA_MAXIMA : 0;

  return (
    porVictoria +
    porInstawin +
    estadisticas.danoHecho * PUNTOS_POR_UNIDAD_DE_DANO +
    estadisticas.mejorCadena * PUNTOS_POR_NIVEL_DE_CADENA +
    estadisticas.sellos * PUNTOS_POR_SELLO +
    estadisticas.duelosGanados * PUNTOS_POR_DUELO_GANADO
  );
}

/**
 * Suma de todo lo que resta puntos.
 * Las rondas restan para premiar las victorias rápidas: ganar en 12 rondas
 * vale más que ganar en 40.
 */
function calcularCastigos(estadisticas) {
  return (
    estadisticas.duelosPerdidos * CASTIGO_POR_DUELO_PERDIDO +
    estadisticas.rondas * CASTIGO_POR_RONDA
  );
}

/**
 * Puntuación final, nunca negativa.
 * @param {object} estadisticas
 * @returns {number} entero
 */
export function calcularPuntuacion(estadisticas) {
  const total = calcularBonificaciones(estadisticas) - calcularCastigos(estadisticas);
  return Math.max(PUNTUACION_MINIMA, Math.round(total));
}

/** Desglose legible, útil para enseñarlo en la pantalla de fin de partida. */
export function desglosarPuntuacion(estadisticas) {
  return {
    bonificaciones: calcularBonificaciones(estadisticas),
    castigos: calcularCastigos(estadisticas),
    total: calcularPuntuacion(estadisticas),
  };
}
