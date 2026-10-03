/**
 * Apertura y cierre de las ventanas modales, y el aviso animado.
 */
import { buscar, buscarTodos, reiniciarAnimacion } from "../utils/dom.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";

const MILISEGUNDOS_DE_CIERRE = 160;
const ANTIRREBOTE_DE_AVISO_MS = 700;

let momentoDelUltimoAviso = 0;

/** Abre una ventana por su identificador. */
export function abrirVentana(idVentana) {
  const ventana = document.getElementById(idVentana);
  if (!ventana) return;

  ventana.hidden = false;
  ventana.classList.remove("cerrando");
}

/** Cierra una ventana dejando que termine su animación de salida. */
export function cerrarVentana(idVentana) {
  const ventana = document.getElementById(idVentana);
  if (!ventana) return;

  ventana.classList.add("cerrando");
  setTimeout(() => {
    ventana.hidden = true;
    ventana.classList.remove("cerrando");
  }, MILISEGUNDOS_DE_CIERRE);
}

/** Cierra todas las ventanas abiertas menos las que no se deben cerrar solas. */
export function cerrarVentanasAbiertas(excepciones = []) {
  buscarTodos(".modal:not([hidden])").forEach((ventana) => {
    if (!excepciones.includes(ventana.id)) cerrarVentana(ventana.id);
  });
}

/** true si hay algún aviso abierto ahora mismo. */
export function hayAvisoAbierto() {
  return !buscar("#modal-aviso").hidden;
}

/**
 * Aviso animado reutilizable.
 * El antirrebote evita que dos validaciones seguidas disparen dos popups
 * encima del otro.
 */
export function mostrarAviso(titulo, mensaje) {
  const ahora = Date.now();
  if (ahora - momentoDelUltimoAviso < ANTIRREBOTE_DE_AVISO_MS) return;
  momentoDelUltimoAviso = ahora;

  buscar("#aviso-titulo").textContent = titulo;
  buscar("#aviso-mensaje").innerHTML = mensaje;

  reiniciarAnimacion(buscar("#tarjeta-aviso"), "rebota");
  abrirVentana("modal-aviso");
  gestorAudio.efecto("perder");
}

/** Temblor rojo de la casilla que tiene un valor inválido. */
export function marcarCasillaMal(casilla) {
  reiniciarAnimacion(casilla, "mal");
}
