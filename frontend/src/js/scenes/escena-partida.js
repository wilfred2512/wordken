/**
 * Escena de la partida: el bucle de rondas.
 *
 * Coordina, no calcula. Pide al motor que resuelva, manda escenificar el
 * parte y decide a qué escena se va después.
 */
import { Partida } from "../entities/partida.js";
import { resolverRonda } from "../modules/motor-ronda.js";
import { activarPoder } from "../modules/efectos-poderes.js";
import { pedirConsejoAnticipado } from "../modules/mente-rival.js";
import { escenificarRonda } from "./escenificar-ronda.js";
import { tieneImpactoAlActivar, escenificarActivacion } from "./impactos-de-poder.js";
import { gestorDeEscenas } from "../core/gestor-escenas.js";
import { estadoDelJuego, ponerPartida } from "../core/estado-juego.js";
import { fotoDeLosAjustes } from "../modules/ajustes-partida.js";
import * as arena from "../render/pintor-arena.js";
import * as mano from "../render/pintor-mano.js";
import { pintarHud } from "../render/pintor-hud.js";
import { pintarPoderes } from "../render/pintor-poderes.js";
import { prepararMedidor, pintarMedidor } from "../render/pintor-carga.js";
import { lanzarJackpot } from "../render/jackpot.js";
import { lanzarFanfarria } from "../render/fanfarria-poder.js";
import * as avatar from "../render/avatar-ia.js";
import { explosion } from "../render/efectos-visuales.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { actualizarMusica } from "../modules/audio/director-musical.js";
import { entradaDeTeclado, TECLAS_DE_TIRADA } from "../input/entrada-teclado.js";
import { esperar, esperarSaltable } from "../utils/tiempo.js";
import { JUGADOR, IA, RITMO, bandoContrario } from "../modules/constantes.js";
import { TIRADA_PISTOLA, TIRADA_ESCUDO } from "../modules/reglas-tiradas.js";

/** Cartas que el jugador lleva elegidas esta ronda (DOBLE O NADA usa dos). */
let seleccionadas = [];

/**
 * La pistola y el escudo solo se pueden jugar si están activos en la mochila.
 *
 * Con el ratón no hacía falta comprobarlo, porque sus cartas están ocultas
 * hasta que se activan. Pero las teclas 4 y 5 no miran si una carta se ve:
 * pulsando 4 se disparaba una pistola que no tenías. Se comprueba aquí, que
 * es la puerta por la que entran el ratón y el teclado.
 */
function tieneLaCarta(partida, tirada) {
  if (tirada !== TIRADA_PISTOLA && tirada !== TIRADA_ESCUDO) return true;
  return partida.mochila[JUGADOR].estaActivo(tirada);
}

/** Cuántas cartas hay que elegir antes de resolver. */
function cartasNecesarias(partida) {
  return partida.mochila[JUGADOR].estaActivo("dobleONada") ? 2 : 1;
}

/**
 * Deja la mesa lista para una ronda nueva.
 * @param {{sinMarcador?:boolean}} [opciones] `sinMarcador` deja la vida como
 *        estaba: la repinta el impacto de la bomba o la mamajuana al golpear.
 */
function prepararMesa(partida, opciones = {}) {
  seleccionadas = [];
  arena.ocultarCartas();
  arena.escribirVeredicto(
    cartasNecesarias(partida) === 2 ? "ELIGE DOS TIRADAS" : "ELIGE TU TIRADA",
  );
  mano.actualizarCartasEspeciales(partida);
  mano.pintarMano(false, [], partida.tiradaVetadaDe(JUGADOR));
  if (!opciones.sinMarcador) pintarHud(partida);
  pintarMedidor(partida);
  pintarPoderes(partida, alPulsarPoder);

  // El rival empieza a pensar AHORA, mientras el jugador mira sus cartas.
  // Cuando llegue la ronda ya tendrá la respuesta, o no la usará. Ver
  // modules/mente-rival.js.
  pedirConsejoAnticipado(partida);
}

/**
 * El jugador ha pulsado un poder de su mochila.
 *
 * Los que actúan en el acto (bomba, mamajuana, ganzúa, candado) enseñan su
 * impacto tras la fanfarria, y mientras dura la mesa queda ocupada: si no,
 * se podría jugar una carta con la bomba todavía en el aire. La bomba puede
 * dejar al rival a cero, así que al terminar se mira si hay ganador.
 */
async function alPulsarPoder(idPoder) {
  const partida = estadoDelJuego.partida;
  if (!partida || partida.ocupada || partida.terminada) return;

  const resultado = activarPoder(partida, JUGADOR, idPoder);
  if (!resultado.activado) return;

  const conImpacto = tieneImpactoAlActivar(idPoder);
  prepararMesa(partida, { sinMarcador: conImpacto });
  lanzarFanfarria(idPoder, JUGADOR, resultado.texto);
  avatar.reaccionar("poderJugador");

  if (!conImpacto) return;

  partida.ocupada = true;
  await escenificarActivacion(partida, JUGADOR, idPoder, resultado);
  partida.ocupada = false;

  if (partida.hayAlguienSinVida()) terminar(partida, partida.ganadorPorVida(), false);
}

