/**
 * Escenifica el parte de ronda que devuelve el motor.
 *
 * Aquí está TODO el espectáculo y NINGUNA regla: este archivo no decide quién
 * gana, solo lo cuenta con animaciones, carteles y sonido. Por eso se puede
 * cambiar el ritmo del juego entero tocando un solo sitio.
 */
import * as arena from "../render/pintor-arena.js";
import * as efectos from "../render/efectos-visuales.js";
import { pintarHud, idHudDe } from "../render/pintor-hud.js";
import { pintarMedidor, celebrarCargaLlena } from "../render/pintor-carga.js";
import { mostrarCarteles } from "../render/carteles.js";
import * as avatar from "../render/avatar-ia.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { actualizarMusica } from "../modules/audio/director-musical.js";
import { esperarSaltable } from "../utils/tiempo.js";
import { ETIQUETA } from "../modules/reglas-tiradas.js";
import { JUGADOR, IA, RITMO } from "../modules/constantes.js";
import { RESULTADO_EMPATE } from "../modules/resolutor-tiradas.js";
import { escenificarCartasEspeciales, escenificarImpactosDeRonda } from "./impactos-de-poder.js";

const NIVEL_TRIPLE = 3;

/** Porcentaje de vida a partir del cual el rival se pone a comentar apuros. */
const UMBRAL_DE_APUROS = 50;

/** Rachas seguidas del jugador que ya le pican al rival. */
const RACHA_QUE_MOLESTA = 2;

/** Texto del veredicto central según quién haya ganado. */
function textoDelVeredicto(parte) {
  const nombresJugador = parte.cartasJugador.map((carta) => ETIQUETA[carta]).join(" + ");
  const nombresIa = parte.cartasIa.map((carta) => ETIQUETA[carta]).join(" + ");

  if (parte.resultado === RESULTADO_EMPATE) return { texto: "EMPATE", clase: "empate" };

  if (parte.resultado === JUGADOR) {
    return { texto: `¡GANAS!\n${nombresJugador} > ${nombresIa}`, clase: "ganada" };
  }

  return { texto: `PIERDES\n${nombresIa} > ${nombresJugador}`, clase: "perdida" };
}

/** Revela las cartas con la pausa de "la IA está pensando". */
async function revelarCartas(parte) {
  arena.mostrarCartas(JUGADOR, parte.cartasJugador);

  arena.ponerAPensarALaIa(true);
  avatar.ponerAPensar(true);
  arena.escribirVeredicto("...");
  await esperarSaltable(RITMO.pensarIa);
  arena.ponerAPensarALaIa(false);
  avatar.ponerAPensar(false);

  arena.mostrarCartas(IA, parte.cartasIa);
  await esperarSaltable(RITMO.revelar);
}

/** El momento al que reacciona el rival según cómo haya ido la ronda. */
function momentoDelRival(partida, parte) {
  const bajoDeVida = parte.cruces.find((cruce) => cruce.porcentaje <= UMBRAL_DE_APUROS);
  if (bajoDeVida) return bajoDeVida.bando === JUGADOR ? "vidaBajaJugador" : "vidaBajaIa";

  if (parte.poderDeLaIa) return "poderIa";
  if (parte.resultado === RESULTADO_EMPATE) return "empate";

  if (parte.resultado === JUGADOR) {
    return partida.cadena[JUGADOR].racha >= RACHA_QUE_MOLESTA ? "cadenaJugador" : "pierdeIa";
  }

  return "ganaIa";
}

/** Todo el jugo visual del golpe. */
async function escenificarGolpe(parte) {
  arena.marcarGanadora(parte.ganador, parte.perdedor);

  await efectos.congelar(parte.nivel >= NIVEL_TRIPLE ? RITMO.congelarTriple : RITMO.congelarNormal);

  const idHud = idHudDe(parte.perdedor);
  const ganaElJugador = parte.ganador === JUGADOR;

  efectos.numeroDeDano(idHud, parte.dano, parte.nivel, parte.explicacion);
  efectos.sacudirHud(idHud);
  efectos.golpeDeCamara(parte.nivel >= NIVEL_TRIPLE);
  efectos.golpe(idHud, parte.nivel, ganaElJugador);

  if (parte.tiradaSellada) efectos.chispasDeSello();
  gestorAudio.efecto(ganaElJugador ? "ganar" : "perder");
}

/** Combo gigante si la racha del ganador da para ello. */
function escenificarCombo(partida, parte) {
  if (!parte.ganador) return;

  const racha = partida.cadena[parte.ganador].racha;
  if (racha < 2) return;

  efectos.combo(racha, parte.nivel, parte.ganador === JUGADOR);
}

/** El círculo de carga se ha llenado: aviso gordo. */
async function escenificarCarga(parte) {
  if (parte.duelosDesbloqueados <= 0) return;

  celebrarCargaLlena();
  gestorAudio.efecto("cargaLlena");
  avatar.reaccionar("dueloAbierto");

  await mostrarCarteles([
    {
      clase: "cf-duelo",
      titulo: "¡DUELO LISTO!",
      subtitulo: "pulsa el botón y juégate una bonificación",
    },
  ]);
}

/**
 * Reproduce el parte de ronda entero.
 * @param {object} partida
 * @param {object} parte
 */
export async function escenificarRonda(partida, parte) {
  await revelarCartas(parte);

  // La pistola dispara ANTES de que se decida el golpe: es lo primero que se
  // ve en la mesa, y lo que explica por qué ha ganado quien ha ganado.
  await escenificarCartasEspeciales(parte);

  const veredicto = textoDelVeredicto(parte);
  arena.escribirVeredicto(veredicto.texto, veredicto.clase);
  arena.anadirAlHistorial(parte.resultado, parte.cartasJugador[0], partida.ronda);

  if (parte.resultado === RESULTADO_EMPATE) {
    gestorAudio.efecto("empate");
    efectos.destello("rgba(124,152,173,.35)");
  } else if (!parte.cadenaMaxima) {
    await escenificarGolpe(parte);
    escenificarCombo(partida, parte);
  }

  // Los impactos van ANTES de repintar el marcador: cada uno lo repinta en
  // el instante de su golpe, así la barra baja cuando el martillo la toca.
  await escenificarImpactosDeRonda(partida, parte);

  pintarHud(partida);
  pintarMedidor(partida);
  actualizarMusica(partida);

  avatar.reaccionar(momentoDelRival(partida, parte), parte.comentarioDelRival);

  await mostrarCarteles([...parte.anuncios, ...parte.cruces]);
  await escenificarCarga(parte);
}
