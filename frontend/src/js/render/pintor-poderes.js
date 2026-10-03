/**
 * Pinta las mochilas de poderes de los dos bandos y el menú de elección que
 * aparece al ganar un duelo.
 */
import { buscar, crearElemento } from "../utils/dom.js";
import { obtenerPoder } from "../modules/catalogo-poderes.js";
import { JUGADOR, BANDOS } from "../modules/constantes.js";

/** Ficha de un poder guardado, pulsable si es del jugador. */
function crearFichaGuardada(idPoder, esDelJugador, alPulsar) {
  const poder = obtenerPoder(idPoder);

  const ficha = crearElemento(esDelJugador ? "button" : "div", {
    clase: "ficha-poder guardado",
    html: `<span class="ficha-simbolo">${poder.simbolo}</span><span class="ficha-nombre">${poder.nombre}</span>`,
    atributos: { title: poder.detalle, "data-poder": idPoder },
  });

  ficha.style.setProperty("--color-poder", poder.color);
  if (esDelJugador) ficha.addEventListener("click", () => alPulsar(idPoder));

  return ficha;
}

/** Ficha compacta de un poder que ya está en marcha. */
function crearFichaActiva(idPoder) {
  const poder = obtenerPoder(idPoder);

  const ficha = crearElemento("div", {
    clase: "ficha-poder activo",
    html: `<span class="ficha-simbolo">${poder.simbolo}</span>`,
    atributos: { title: `${poder.nombre} · ${poder.resumen}` },
  });

  ficha.style.setProperty("--color-poder", poder.color);
  return ficha;
}

/** Repinta la mochila de un bando. */
function pintarMochila(partida, bando, alPulsar) {
  const contenedor = buscar(`#mochila-${bando}`);
  const mochila = partida.mochila[bando];
  const esDelJugador = bando === JUGADOR;

  contenedor.innerHTML = "";

  mochila.guardados.forEach((idPoder) => {
    contenedor.appendChild(crearFichaGuardada(idPoder, esDelJugador, alPulsar));
  });

  mochila.listaDeActivos().forEach((idPoder) => {
    contenedor.appendChild(crearFichaActiva(idPoder));
  });

  contenedor.classList.toggle("vacia", contenedor.children.length === 0);
}

/** Repinta las dos mochilas. */
export function pintarPoderes(partida, alPulsar) {
  BANDOS.forEach((bando) => pintarMochila(partida, bando, alPulsar));
}

/** Tarjeta grande del menú de elección de premio. */
function crearTarjetaDeEleccion(idPoder, alElegir) {
  const poder = obtenerPoder(idPoder);

  const tarjeta = crearElemento("button", {
    clase: "tarjeta-poder",
    html:
      `<span class="tarjeta-simbolo">${poder.simbolo}</span>` +
      `<strong class="tarjeta-nombre">${poder.nombre}</strong>` +
      `<span class="tarjeta-resumen">${poder.resumen}</span>`,
  });

  tarjeta.style.setProperty("--color-poder", poder.color);
  tarjeta.addEventListener("click", () => alElegir(idPoder));

  return tarjeta;
}

/**
 * Enseña las opciones de premio tras ganar un duelo.
 * @param {string[]} opciones identificadores de poderes
 * @param {(id:string)=>void} alElegir
 */
export function pintarEleccionDePoder(opciones, alElegir) {
  const contenedor = buscar("#opciones-poder");
  contenedor.innerHTML = "";

  opciones.forEach((idPoder) => {
    contenedor.appendChild(crearTarjetaDeEleccion(idPoder, alElegir));
  });
}
