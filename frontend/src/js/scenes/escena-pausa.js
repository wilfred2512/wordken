/**
 * Escena de pausa.
 *
 * No cambia de pantalla: abre una ventana encima de la partida, le quita el
 * teclado a la escena de juego y para la música. Así no se puede tirar desde
 * detrás del menú ni sigue sonando el tema como si nada.
 */
import { gestorDeEscenas } from "../core/gestor-escenas.js";
import { abrirVentana, cerrarVentana } from "../render/ventanas.js";
import { entradaDeTeclado } from "../input/entrada-teclado.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";

/** Teclas admitidas mientras la partida está pausada. */
function manejarTeclado(evento) {
  const tecla = evento.key.toLowerCase();
  if (tecla === "p" || tecla === "escape") reanudar();
}

/** Cierra la pausa y devuelve el control a la partida. */
export function reanudar() {
  gestorAudio.efecto("reanudar");
  cerrarVentana("modal-pausa");
  gestorDeEscenas.ir("partida", { reanudar: true });
}

/** Abandona la partida y vuelve al menú. */
export function abandonar() {
  gestorAudio.efecto("clic");
  cerrarVentana("modal-pausa");
  gestorDeEscenas.ir("menu");
}

export const escenaPausa = {
  idPantalla: "pantalla-partida",

  entrar() {
    gestorAudio.efecto("pausa");
    gestorAudio.pausar();
    entradaDeTeclado.usar(manejarTeclado);
    abrirVentana("modal-pausa");
  },

  /**
   * Al salir siempre se reanuda el audio: tanto si se vuelve a la partida
   * como si se abandona, porque el menú pone su propia música encima.
   */
  salir() {
    gestorAudio.reanudar();
    entradaDeTeclado.soltar();
    cerrarVentana("modal-pausa");
  },
};
