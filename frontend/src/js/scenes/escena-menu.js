/**
 * Escena del menú principal y de la ventana de configuración.
 */
import { gestorDeEscenas } from "../core/gestor-escenas.js";
import { tirarPartida } from "../core/estado-juego.js";
import { ajustes, leerFormulario } from "../modules/ajustes-partida.js";
import { conectarFormulario } from "./formulario-configuracion.js";
import { abrirVentana, cerrarVentana, hayAvisoAbierto } from "../render/ventanas.js";
import { conectarBoton } from "../input/entrada-puntero.js";
import { entradaDeTeclado } from "../input/entrada-teclado.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { cargarTablaDePuntuaciones } from "./tabla-puntuaciones.js";
import { buscar, escribirTexto } from "../utils/dom.js";
import { NOMBRE_JUEGO, LEMA_JUEGO, DANO_BASE } from "../modules/constantes.js";
import { TOTAL_DE_PALABRAS, TOTAL_DOMINICANAS } from "../modules/diccionario-jergas.js";
import { golpesNecesarios } from "../utils/numeros.js";

/** Ventanas que pertenecen al menú y deben cerrarse al salir de él. */
const VENTANAS_DEL_MENU = ["modal-configuracion", "modal-reglas", "modal-ranking"];

let conectado = false;

/** Convierte un carácter del título en su etiqueta coloreada. */
function letraDelTitulo(letra, indice) {
  if (letra === " ") return '<span class="hueco-titulo"></span>';
  return `<span class="letra letra-${indice % 6}">${letra}</span>`;
}

/** Escribe el nombre del juego letra a letra, para poder colorearlas. */
function pintarTitulo() {
  const titulo = buscar("#titulo-juego");

  titulo.innerHTML = [...NOMBRE_JUEGO].map(letraDelTitulo).join("");

  escribirTexto("#lema-juego", LEMA_JUEGO);
  escribirTexto("#total-palabras", TOTAL_DE_PALABRAS);
  escribirTexto("#total-dominicanas", TOTAL_DOMINICANAS);
}

/** Frase de abajo del formulario: con daño fijo, más vida es más rondas. */
export function actualizarResumen() {
  const elegidos = leerFormulario();
  const paraTumbarla = golpesNecesarios(elegidos.vidaIa, DANO_BASE);
  const queAguantas = golpesNecesarios(elegidos.vidaJugador, DANO_BASE);

  const extra =
    elegidos.vidaJugador !== elegidos.vidaIa ? ` · tú aguantas <b>${queAguantas}</b>` : "";

  buscar("#resumen-configuracion").innerHTML =
    `Daño base <b>${DANO_BASE}</b> · unas <b>${paraTumbarla}</b> victorias limpias para tumbarla ` +
    `(bastantes menos con cadenas) · duelo cada <b>${elegidos.cargaObjetivo}</b> de daño${extra}`;
}

/** Abre una ventana haciendo sonar el clic. */
function abrirConClic(idVentana) {
  gestorAudio.desbloquear();
  gestorAudio.efecto("clic");
  abrirVentana(idVentana);
}

/**
 * Arranca la partida.
 * Comprueba antes si hay un aviso abierto, porque el navegador dispara los
 * eventos en el orden mousedown -> blur -> click: el blur puede abrir el
 * popup de validación justo antes de que llegue el click del botón.
 */
function empezarPartida() {
  gestorAudio.efecto("clic");
  if (hayAvisoAbierto()) return;

  cerrarVentana("modal-configuracion");
  gestorDeEscenas.ir("partida");
}

/** Conecta los botones del menú. Se hace una sola vez. */
function conectarBotones() {
  conectarBoton("#boton-jugar", () => {
    abrirConClic("modal-configuracion");
    actualizarResumen();
  });

  conectarBoton("#boton-reglas", () => abrirConClic("modal-reglas"));

  conectarBoton("#boton-ranking", () => {
    abrirConClic("modal-ranking");
    cargarTablaDePuntuaciones();
  });

  conectarBoton("#boton-empezar", empezarPartida);
}

export const escenaMenu = {
  idPantalla: "pantalla-menu",

  entrar() {
    if (!conectado) {
      conectado = true;
      pintarTitulo();
      conectarBotones();
      conectarFormulario(actualizarResumen);
    }

    tirarPartida();
    document.body.classList.remove("en-peligro");
    entradaDeTeclado.soltar();

    actualizarResumen();
    gestorAudio.ponerMusica("menu");
  },

  /**
   * Al salir del menú se cierran sus ventanas.
   * Sin esto, la ventana de configuración se quedaba flotando encima de la
   * partida y se tragaba los clics del botón del duelo.
   */
  salir() {
    VENTANAS_DEL_MENU.forEach(cerrarVentana);
  },
};

/** Dificultad elegida, expuesta para las pruebas desde la consola. */
export function dificultadElegida() {
  return ajustes.dificultad;
}
