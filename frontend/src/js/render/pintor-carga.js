/**
 * Pinta el círculo de carga y el botón que abre el duelo de palabras.
 *
 * El círculo es un <circle> de SVG al que se le va soltando el trazo. El
 * truco: `stroke-dasharray` vale toda la circunferencia y `stroke-dashoffset`
 * se va reduciendo, de modo que el trazo parece dibujarse solo.
 */
import { buscar, escribirTexto, reiniciarAnimacion } from "../utils/dom.js";

/** Radio del círculo en el SVG. Debe coincidir con el atributo r del HTML. */
const RADIO = 34;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/** Prepara el trazo del círculo. Se llama una vez al arrancar la partida. */
export function prepararMedidor() {
  const trazo = buscar("#circulo-carga-relleno");

  trazo.style.strokeDasharray = `${CIRCUNFERENCIA}`;
  trazo.style.strokeDashoffset = `${CIRCUNFERENCIA}`;
}

/** Actualiza el círculo, el texto y el estado del botón de duelo. */
export function pintarMedidor(partida) {
  const medidor = partida.medidor;
  const trazo = buscar("#circulo-carga-relleno");
  const lleno = medidor.hayDueloDisponible();

  trazo.style.strokeDashoffset = `${CIRCUNFERENCIA * (1 - (lleno ? 1 : medidor.fraccion()))}`;

  escribirTexto("#carga-texto", lleno ? "¡YA!" : `${medidor.carga}/${medidor.objetivo}`);
  buscar("#medidor-carga").classList.toggle("lleno", lleno);

  pintarBotonDeDuelo(medidor);
}

/** Enciende o apaga el botón del duelo. */
function pintarBotonDeDuelo(medidor) {
  const boton = buscar("#boton-duelo");
  const disponibles = medidor.duelosDisponibles;

  boton.disabled = disponibles === 0;
  boton.classList.toggle("listo", disponibles > 0);
  boton.querySelector(".duelo-contador").textContent = disponibles > 1 ? `x${disponibles}` : "";
}

/** Animación de golpe cuando el círculo acaba de llenarse. */
export function celebrarCargaLlena() {
  reiniciarAnimacion(buscar("#medidor-carga"), "acaba-de-llenarse");
  reiniciarAnimacion(buscar("#boton-duelo"), "aparece");
}
