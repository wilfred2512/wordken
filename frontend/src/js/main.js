/**
 * Punto de entrada. Solo orquesta: registra las escenas, conecta los mandos
 * globales y arranca en el menú. Aquí no hay ni una regla del juego.
 */
import { gestorDeEscenas } from "./core/gestor-escenas.js";
import { escenaMenu } from "./scenes/escena-menu.js";
import { escenaPartida, abrirDuelo, elegirTirada } from "./scenes/escena-partida.js";
import { escenaDuelo } from "./scenes/escena-duelo.js";
import { escenaPausa, reanudar, abandonar } from "./scenes/escena-pausa.js";
import { escenaFin, volverAlMenu, jugarRevancha } from "./scenes/escena-fin.js";
import { entradaDeTeclado } from "./input/entrada-teclado.js";
import {
  conectarMano,
  conectarBoton,
  conectarCierresDeVentana,
  conectarCierrePorFondo,
} from "./input/entrada-puntero.js";
import { cerrarVentana, cerrarVentanasAbiertas } from "./render/ventanas.js";
import { activarInclinacion } from "./render/pintor-mano.js";
import { gestorAudio } from "./modules/audio/gestor-audio.js";
import { buscar } from "./utils/dom.js";
import { estadoDelJuego } from "./core/estado-juego.js";
import { exponerHerramientasDePrueba } from "./modules/herramientas-de-prueba.js";
import { cargarIconos } from "./render/sprite-iconos.js";
import { montarAyudante } from "./render/chat-ayuda.js";
import { montarFondoVivo } from "./render/fondo-vivo.js";

/** Ventanas que no se cierran solas al pulsar fuera o al dar a Escape. */
const VENTANAS_PERSISTENTES = ["modal-fin", "modal-premio"];

/** Registra las cinco escenas del juego. */
function registrarEscenas() {
  gestorDeEscenas.registrar("menu", escenaMenu);
  gestorDeEscenas.registrar("partida", escenaPartida);
  gestorDeEscenas.registrar("duelo", escenaDuelo);
  gestorDeEscenas.registrar("pausa", escenaPausa);
  gestorDeEscenas.registrar("fin", escenaFin);
}

/** Botón de silencio, arriba a la derecha. */
function conectarSonido() {
  conectarBoton("#boton-sonido", () => {
    gestorAudio.desbloquear();

    const silenciar = !gestorAudio.silenciado;
    gestorAudio.silenciar(silenciar);
    buscar("#boton-sonido").classList.toggle("silenciado", silenciar);
  });
}

/** Botones que aparecen durante la partida. */
function conectarBotonesDePartida() {
  conectarMano(elegirTirada);
  activarInclinacion();

  conectarBoton("#boton-duelo", abrirDuelo);
  conectarBoton("#boton-pausa", () => gestorDeEscenas.ir("pausa"));
  conectarBoton("#boton-reanudar", reanudar);
  conectarBoton("#boton-abandonar", abandonar);
  conectarBoton("#boton-menu-final", volverAlMenu);
  conectarBoton("#boton-revancha", jugarRevancha);
}

/** Cierre de ventanas: aspas, fondo oscuro y tecla Escape. */
function conectarVentanas() {
  conectarCierresDeVentana((idVentana) => {
    gestorAudio.efecto("clic");
    cerrarVentana(idVentana);
  });

  conectarCierrePorFondo(cerrarVentana, VENTANAS_PERSISTENTES);

  entradaDeTeclado.registrarAtajoGlobal("escape", () => {
    cerrarVentanasAbiertas(VENTANAS_PERSISTENTES);
  });
}

/**
 * El navegador exige un gesto del usuario antes de dejar sonar nada.
 * No es un fallo del juego: es política de todos los navegadores.
 */
function desbloquearAudioAlPrimerGesto() {
  const desbloquear = () => {
    gestorAudio.desbloquear();
    if (!estadoDelJuego.partida) gestorAudio.ponerMusica("menu");
  };

  ["pointerdown", "keydown"].forEach((evento) => {
    window.addEventListener(evento, desbloquear, { once: true });
  });
}

/** Arranque. */
async function iniciar() {
  await cargarIconos();
  registrarEscenas();
  entradaDeTeclado.conectar();

  conectarSonido();
  conectarBotonesDePartida();
  conectarVentanas();
  desbloquearAudioAlPrimerGesto();

  exponerHerramientasDePrueba();
  montarAyudante();
  montarFondoVivo();
  gestorDeEscenas.ir("menu");
}

document.addEventListener("DOMContentLoaded", iniciar);
