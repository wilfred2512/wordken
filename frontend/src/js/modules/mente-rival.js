/**
 * LA MENTE: la dificultad que mueve un modelo de lenguaje de verdad.
 *
 * El problema a resolver era el tiempo. Preguntarle a un modelo tarda entre
 * medio segundo y varios, y el motor de ronda es síncrono: si la ronda se
 * parara a esperar, volvería el problema que acabábamos de arreglar, la espera
 * eterna al pulsar una carta.
 *
 * La solución es que el rival PIENSE MIENTRAS TÚ PIENSAS. En cuanto la mesa
 * queda lista para tu jugada se le pide su próxima tirada; cuando contesta, se
 * guarda en un cajón. Al resolver la ronda, si hay algo en el cajón se usa y
 * si no, tira la estrategia difícil de toda la vida. Resultado: el modelo no
 * añade ni un milisegundo de espera, y si tarda demasiado nadie se entera.
 *
 * Este archivo no toca el DOM: solo habla con el servicio y deja el consejo
 * dentro del oponente.
 */
import { pedirJugadaDeLaMente } from "../services/servicio-mente.js";
import { obtenerPersonaje } from "./personajes-ia.js";
import { JUGADOR, IA } from "./constantes.js";

/** Cuántas rondas de historial se le cuentan al modelo. */
const RONDAS_DE_CONTEXTO = 8;

/** true si esta partida la juega el modelo de lenguaje. */
export function laMueveUnModelo(partida) {
  return Boolean(obtenerPersonaje(partida.ajustes.dificultad).usaModeloReal);
}

/** Resume la partida en datos planos, listos para mandar por la red. */
function resumenDeLaPartida(partida) {
  const ultimas = partida.historial.slice(-RONDAS_DE_CONTEXTO);

  return {
    ronda: partida.ronda,
    vidaIa: partida.combatiente[IA].vida,
    vidaJugador: partida.combatiente[JUGADOR].vida,
    tiradasDelJugador: ultimas.map((entrada) => entrada.tiradaJugador).filter(Boolean),
    tiradasDeLaIa: ultimas.map((entrada) => entrada.tiradaIa).filter(Boolean),
    resultados: ultimas.map((entrada) => etiquetaDeResultado(entrada.resultado)),
  };
}

/** Traduce el resultado interno a algo que un modelo entienda sin explicación. */
function etiquetaDeResultado(resultado) {
  if (resultado === IA) return "gané yo";
  if (resultado === JUGADOR) return "ganó el humano";
  return "empate";
}

/**
 * Le pide al modelo su jugada para la ronda que viene.
 *
 * No se espera el resultado: se lanza y sigue. Por eso no es `await` en quien
 * llama y por eso hace falta comprobar que la partida sigue siendo la misma
 * cuando por fin contesta; si el jugador se ha ido al menú mientras tanto, el
 * consejo ya no vale para nada.
 */
export function pedirConsejoAnticipado(partida) {
  if (!laMueveUnModelo(partida) || partida.terminada) return;

  const rondaPedida = partida.ronda;

  pedirJugadaDeLaMente(resumenDeLaPartida(partida)).then((respuesta) => {
    if (!respuesta.disponible || partida.terminada) return;
    if (partida.ronda !== rondaPedida) return;

    partida.oponente.consejo = {
      tirada: respuesta.tirada ?? null,
      comentario: respuesta.comentario ?? null,
    };
  });
}
