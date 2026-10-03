/**
 * FONDO VIVO: piedras, papeles y tijeras que suben flotando detrás de todo.
 *
 * Es decoración pura y por eso se construye desde aquí y no desde el HTML,
 * igual que el resto de capas de efectos. Cada pieza recibe al nacer su
 * tamaño, su carril, su velocidad y su giro como variables CSS, y a partir de
 * ahí la mueve el CSS de frenesi.css sin que este archivo vuelva a hacer nada:
 * ni un temporizador, ni un requestAnimationFrame.
 *
 * El retraso de cada pieza es NEGATIVO a propósito: así, al abrir el juego,
 * las piezas ya están repartidas por la pantalla a media subida, en vez de
 * salir todas a la vez desde abajo como un desfile.
 */
import { buscar, crearElemento } from "../utils/dom.js";

const PIEZAS = 18;
const TIRADAS = ["piedra", "papel", "tijera"];

/** Número al azar entre dos valores. */
function entre(minimo, maximo) {
  return minimo + Math.random() * (maximo - minimo);
}

/** Una pieza con su recorrido sorteado. */
function crearPieza(indice) {
  const tirada = TIRADAS[indice % TIRADAS.length];
  const duracion = entre(14, 30);

  const pieza = crearElemento("i", {
    clase: `pieza-fondo m-${tirada}`,
    html: `<svg><use href="#icono-${tirada}"></use></svg>`,
  });

  const variables = {
    "--tam": `${Math.round(entre(28, 96))}px`,
    "--x0": `${entre(-5, 100).toFixed(1)}vw`,
    "--x1": `${entre(-12, 12).toFixed(1)}vw`,
    "--giro": `${Math.round(entre(-720, 720))}deg`,
    "--dur": `${duracion.toFixed(1)}s`,
    "--ret": `${(-entre(0, duracion)).toFixed(1)}s`,
    "--alfa": entre(0.1, 0.3).toFixed(2),
  };

  Object.entries(variables).forEach(([nombre, valor]) => pieza.style.setProperty(nombre, valor));
  return pieza;
}

/** Crea la capa una sola vez, justo encima del fondo y debajo del juego. */
export function montarFondoVivo() {
  if (buscar("#fondo-vivo")) return;

  const capa = crearElemento("div", { atributos: { id: "fondo-vivo", "aria-hidden": "true" } });
  for (let indice = 0; indice < PIEZAS; indice++) capa.appendChild(crearPieza(indice));

  const fondo = buscar("#fondo");
  if (fondo) fondo.after(capa);
  else document.body.prepend(capa);
}
