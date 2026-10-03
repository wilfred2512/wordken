/**
 * Los carteles grandes que cruzan la pantalla: DOBLE CADENA, SELLO, BLOQUEO,
 * CADENA MÁXIMA y los avisos de los poderes.
 */
import { buscar } from "../utils/dom.js";
import { esperarSaltable } from "../utils/tiempo.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { RITMO } from "../modules/constantes.js";

/** Efecto de sonido asociado a cada clase de cartel. */
const SONIDO_DE_CARTEL = {
  "cf-sello": "sello",
  "cf-maxima": "maxima",
  "cf-bloqueo": "bloqueo",
  "cf-umbral": "umbral",
  "cf-poder": "poderGanado",
  "cf-robo": "poderRobado",
};

/**
 * Enseña un cartel y espera a que termine.
 * Es `async` para que la escena pueda encadenarlos con await, uno detrás de
 * otro, en lugar de amontonarlos todos a la vez.
 */
export async function mostrarCartel(clase, titulo, subtitulo, duracionMs = RITMO.cartelCorto) {
  const cartel = buscar("#cartel-cadena");

  cartel.className = `cartel-cadena visible ${clase}`;
  cartel.querySelector(".cartel-titulo").textContent = titulo;
  cartel.querySelector(".cartel-subtitulo").textContent = subtitulo;

  reiniciarAnimacionDelInterior(cartel);

  const sonido = SONIDO_DE_CARTEL[clase];
  if (sonido) gestorAudio.efecto(sonido);

  await esperarSaltable(duracionMs);
  cartel.className = "cartel-cadena";
}

/** Fuerza que la animación de entrada se reproduzca otra vez. */
function reiniciarAnimacionDelInterior(cartel) {
  const interior = cartel.querySelector(".cartel-interior");

  interior.style.animation = "none";
  void interior.offsetWidth;
  interior.style.animation = "";
}

/** Enseña una lista de carteles en fila. */
export async function mostrarCarteles(anuncios) {
  for (const anuncio of anuncios) {
    await mostrarCartel(anuncio.clase, anuncio.titulo, anuncio.subtitulo);
  }
}
