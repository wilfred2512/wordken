/**
 * Puerta trasera para probar el juego desde la consola del navegador.
 *
 * Sirve para dos cosas: depurar sin tener que jugar veinte rondas a mano, y
 * enseñar en la defensa que la lógica funciona sin tocar la interfaz.
 *
 * Ejemplos:
 *   JUEGO.partida                       ver el estado
 *   JUEGO.forzarTiradaIa(() => "tijera")
 *   JUEGO.regalarPoder("pistola")
 *   JUEGO.llenarCarga()
 */
import { estadoDelJuego } from "../core/estado-juego.js";
import { gestorDeEscenas } from "../core/gestor-escenas.js";
import { JUGADOR } from "./constantes.js";
import { IDS_DE_PODERES } from "./catalogo-poderes.js";

/** Fuerza la tirada de la IA para probar cadenas de forma determinista. */
function forzarTiradaIa(funcion) {
  if (estadoDelJuego.partida) estadoDelJuego.partida.oponente.forzarTirada = funcion;
}

/** Mete un poder en la mochila del jugador sin pasar por el duelo. */
function regalarPoder(idPoder) {
  if (!estadoDelJuego.partida) return false;
  if (!IDS_DE_PODERES.includes(idPoder)) return false;

  estadoDelJuego.partida.mochila[JUGADOR].guardar(idPoder);
  return true;
}

/** Llena el círculo de carga para abrir el duelo ya mismo. */
function llenarCarga() {
  const partida = estadoDelJuego.partida;
  if (!partida) return false;

  partida.medidor.sumarDano(partida.medidor.objetivo);
  return true;
}

/** Herramientas que se cuelgan de window.JUEGO. */
function construirHerramientas() {
  return {
    get partida() {
      return estadoDelJuego.partida;
    },

    get escena() {
      return gestorDeEscenas.nombreActual();
    },

    /** La ronda de wordle abierta, para comprobar la palabra al depurar. */
    get duelo() {
      return estadoDelJuego.dueloEnCurso;
    },

    forzarTiradaIa,
    regalarPoder,
    llenarCarga,
    poderes: IDS_DE_PODERES,
  };
}

/** Cuelga las herramientas de window. Se llama una vez, al arrancar. */
export function exponerHerramientasDePrueba() {
  window.JUEGO = construirHerramientas();
}
