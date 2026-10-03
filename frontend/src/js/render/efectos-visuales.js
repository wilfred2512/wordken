/**
 * Los efectos que dan el tono frenético: congelación, golpe de cámara,
 * destellos, contador de combo y números de daño flotantes.
 *
 * Todo el CSS de estos efectos vive en css/efectos.css. En la versión
 * anterior del juego se inyectaba desde JavaScript; ahora no, porque el
 * enunciado prohíbe expresamente los estilos dentro del HTML y del JS.
 */
import { buscar, crearElemento, reiniciarAnimacion } from "../utils/dom.js";
import { esperar } from "../utils/tiempo.js";
import { particulas } from "./particulas.js";
import { JUGADOR } from "../modules/constantes.js";

/** Interruptores para apagar cada efecto por separado. */
export const AJUSTES_EFECTOS = {
  particulas: true,
  congelacion: true,
  golpeDeCamara: true,
  combo: true,
  destellos: true,
};

const COLOR = {
  bueno: "#35bd86",
  malo: "#fe5f55",
  sello: "#ffd23f",
  poder: "#a96cff",
};

const DURACION_GOLPE_MS = 620;
const DURACION_NUMERO_MS = 1000;

/** Capas que se crean una sola vez y se reutilizan. */
const capas = { destello: null, combo: null };

/** Crea una capa a pantalla completa si todavía no existe. */
function asegurarCapa(nombre, id, html = "") {
  if (capas[nombre]) return capas[nombre];

  const capa = crearElemento("div", { html, atributos: { id, "aria-hidden": "true" } });
  document.body.appendChild(capa);
  capas[nombre] = capa;

  return capa;
}

/** Congela la imagen unos milisegundos y sube el contraste. */
export async function congelar(milisegundos) {
  if (!AJUSTES_EFECTOS.congelacion) return;

  const aplicacion = buscar("#aplicacion");
  aplicacion.classList.add("fx-congelado");
  await esperar(milisegundos);
  aplicacion.classList.remove("fx-congelado");
}

/** Destello de color a pantalla completa. */
export function destello(color) {
  if (!AJUSTES_EFECTOS.destellos) return;

  const capa = asegurarCapa("destello", "fx-destello");
  capa.style.setProperty("--color-destello", color);
  reiniciarAnimacion(capa, "activo");
}

/**
 * Zoom y sacudida de la pantalla.
 *
 * Van en UNA sola animación CSS porque las dos usan `transform`, y dos
 * animaciones peleándose por la misma propiedad se pisan: gana una y la otra
 * no se ve.
 */
let limpiezaDelGolpe = null;

export function golpeDeCamara(esFuerte) {
  const aplicacion = buscar("#aplicacion");
  const clases = AJUSTES_EFECTOS.golpeDeCamara
    ? ["fx-golpe", "fx-golpe-fuerte"]
    : ["fx-sacudida", "fx-sacudida-fuerte"];

  aplicacion.classList.remove(...clases);
  void aplicacion.offsetWidth;
  aplicacion.classList.add(esFuerte ? clases[1] : clases[0]);

  // Si dos golpes se solapan (una fanfarria y el impacto de la ronda), el
  // temporizador del primero cortaría la animación del segundo a media
  // reproducción. Se cancela para que mande siempre el último.
  clearTimeout(limpiezaDelGolpe);
  limpiezaDelGolpe = setTimeout(() => aplicacion.classList.remove(...clases), DURACION_GOLPE_MS);
}

/** Número gigante de racha: dorado si es tuyo, rojo si es de la IA. */
export function combo(racha, nivel, esDelJugador) {
  if (!AJUSTES_EFECTOS.combo) return;

  const capa = asegurarCapa("combo", "fx-combo", "<b></b><span></span>");
  capa.querySelector("b").textContent = `x${racha}`;
  capa.querySelector("span").textContent = nivel === 3 ? "TRIPLE CADENA" : "EN RACHA";
  capa.classList.toggle("es-rival", !esDelJugador);

  reiniciarAnimacion(capa, "activo");
}

/** Número de daño que sube flotando desde el HUD golpeado. */
export function numeroDeDano(idHud, dano, nivel, explicacion) {
  const hud = buscar(idHud);
  const caja = hud.getBoundingClientRect();

  const clase = `numero-dano${nivel === 3 ? " enorme" : nivel === 2 ? " grande" : ""}`;
  const numero = crearElemento("div", { clase, texto: `-${dano}` });

  numero.style.left = `${caja.left + caja.width / 2}px`;
  numero.style.top = `${caja.top + caja.height / 2}px`;
  if (explicacion) numero.title = explicacion;

  buscar("#aplicacion").appendChild(numero);
  setTimeout(() => numero.remove(), DURACION_NUMERO_MS);
}

/** Sacudida del panel del bando golpeado. */
export function sacudirHud(idHud) {
  reiniciarAnimacion(buscar(idHud), "es-golpeado");
}

/** Chispas y destello combinados del golpe. */
export function golpe(idHud, nivel, ganaElJugador) {
  if (!AJUSTES_EFECTOS.particulas) return;

  const caja = buscar(idHud).getBoundingClientRect();
  const color = ganaElJugador ? COLOR.bueno : COLOR.malo;

  particulas.emitir(
    caja.left + caja.width / 2,
    caja.top + caja.height / 2,
    color,
    18 + nivel * 12,
    5 + nivel * 2,
  );

  destello(ganaElJugador ? "rgba(53,189,134,.30)" : "rgba(254,95,85,.34)");
}

/** Fuegos artificiales de un sello conseguido. */
export function chispasDeSello() {
  particulas.emitir(window.innerWidth / 2, window.innerHeight / 2, COLOR.sello, 46, 9);
  destello("rgba(255,210,63,.35)");
}

/** Chispas moradas al ganar o activar un poder. */
export function chispasDePoder(bando) {
  const color = bando === JUGADOR ? COLOR.poder : COLOR.malo;
  particulas.emitir(window.innerWidth / 2, window.innerHeight * 0.4, color, 40, 8);
  destello(bando === JUGADOR ? "rgba(169,108,255,.34)" : "rgba(254,95,85,.34)");
}

/** Explosión de varios focos: victoria, derrota o cadena máxima. */
export function explosion(esBuenaNoticia) {
  const colores = esBuenaNoticia
    ? ["#ffd23f", "#35bd86", "#a96cff", "#009dff"]
    : ["#fe5f55", "#a96cff", "#ff9f1c"];

  colores.forEach((color, indice) => {
    setTimeout(() => {
      particulas.emitir(
        window.innerWidth * (0.2 + Math.random() * 0.6),
        window.innerHeight * (0.25 + Math.random() * 0.4),
        color,
        34,
        12,
      );
    }, indice * 90);
  });

  destello(esBuenaNoticia ? "rgba(169,108,255,.5)" : "rgba(254,95,85,.5)");
}
