/**
 * Cableado del formulario de configuración: vida, carga y dificultad.
 *
 * Está separado de la escena del menú porque son dos trabajos distintos:
 * la escena decide qué pantalla se ve, el formulario valida lo que se teclea.
 */
import { buscar, buscarTodos } from "../utils/dom.js";
import { ajustes, vigilarMientrasEscribe, corregirAlSalir } from "../modules/ajustes-partida.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { obtenerPersonaje } from "../modules/personajes-ia.js";
import {
  VIDA_MAXIMA,
  VIDA_MINIMA,
  VIDA_POR_DEFECTO,
  CARGA_MAXIMA,
  CARGA_MINIMA,
  CARGA_POR_DEFECTO,
} from "../modules/constantes.js";

const CASILLAS_DE_VIDA = ["#campo-vida", "#campo-vida-jugador", "#campo-vida-ia"];

/** Textos de los avisos de la vida. */
const REGLAS_DE_VIDA = {
  minimo: VIDA_MINIMA,
  maximo: VIDA_MAXIMA,
  porDefecto: VIDA_POR_DEFECTO,
  tituloVacio: "TE FALTA LA VIDA",
  mensajeVacio: `Has dejado la casilla vacía. La he puesto en <b>${VIDA_POR_DEFECTO}</b> para que puedas seguir.`,
  tituloBajo: "¿CERO DE VIDA?",
  mensajeBajo:
    "Con <b>0</b> empezarías la partida ya muerto. El mínimo es <b>1</b>, y ahí te lo he dejado: una tirada y a casa.",
};

/** Textos de los avisos de la carga del duelo. */
const REGLAS_DE_CARGA = {
  minimo: CARGA_MINIMA,
  maximo: CARGA_MAXIMA,
  porDefecto: CARGA_POR_DEFECTO,
  tituloVacio: "¿CADA CUÁNTO EL DUELO?",
  mensajeVacio: `Casilla vacía. La he dejado en <b>${CARGA_POR_DEFECTO}</b> puntos de daño por duelo.`,
  tituloBajo: "ESO ES MUY POCO",
  mensajeBajo:
    "Con <b>0</b> el duelo saltaría sin parar. El mínimo es <b>1</b> punto de daño por duelo.",
};

/** El botón + / − que separa tu vida de la de la IA. */
function separarVidas(activado) {
  ajustes.vidasSeparadas = activado;
  buscar("#fila-vida-compartida").hidden = activado;
  buscar("#fila-vida-separada").hidden = !activado;

  if (activado) {
    const valor = buscar("#campo-vida").value;
    buscar("#campo-vida-jugador").value = valor;
    buscar("#campo-vida-ia").value = valor;
  } else {
    buscar("#campo-vida").value = buscar("#campo-vida-jugador").value;
  }
}

/** Conecta las tres casillas de vida a su validación. */
function conectarCasillasDeVida(alCambiar) {
  CASILLAS_DE_VIDA.forEach((selector) => {
    const casilla = buscar(selector);

    casilla.addEventListener("input", () => {
      vigilarMientrasEscribe(
        casilla,
        VIDA_MAXIMA,
        "¡EH, NO TE PASES!",
        `El límite de vida es <b>${VIDA_MAXIMA}</b>. Lo he dejado ahí por ti, que si no esto no acaba nunca.`,
      );
      alCambiar();
    });

    casilla.addEventListener("blur", () => {
      corregirAlSalir(casilla, REGLAS_DE_VIDA);
      alCambiar();
    });
  });
}

/** Conecta la casilla de la carga del duelo. */
function conectarCasillaDeCarga(alCambiar) {
  const casilla = buscar("#campo-carga");

  casilla.addEventListener("input", () => {
    vigilarMientrasEscribe(
      casilla,
      CARGA_MAXIMA,
      "DEMASIADO LEJOS",
      `El máximo son <b>${CARGA_MAXIMA}</b> puntos de daño por duelo. Más allá no llegarías a jugarlo nunca.`,
    );
    alCambiar();
  });

  casilla.addEventListener("blur", () => {
    corregirAlSalir(casilla, REGLAS_DE_CARGA);
    alCambiar();
  });
}

/** Botones de atajo con valores de vida prefijados. */
function conectarAtajosDeVida(alCambiar) {
  buscarTodos(".atajo-vida").forEach((atajo) => {
    atajo.addEventListener("click", () => {
      gestorAudio.efecto("clic");
      const valor = atajo.dataset.vida;

      if (ajustes.vidasSeparadas) {
        buscar("#campo-vida-jugador").value = valor;
        buscar("#campo-vida-ia").value = valor;
      } else {
        buscar("#campo-vida").value = valor;
      }

      alCambiar();
    });
  });
}

/**
 * Ficha de quién te vas a encontrar enfrente.
 * Se pinta desde aquí y no desde el HTML porque los datos del personaje ya
 * están en el catálogo: repetir el nombre y el lema en el HTML sería tener la
 * misma frase en dos sitios y que un día dejen de coincidir.
 */
export function pintarFichaDePersonaje(dificultad) {
  const ficha = buscar("#ficha-personaje");
  if (!ficha) return;

  const personaje = obtenerPersonaje(dificultad);

  ficha.style.setProperty("--color-avatar", personaje.color);
  ficha.innerHTML =
    `<span class="cara-mini">${personaje.caras.quieto}</span>` +
    `<span><b>${personaje.nombre}</b><span>${personaje.lema}</span></span>`;
}

/** Selector de dificultad. */
function conectarDificultad(alCambiar) {
  const botones = buscarTodos("#selector-dificultad .opcion");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      gestorAudio.efecto("clic");
      botones.forEach((otro) => otro.classList.remove("activa"));
      boton.classList.add("activa");
      ajustes.dificultad = boton.dataset.dificultad;
      pintarFichaDePersonaje(ajustes.dificultad);
      alCambiar();
    });
  });
}

/**
 * Deja el formulario listo.
 * Los valores por defecto los escribe el JS y no el atributo `value` del
 * HTML, para que solo haya una fuente de verdad: las constantes.
 */
export function conectarFormulario(alCambiar) {
  CASILLAS_DE_VIDA.forEach((selector) => {
    buscar(selector).value = VIDA_POR_DEFECTO;
  });
  buscar("#campo-carga").value = CARGA_POR_DEFECTO;

  conectarCasillasDeVida(alCambiar);
  conectarCasillaDeCarga(alCambiar);
  conectarAtajosDeVida(alCambiar);
  conectarDificultad(alCambiar);
  pintarFichaDePersonaje(ajustes.dificultad);

  buscar("#campo-nombre").addEventListener("input", alCambiar);
  buscar("#boton-separar").addEventListener("click", () => {
    gestorAudio.efecto("clic");
    separarVidas(true);
    alCambiar();
  });
  buscar("#boton-unir").addEventListener("click", () => {
    gestorAudio.efecto("clic");
    separarVidas(false);
    alCambiar();
  });
}
