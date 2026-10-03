/**
 * La FANFARRIA de un poder: el aviso a pantalla completa que sale cada vez que
 * una habilidad especial entra en juego.
 *
 * Por qué existe este archivo y no se apaña con un cartel más: un cartel es
 * texto, y aquí hacía falta que CADA poder se moviera distinto. El catálogo le
 * pone a cada uno un `gesto` (disparo, dados, cerrojo...) y el CSS tiene una
 * animación por gesto. Así, añadir un poder nuevo con su propia animación es
 * una entrada en el catálogo y un bloque de CSS: ni una línea de aquí.
 *
 * NO espera a nadie: la fanfarria se lanza y sigue sola mientras la ronda
 * continúa. Si esperara, cada poder añadiría medio segundo de quietud, que es
 * justo lo contrario de lo que se busca.
 */
import { crearElemento, reiniciarAnimacion, colorReal } from "../utils/dom.js";
import { obtenerPoder } from "../modules/catalogo-poderes.js";
import { JUGADOR } from "../modules/constantes.js";
import { particulas } from "./particulas.js";
import { destello, golpeDeCamara } from "./efectos-visuales.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";

/** Cuánto dura la animación más larga del CSS. */
const DURACION_MS = 1100;

/** Interruptor general, por si hay que bajar el ruido visual. */
export const FANFARRIAS_ENCENDIDAS = { activas: true };

const ESTRUCTURA =
  '<div class="fanfarria-rayos"></div>' +
  '<div class="fanfarria-anillo"></div>' +
  '<div class="fanfarria-anillo anillo-tarde"></div>' +
  '<div class="fanfarria-cuerpo">' +
  '<span class="fanfarria-simbolo"></span>' +
  '<strong class="fanfarria-nombre"></strong>' +
  '<span class="fanfarria-nota"></span>' +
  "</div>";

let capa = null;
let apagado = null;

/** Crea la capa una sola vez y la reutiliza en toda la partida. */
function asegurarCapa() {
  if (capa) return capa;

  capa = crearElemento("div", {
    html: ESTRUCTURA,
    atributos: { id: "fx-fanfarria", "aria-hidden": "true" },
  });
  document.body.appendChild(capa);

  return capa;
}

/** Escribe el símbolo, el nombre y la nota al pie. */
function rellenar(poder, nota) {
  capa.querySelector(".fanfarria-simbolo").textContent = poder.simbolo;
  capa.querySelector(".fanfarria-nombre").textContent = poder.nombre;
  capa.querySelector(".fanfarria-nota").textContent = nota ?? "";
}

/** Chispas del color del poder, saliendo del centro. */
function chispas(color) {
  particulas.emitir(window.innerWidth / 2, window.innerHeight * 0.46, color, 38, 9);
}

/**
 * Lanza la fanfarria de un poder.
 *
 * @param {string} idPoder  identificador del catálogo
 * @param {string} bando    quién lo usa: cambia el tono a rojo si es la IA
 * @param {string} [nota]   línea corta debajo del nombre
 */
export function lanzarFanfarria(idPoder, bando, nota) {
  const poder = obtenerPoder(idPoder);
  if (!poder || !FANFARRIAS_ENCENDIDAS.activas) return;

  asegurarCapa();
  rellenar(poder, nota);

  const color = colorReal(poder.color);
  capa.style.setProperty("--color-poder", poder.color);
  capa.className = `gesto-${poder.gesto}${bando === JUGADOR ? "" : " es-rival"}`;
  reiniciarAnimacion(capa, "activo");

  gestorAudio.efecto(poder.gesto);
  if (bando !== JUGADOR) gestorAudio.efecto("poderRobado");
  destello(bando === JUGADOR ? "rgba(169,108,255,.26)" : "rgba(254,95,85,.26)");
  golpeDeCamara(false);
  chispas(bando === JUGADOR ? color : colorReal("var(--rojo)"));

  clearTimeout(apagado);
  apagado = setTimeout(() => capa.classList.remove("activo"), DURACION_MS);
}