/**
 * Cadena máxima: victoria instantánea, y el JACKPOT de tragamonedas entero
 * (unos 33 s, sincronizado con su música; se puede saltar a partir de los 2 s).
 */
async function lanzarCadenaMaxima(partida, ganador) {
  gestorAudio.efecto("maxima");
  gestorAudio.ponerMusica("cadenaMaxima");

  explosion(ganador === JUGADOR);
  await esperar(340);

  await lanzarJackpot({
    esDelJugador: ganador === JUGADOR,
    subtitulo: ganador === JUGADOR
      ? "las tres tiradas selladas · victoria instantánea"
      : "la ia ha sellado las tres · derrota instantánea",
  });

  partida.combatiente[bandoContrario(ganador)].vida = 0;
  pintarHud(partida);

  terminar(partida, ganador, true);
}

/** Cierra la partida y salta a la pantalla de resultados. */
function terminar(partida, ganador, porCadenaMaxima) {
  partida.terminada = true;
  partida.ocupada = true;
  mano.pintarMano(true);

  gestorDeEscenas.ir("fin", { partida, ganador, porCadenaMaxima });
}

/** Cierra la ronda y deja el turno abierto otra vez. */
async function continuarPartida(partida, parte) {
  await esperarSaltable(parte.anuncios.length ? RITMO.pausaConCarteles : RITMO.pausaSinCarteles);

  partida.ronda++;
  partida.ocupada = false;
  prepararMesa(partida);
}

/** Resuelve la ronda con las cartas ya elegidas. */
async function resolverConCartas(partida, cartas) {
  partida.ocupada = true;
  gestorAudio.desbloquear();
  gestorAudio.efecto("elegir");
  mano.pintarMano(true, cartas);

  const parte = resolverRonda(partida, cartas);
  await escenificarRonda(partida, parte);

  if (parte.cadenaMaxima) {
    await lanzarCadenaMaxima(partida, parte.ganador);
    return;
  }

  if (partida.hayAlguienSinVida()) {
    terminar(partida, partida.ganadorPorVida(), false);
    return;
  }

  await continuarPartida(partida, parte);
}

/**
 * El jugador ha elegido una carta.
 * Con DOBLE O NADA hacen falta dos, así que la primera solo se marca.
 */
export function elegirTirada(tirada) {
  const partida = estadoDelJuego.partida;
  if (!partida || partida.terminada || partida.ocupada) return;
  if (partida.tiradaVetadaDe(JUGADOR) === tirada) return;
  if (!tieneLaCarta(partida, tirada)) return;

  seleccionadas.push(tirada);
  gestorAudio.efecto("elegir");

  if (seleccionadas.length < cartasNecesarias(partida)) {
    mano.pintarMano(false, seleccionadas, partida.tiradaVetadaDe(JUGADOR));
    arena.escribirVeredicto("ELIGE LA SEGUNDA");
    return;
  }

  const cartas = seleccionadas;
  seleccionadas = [];
  resolverConCartas(partida, cartas);
}

/** Abre el duelo de palabras si hay uno disponible. */
export function abrirDuelo() {
  const partida = estadoDelJuego.partida;
  if (!partida || partida.ocupada || partida.terminada) return;
  if (!partida.medidor.consumirDuelo()) return;

  gestorDeEscenas.ir("duelo", { partida });
}

/** Teclas de la partida: 1-4 eligen tirada, D abre el duelo, P pausa. */
function manejarTeclado(evento) {
  const tirada = TECLAS_DE_TIRADA[evento.key];
  if (tirada) {
    elegirTirada(tirada);
    return;
  }

  if (evento.key.toLowerCase() === "d") abrirDuelo();
  if (evento.key.toLowerCase() === "p") gestorDeEscenas.ir("pausa");
}

export const escenaPartida = {
  idPantalla: "pantalla-partida",

  /** @param {{reanudar?:boolean}} opciones */
  entrar(opciones = {}) {
    entradaDeTeclado.usar(manejarTeclado);

    if (opciones.reanudar && estadoDelJuego.partida) {
      prepararMesa(estadoDelJuego.partida);
      actualizarMusica(estadoDelJuego.partida);
      return;
    }

    avatar.desmontarAvatar();

    const partida = new Partida(fotoDeLosAjustes());
    ponerPartida(partida);

    document.body.classList.remove("en-peligro");
    arena.limpiarHistorial();
    prepararMedidor();
    prepararMesa(partida);

    avatar.montarAvatar(partida.ajustes.dificultad);
    avatar.reaccionar("saludo");

    gestorAudio.desbloquear();
    gestorAudio.ponerMusica("partida");
  },

  salir() {
    entradaDeTeclado.soltar();
  },
};

/** Se expone para que la escena de pausa pueda repintar al volver. */
export { prepararMesa, IA };