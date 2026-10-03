/**
 * Decide QUÉ pista debe sonar según el estado de la partida.
 *
 * Tres piezas con trabajos separados:
 *   catalogo-audio   la discoteca: situación -> archivo
 *   director-musical el DJ:        mira el estado y elige situación
 *   gestor-audio     el técnico:   reproduce y hace el fundido
 *
 * El director recalcula desde cero en cada llamada. No existe un "empezar
 * música de cadena" y un "pararla" repartidos por el código: un solo sitio
 * decide, y por eso la música vuelve sola cuando la cadena se rompe.
 */
import { MUSICA, AJUSTES_AUDIO } from "./catalogo-audio.js";
import { gestorAudio } from "./gestor-audio.js";
import { JUGADOR, IA } from "../constantes.js";

const NIVEL_TRIPLE = 3;
const NIVEL_DOBLE = 2;

/** Nivel de cadena de un bando, o 1 si no tiene cadena. */
function nivelDeCadenaDe(partida, bando) {
  const cadena = partida.cadena[bando];
  return cadena.racha >= 2 ? cadena.nivel() : 1;
}

/** La pista que corresponde al umbral de vida más bajo de los dos bandos. */
function pistaPorVida(partida) {
  const masBajo = Math.min(partida.combatiente[JUGADOR].umbral, partida.combatiente[IA].umbral);

  if (masBajo <= 25) return "vida25";
  if (masBajo <= 50) return "vida50";
  if (masBajo <= 75) return "vida75";
  return "partida";
}

/** Nombre de la pista que toca ahora mismo. */
export function pistaParaLaPartida(partida) {
  const nivelJugador = nivelDeCadenaDe(partida, JUGADOR);
  const nivelIa = AJUSTES_AUDIO.musicaCadenaParaIa ? nivelDeCadenaDe(partida, IA) : 1;
  const nivelMasAlto = Math.max(nivelJugador, nivelIa);

  if (nivelMasAlto === NIVEL_TRIPLE) return "cadenaTriple";
  if (nivelMasAlto === NIVEL_DOBLE) return "cadenaDoble";

  const pista = pistaPorVida(partida);

  // Si esa pista no tiene archivo, se cae a la de partida en vez de dejar
  // la pantalla en silencio.
  return MUSICA[pista] ? pista : "partida";
}

/** Pone la pista que toca. Se llama al final de cada ronda. */
export function actualizarMusica(partida) {
  if (!partida || partida.terminada) return;

  gestorAudio.ponerMusica(pistaParaLaPartida(partida));
}

/** Música del duelo de palabras. */
export function musicaDeDuelo() {
  gestorAudio.ponerMusica("duelo");
}

/** Música de la pantalla final. */
export function musicaDeFinal(haGanadoElJugador) {
  const pista = haGanadoElJugador ? "victoria" : "derrota";
  gestorAudio.ponerMusica(MUSICA[pista] ? pista : "menu");
}
