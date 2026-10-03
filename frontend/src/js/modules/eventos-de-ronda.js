/**
 * Dos sucesos secundarios de la ronda: el bloqueo por empates y el cruce de
 * umbrales de vida.
 *
 * Están fuera del motor para que aquel se lea de un tirón.
 */
import { TIRADAS, ETIQUETA } from "./reglas-tiradas.js";
import { JUGADOR, IA, BANDOS } from "./constantes.js";
import { elegirAlAzar } from "../utils/azar.js";

/**
 * Son 2 y no 1 por el orden de los pasos: el bloqueo se reparte DURANTE la
 * ronda que lo provoca, y al terminar esa ronda el motor descuenta uno a
 * todos los vetos. Con 1 se quedaría en 0 antes de llegar a aplicarse nunca.
 */
const RONDAS_DE_BLOQUEO = 2;

/**
 * Tras demasiados empates seguidos, se prohíbe una tirada a cada bando.
 *
 * Son DISTINTAS a propósito: si a los dos se les quitara la misma, ambos se
 * quedarían con las mismas dos cartas y la probabilidad de empate subiría a
 * 1/2. Con vetos cruzados baja a 1/4, que es justo lo contrario de lo que
 * queremos evitar.
 */
export function repartirBloqueos(partida) {
  const paraJugador = elegirAlAzar(TIRADAS);
  const paraIa = elegirAlAzar(TIRADAS.filter((tirada) => tirada !== paraJugador));

  partida.vetarTirada(JUGADOR, paraJugador, RONDAS_DE_BLOQUEO);
  partida.vetarTirada(IA, paraIa, RONDAS_DE_BLOQUEO);

  return {
    clase: "cf-bloqueo",
    titulo: "¡BLOQUEO!",
    subtitulo: `tú sin ${ETIQUETA[paraJugador]} · la ia sin ${ETIQUETA[paraIa]}`,
  };
}

/**
 * Umbrales de vida recién cruzados, como mucho uno por bando.
 * El umbral es una marca de agua: solo puede bajar, y si un golpe cruza
 * varios de golpe se queda con el más bajo y avisa una sola vez.
 */
export function comprobarUmbrales(partida) {
  const cruces = [];

  BANDOS.forEach((bando) => {
    const umbral = partida.combatiente[bando].cruzarUmbral();
    if (umbral === null) return;

    cruces.push({
      bando,
      porcentaje: umbral,
      clase: "cf-umbral",
      titulo: `${umbral}% DE VIDA`,
      subtitulo: bando === JUGADOR ? "estás en apuros" : "la ia está en apuros",
    });
  });

  return cruces;
}
