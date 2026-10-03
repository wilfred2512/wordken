/**
 * Pinta la zona central: las cartas reveladas, el veredicto y el historial.
 */
import { buscar, crearElemento, reiniciarAnimacion } from "../utils/dom.js";
import { iconoDe, iconoOculto } from "./iconos.js";
import { ETIQUETA } from "../modules/reglas-tiradas.js";
import { JUGADOR, IA, BANDOS, MAXIMO_HISTORIAL_VISIBLE } from "../modules/constantes.js";

/** Clases de resultado para las marcas del historial. */
const CLASE_DE_RESULTADO = { [JUGADOR]: "ganada", [IA]: "perdida", empate: "empatada" };

/** Selector de la carta grande de un bando. */
function selectorDeCarta(bando) {
  return `#carta-${bando}`;
}

/** Enseña una o dos cartas en el hueco de un bando. */
export function mostrarCartas(bando, tiradas) {
  const hueco = buscar(selectorDeCarta(bando));

  hueco.className = `carta-grande doble-${tiradas.length}`;
  hueco.innerHTML = tiradas.map((tirada) => `<span class="cara m-${tirada}">${iconoDe(tirada)}</span>`).join("");
  hueco.dataset.tirada = tiradas[0];

  reiniciarAnimacion(hueco, "revelar");
}

/** Deja las dos cartas boca abajo. */
export function ocultarCartas() {
  BANDOS.forEach((bando) => {
    const hueco = buscar(selectorDeCarta(bando));
    hueco.className = "carta-grande";
    hueco.innerHTML = `<span class="cara">${iconoOculto()}</span>`;
    delete hueco.dataset.tirada;
  });
}

/** Marca la carta ganadora y apaga la perdedora. */
export function marcarGanadora(ganador, perdedor) {
  buscar(selectorDeCarta(ganador)).classList.add("gana");
  buscar(selectorDeCarta(perdedor)).classList.add("pierde");
}

/** Anima la carta de la IA mientras "piensa". */
export function ponerAPensarALaIa(pensando) {
  buscar(selectorDeCarta(IA)).classList.toggle("pensando", pensando);
}

/** Escribe el veredicto central con su color. */
export function escribirVeredicto(texto, clase = "") {
  const veredicto = buscar("#veredicto");

  veredicto.className = `veredicto ${clase}`;
  veredicto.innerHTML = texto.replaceAll("\n", "<br>");

  reiniciarAnimacion(veredicto, "rebote");
}

/** Añade una marca a la tira de historial y recorta las más antiguas. */
export function anadirAlHistorial(resultado, tirada, ronda) {
  const tira = buscar("#historial");

  const marca = crearElemento("div", {
    clase: `marca-historial ${CLASE_DE_RESULTADO[resultado] ?? "empatada"}`,
    html: iconoDe(tirada),
    atributos: { title: `Ronda ${ronda}: ${ETIQUETA[tirada] ?? tirada}` },
  });

  tira.appendChild(marca);

  while (tira.children.length > MAXIMO_HISTORIAL_VISIBLE) {
    tira.removeChild(tira.firstChild);
  }
}

/** Vacía la tira de historial al empezar una partida nueva. */
export function limpiarHistorial() {
  buscar("#historial").innerHTML = "";
}
