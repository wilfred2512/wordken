/**
 * IMPACTOS: cada habilidad hace lo que dice, encima de lo que toca.
 *
 * Interpreta las escenas de escenas-impacto.js. Para cada una:
 *   1. mide dónde está AHORA el elemento que recibe el golpe (la barra de
 *      vida, la carta...) y coloca ahí una capa invisible
 *   2. le pasa al CSS, como variables, dónde está el origen del proyectil
 *      respecto a ese punto (--dx, --dy) y a dónde rebota (--rx, --ry)
 *   3. en el milisegundo del golpe suelta chispas, sonido y sacudida, y le
 *      pone a los elementos golpeados su clase de reacción
 *
 * Las posiciones se miden en el momento, no se apuntan en el CSS: así el
 * martillo cae sobre la barra esté donde esté, en un portátil o en un móvil.
 *
 * Todo el movimiento es CSS con `translate`, `rotate`, `scale` y `opacity`,
 * que son las propiedades que resuelve la tarjeta gráfica (regla 13 de
 * docs/relevo.md). Aquí solo se calculan puntos y se ponen clases.
 */
import { buscar, crearElemento, reiniciarAnimacion } from "../utils/dom.js";
import { obtenerPoder } from "../modules/catalogo-poderes.js";
import { JUGADOR, bandoContrario } from "../modules/constantes.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { particulas } from "./particulas.js";
import { golpeDeCamara } from "./efectos-visuales.js";
import { ESCENAS } from "./escenas-impacto.js";

/** Cuánto dura la clase de reacción en el elemento golpeado. */
const DURACION_REACCION_MS = 700;

/** Por encima de esta altura (fracción de la ventana) la etiqueta va debajo. */
const ZONA_ALTA = 0.3;

/** Media anchura aproximada de la etiqueta, para que no se salga por los lados. */
const MEDIA_ETIQUETA_PX = 170;

/** Cuánto hay que correr la etiqueta para que quepa entera en la ventana. */
function correccionDeEtiqueta(x) {
  const porLaDerecha = Math.min(0, window.innerWidth - MEDIA_ETIQUETA_PX - x);
  const porLaIzquierda = Math.max(0, MEDIA_ETIQUETA_PX - x);

  return porLaDerecha + porLaIzquierda;
}

/**
 * Un punto de un elemento en coordenadas de la ventana.
 * @param {string} selector
 * @param {"centro"|"derecha"} lado
 */
function puntoDe(selector, lado = "centro") {
  const nodo = selector ? buscar(selector) : null;
  if (!nodo) return null;

  const caja = nodo.getBoundingClientRect();
  const x = lado === "derecha" ? Math.max(caja.left + 6, caja.right) : caja.left + caja.width / 2;

  return { x, y: caja.top + caja.height / 2 };
}

/** Resuelve un campo de la escena ([selector, lado]) a un punto, o null. */
function resolverPunto(campo, contexto) {
  if (!campo) return null;

  const [selector, lado] = campo(contexto);
  return puntoDe(selector, lado);
}

/** La etiqueta con el símbolo, el nombre del poder y la nota. */
function crearEtiqueta(escena, nota) {
  const poder = obtenerPoder(escena.poder);
  const texto = [poder ? `${poder.simbolo} ${poder.nombre}` : "", nota].filter(Boolean).join(" · ");

  return crearElemento("b", { clase: "impacto-etiqueta", texto });
}

/** Pone en el CSS las distancias desde el punto de impacto. */
function ponerDistancias(nodo, hasta, desde, luego) {
  const origen = desde ?? hasta;
  const rebote = luego ?? hasta;

  nodo.style.setProperty("--dx", `${origen.x - hasta.x}px`);
  nodo.style.setProperty("--dy", `${origen.y - hasta.y}px`);
  nodo.style.setProperty("--rx", `${rebote.x - hasta.x}px`);
  nodo.style.setProperty("--ry", `${rebote.y - hasta.y}px`);
}

