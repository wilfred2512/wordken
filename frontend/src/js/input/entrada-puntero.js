/**
 * Entrada de ratón y de dedo (táctil).
 *
 * En la web los dos llegan como el mismo evento `click`, así que basta con
 * registrar el manejador una vez. Lo que sí hace falta es evitar el retardo
 * de 300 ms del móvil, y eso se resuelve en el CSS con `touch-action`.
 *
 * Todos los eventos se registran desde JavaScript con addEventListener: en
 * el HTML no hay ni un solo onclick.
 */
import { buscarTodos, buscar } from "../utils/dom.js";

/**
 * Conecta cada carta de la mano con la función que juega esa tirada.
 * @param {(tirada:string)=>void} alElegirTirada
 */
export function conectarMano(alElegirTirada) {
  buscarTodos("#mano .carta").forEach((carta) => {
    carta.addEventListener("click", () => alElegirTirada(carta.dataset.tirada));
  });
}

/**
 * Conecta un botón por su selector.
 * Devuelve la función de baja, por si alguna escena necesita desconectarlo.
 */
export function conectarBoton(selector, funcion) {
  const boton = buscar(selector);
  if (!boton) return () => {};

  boton.addEventListener("click", funcion);
  return () => boton.removeEventListener("click", funcion);
}

/** Conecta todos los botones que llevan el atributo data-cerrar. */
export function conectarCierresDeVentana(alCerrar) {
  buscarTodos("[data-cerrar]").forEach((boton) => {
    boton.addEventListener("click", () => alCerrar(boton.dataset.cerrar));
  });
}

/**
 * Cierra una ventana al pulsar en el fondo oscuro.
 * Se comprueba que el objetivo sea el fondo y no una tarjeta de dentro.
 */
export function conectarCierrePorFondo(alCerrar, excepciones = []) {
  buscarTodos(".modal").forEach((ventana) => {
    ventana.addEventListener("mousedown", (evento) => {
      if (evento.target !== ventana) return;
      if (excepciones.includes(ventana.id)) return;

      alCerrar(ventana.id);
    });
  });
}
