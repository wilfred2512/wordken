/**
 * Pinta el duelo de palabras: tablero, teclado virtual, reloj y avisos.
 */
import { buscar, crearElemento, escribirTexto, reiniciarAnimacion } from "../utils/dom.js";
import { formatearTiempo } from "../utils/tiempo.js";
import { INTENTOS_DE_DUELO } from "../modules/constantes.js";

/** Distribución del teclado virtual, en tres filas. */
const FILAS_DEL_TECLADO = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["ENVIAR", "Z", "X", "C", "V", "B", "N", "M", "BORRAR"],
];

const TECLAS_ANCHAS = ["ENVIAR", "BORRAR"];
const FRACCION_DE_APURO = 0.25;

/** Construye el tablero vacío: una fila por intento. */
export function construirTablero(largoDePalabra) {
  const tablero = buscar("#tablero-duelo");
  tablero.innerHTML = "";
  tablero.style.setProperty("--columnas", largoDePalabra);

  for (let fila = 0; fila < INTENTOS_DE_DUELO; fila++) {
    const nuevaFila = crearElemento("div", { clase: "fila-duelo" });

    for (let columna = 0; columna < largoDePalabra; columna++) {
      nuevaFila.appendChild(crearElemento("div", { clase: "casilla-duelo" }));
    }

    tablero.appendChild(nuevaFila);
  }
}

/** Construye el teclado virtual y conecta cada tecla. */
export function construirTeclado(alPulsarTecla) {
  const teclado = buscar("#teclado-duelo");
  teclado.innerHTML = "";

  FILAS_DEL_TECLADO.forEach((letras) => {
    const fila = crearElemento("div", { clase: "fila-teclado" });

    letras.forEach((letra) => {
      const clase = `tecla${TECLAS_ANCHAS.includes(letra) ? " ancha" : ""}`;
      const tecla = crearElemento("button", {
        clase,
        texto: letra,
        atributos: { type: "button", "data-tecla": letra },
      });

      tecla.addEventListener("click", () => alPulsarTecla(letra));
      fila.appendChild(tecla);
    });

    teclado.appendChild(fila);
  });
}

/** Escribe en la fila activa lo que el jugador lleva tecleado. */
export function pintarFilaEnCurso(indiceDeFila, letras, largo) {
  const fila = buscar("#tablero-duelo").children[indiceDeFila];
  if (!fila) return;

  for (let columna = 0; columna < largo; columna++) {
    const casilla = fila.children[columna];
    const letra = letras[columna] ?? "";

    casilla.textContent = letra;
    casilla.classList.toggle("escrita", letra !== "");
  }
}

/** Colorea una fila ya evaluada, letra a letra, con un pequeño retardo. */
export function pintarResultado(indiceDeFila, palabra, resultado, alColorear) {
  const fila = buscar("#tablero-duelo").children[indiceDeFila];

  resultado.forEach((estado, columna) => {
    setTimeout(() => {
      const casilla = fila.children[columna];
      casilla.textContent = palabra[columna];
      casilla.classList.add(estado, "volteada");
      alColorear(estado);
    }, columna * 180);
  });
}

/** Actualiza los colores del teclado virtual. */
export function pintarTeclado(estadoTeclado) {
  estadoTeclado.forEach((estado, letra) => {
    const tecla = buscar(`#teclado-duelo .tecla[data-tecla="${letra}"]`);
    if (tecla) tecla.classList.add(estado);
  });
}

/** Texto del recuadro de la pista extra según esté abierta o no. */
function textoDePistaExtra(ronda) {
  if (ronda.pistaExtraVisible()) return ronda.pistaExtra();

  const fallos = ronda.fallosParaPistaExtra();
  return `Pista extra: se abre en ${fallos} ${fallos === 1 ? "intento" : "intentos"}`;
}

/**
 * Cabecera del duelo: tipo, región, letras, intentos y las dos pistas.
 * La pista principal se ve desde el primer segundo; la extra se gana fallando.
 */
export function pintarCabeceraDuelo(ronda) {
  escribirTexto("#tipo-duelo", ronda.tipo);
  escribirTexto("#region-duelo", ronda.region);
  escribirTexto("#letras-duelo", ronda.largo());
  escribirTexto("#intentos-duelo", `${ronda.intentos.length}/${INTENTOS_DE_DUELO}`);
  escribirTexto("#pista-duelo", ronda.pista);

  const extra = buscar("#pista-extra-duelo");
  const abierta = ronda.pistaExtraVisible();
  const cambia = abierta && extra.classList.contains("oculta");

  extra.classList.remove("solucion");
  extra.textContent = textoDePistaExtra(ronda);
  extra.classList.toggle("oculta", !abierta);

  if (cambia) reiniciarAnimacion(extra, "recien-abierta");
}

/** Reloj y barra de tiempo. */
export function pintarTiempo(restanteMs, fraccion) {
  escribirTexto("#reloj-duelo", formatearTiempo(restanteMs));

  const barra = buscar("#barra-tiempo");
  barra.style.width = `${fraccion * 100}%`;
  barra.classList.toggle("apurado", fraccion <= FRACCION_DE_APURO);
}

/** Deja el tablero con la palabra correcta a la vista al perder. */
export function revelarSolucion(palabra) {
  escribirTexto("#pista-extra-duelo", `La palabra era ${palabra}`);
  const extra = buscar("#pista-extra-duelo");
  extra.classList.remove("oculta");
  extra.classList.add("solucion");
  reiniciarAnimacion(extra, "recien-abierta");
}

/** Mensaje de la parte baja del duelo. */
export function mostrarMensajeDuelo(texto, esError = false) {
  const mensaje = buscar("#mensaje-duelo");

  mensaje.textContent = texto;
  mensaje.classList.toggle("error", esError);
  reiniciarAnimacion(mensaje, "aparece");
}

/** Temblor de la fila cuando el intento no es válido. */
export function temblarFila(indiceDeFila) {
  const fila = buscar("#tablero-duelo").children[indiceDeFila];
  if (fila) reiniciarAnimacion(fila, "tiembla");
}
