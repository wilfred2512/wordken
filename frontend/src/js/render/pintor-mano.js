/**
 * Pinta la mano del jugador: cartas disponibles, vetadas y seleccionadas.
 */
import { buscar, buscarTodos } from "../utils/dom.js";
import { TIRADA_PISTOLA, TIRADA_ESCUDO } from "../modules/reglas-tiradas.js";
import { JUGADOR } from "../modules/constantes.js";

/** Las cartas que solo aparecen cuando un poder las pone en la mano. */
const CARTAS_ESPECIALES = [TIRADA_PISTOLA, TIRADA_ESCUDO];

/** Todas las cartas jugables de la mano, incluida la pistola si está visible. */
function cartasDeLaMano() {
  return buscarTodos("#mano .carta");
}

/**
 * Enseña u oculta la PISTOLA y el ESCUDO según estén activos.
 * Las dos cartas existen siempre en el HTML y solo se muestran cuando toca:
 * así no hace falta construir elementos desde JavaScript.
 */
export function actualizarCartasEspeciales(partida) {
  const mochila = partida.mochila[JUGADOR];

  CARTAS_ESPECIALES.forEach((tirada) => {
    const carta = buscar(`#mano .carta[data-tirada="${tirada}"]`);
    carta.hidden = !mochila.estaActivo(tirada);
  });
}

/**
 * Activa o desactiva la mano entera.
 * @param {boolean} bloqueada
 * @param {string[]} seleccionadas tiradas ya elegidas esta ronda
 * @param {string|null} vetada
 */
export function pintarMano(bloqueada, seleccionadas = [], vetada = null) {
  cartasDeLaMano().forEach((carta) => {
    const tirada = carta.dataset.tirada;
    const estaVetada = tirada === vetada;

    carta.disabled = bloqueada || estaVetada;
    carta.classList.toggle("vetada", estaVetada);
    carta.classList.toggle("elegida", seleccionadas.includes(tirada));
  });
}

/** Quita todas las marcas de selección. */
export function limpiarSeleccion() {
  cartasDeLaMano().forEach((carta) => carta.classList.remove("elegida"));
}

/**
 * Inclinación 3D de las cartas al pasar el ratón (el toque Balatro).
 * Se registra una sola vez, al arrancar.
 */
export function activarInclinacion() {
  cartasDeLaMano().forEach((carta) => {
    carta.addEventListener("mousemove", (evento) => inclinar(carta, evento));
    carta.addEventListener("mouseleave", () => {
      carta.style.transform = "";
    });
  });
}

/** Calcula la rotación en función de dónde está el ratón dentro de la carta. */
function inclinar(carta, evento) {
  if (carta.disabled) return;

  const caja = carta.getBoundingClientRect();
  const x = (evento.clientX - caja.left) / caja.width - 0.5;
  const y = (evento.clientY - caja.top) / caja.height - 0.5;

  carta.style.transform =
    `translateY(-22px) scale(1.07) rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
}