/** Crea la capa del impacto sobre el punto de destino. */
function montarCapa(escena, contexto, puntos, nota) {
  const { hasta, desde, luego } = puntos;
  const haciaIzquierda = desde && desde.x > hasta.x;

  const nodo = crearElemento("div", {
    clase: [
      "impacto",
      `impacto-${contexto.id}`,
      contexto.bando === JUGADOR ? "" : "es-rival",
      haciaIzquierda ? "hacia-izquierda" : "",
      hasta.y < window.innerHeight * ZONA_ALTA ? "etiqueta-abajo" : "",
    ].filter(Boolean).join(" "),
    html: escena.html,
    atributos: { "aria-hidden": "true" },
  });

  nodo.style.left = `${hasta.x}px`;
  nodo.style.top = `${hasta.y}px`;
  nodo.style.setProperty("--dura", `${escena.duracion}ms`);
  nodo.style.setProperty("--ex", `${correccionDeEtiqueta(hasta.x)}px`);
  ponerDistancias(nodo, hasta, desde, luego);

  nodo.querySelectorAll("[data-nota]").forEach((hueco) => { hueco.textContent = nota ?? ""; });
  nodo.appendChild(crearEtiqueta(escena, nota));
  document.body.appendChild(nodo);

  return nodo;
}

/** Pone una clase de reacción y la quita al terminar, para no bloquear otras animaciones. */
function reaccionar(reaccion, contexto) {
  const nodo = buscar(reaccion.selector(contexto));
  if (!nodo) return;

  reiniciarAnimacion(nodo, reaccion.clase);
  setTimeout(() => nodo.classList.remove(reaccion.clase), DURACION_REACCION_MS);
}

/** Todo lo que pasa en el instante en que llega el golpe. */
function golpear(escena, puntos, alGolpear) {
  gestorAudio.efecto(escena.sonido);
  particulas.emitir(puntos.hasta.x, puntos.hasta.y, escena.chispas, 34, 7);
  if (escena.fuerte !== undefined) golpeDeCamara(escena.fuerte);
  alGolpear?.();
}

/** Programa el golpe, el rebote y las reacciones de la escena. */
function programar(escena, contexto, puntos, alGolpear) {
  if (escena.sonidoInicial) gestorAudio.efecto(escena.sonidoInicial);

  setTimeout(() => golpear(escena, puntos, alGolpear), escena.golpe);

  if (escena.rebote && puntos.luego) {
    const { x, y } = puntos.luego;
    setTimeout(() => particulas.emitir(x, y, escena.rebote.chispas, 30, 7), escena.rebote.en);
  }

  (escena.reacciones ?? []).forEach((reaccion) => {
    setTimeout(() => reaccionar(reaccion, contexto), reaccion.en);
  });
}

/**
 * Lanza un impacto.
 *
 * @param {string} idEscena  clave de escenas-impacto.js
 * @param {string} bando     quién usa la habilidad
 * @param {{nota?:string, tirada?:string, alGolpear?:Function}} [opciones]
 *        `tirada` apunta al sello o a la carta concreta; `alGolpear` se llama
 *        en el instante del golpe (la escena lo usa para repintar la vida
 *        justo cuando el martillo toca la barra, y no antes).
 * @returns {number} ms que dura, para que la escena pueda esperarlo
 */
export function lanzarImpacto(idEscena, bando, opciones = {}) {
  const escena = ESCENAS[idEscena];
  if (!escena) return 0;

  const contexto = { id: idEscena, bando, rival: bandoContrario(bando), tirada: opciones.tirada };
  const puntos = {
    hasta: resolverPunto(escena.hasta, contexto),
    desde: resolverPunto(escena.desde, contexto),
    luego: resolverPunto(escena.luego, contexto),
  };

  if (!puntos.hasta) {
    opciones.alGolpear?.();
    return 0;
  }

  const nodo = montarCapa(escena, contexto, puntos, opciones.nota);
  programar(escena, contexto, puntos, opciones.alGolpear);
  setTimeout(() => nodo.remove(), escena.duracion + 60);

  return escena.duracion;
}

/** true si existe una escena con ese nombre. */
export function hayImpacto(idEscena) {
  return Boolean(ESCENAS[idEscena]);
}
