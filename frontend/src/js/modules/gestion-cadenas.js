/**
 * Todo lo que le pasa a las cadenas cuando alguien gana una ronda.
 *
 * Devuelve carteles en vez de pintarlos: la escena decide cuándo y cómo se
 * enseñan, y esta capa se queda siendo lógica pura.
 */
import { ETIQUETA } from "./reglas-tiradas.js";
import { JUGADOR, SELLOS_PARA_CADENA_MAXIMA, SUBRACHA_PARA_TRIPLE } from "./constantes.js";

const NIVEL_TRIPLE = 3;
const NIVEL_DOBLE = 2;

/** Cartel de la pila de anuncios. */
function cartel(clase, titulo, subtitulo) {
  return { clase, titulo, subtitulo };
}

/**
 * Sella la tirada si acaba de completarse la segunda victoria seguida con
 * ella. Se sella en ese instante y no al romper la cadena: así se puede
 * cambiar de tirada, encadenar dos con la nueva y sellarla también, sin
 * perder la racha por el camino.
 */
function intentarSellar(cadena, tiradaGanadora, nivel) {
  const esMomentoDeSellar = nivel === NIVEL_TRIPLE && cadena.longitudSubRacha() === SUBRACHA_PARA_TRIPLE;
  if (!esMomentoDeSellar) return null;

  cadena.sellar(tiradaGanadora);
  return tiradaGanadora;
}

/** Carteles de subida de nivel de cadena y de sello. */
function cartelesDeCadena(datos) {
  const { nivel, nivelAnterior, tiradaSellada, tiradaGanadora, sellos, esCadenaMaxima } = datos;
  const anuncios = [];

  if (nivel > nivelAnterior && nivel === NIVEL_TRIPLE) {
    const detalle = tiradaSellada && !esCadenaMaxima
      ? `daño x3 · sello ${ETIQUETA[tiradaSellada]} (${sellos}/${SELLOS_PARA_CADENA_MAXIMA})`
      : `daño x3 · ${ETIQUETA[tiradaGanadora]}`;
    anuncios.push(cartel("cf-nivel3", "¡TRIPLE CADENA!", detalle));
  } else if (nivel > nivelAnterior && nivel === NIVEL_DOBLE) {
    anuncios.push(cartel("cf-nivel2", "¡DOBLE CADENA!", "daño x2"));
  } else if (tiradaSellada && !esCadenaMaxima) {
    anuncios.push(
      cartel("cf-sello", `SELLO: ${ETIQUETA[tiradaSellada]}`, `${sellos} de ${SELLOS_PARA_CADENA_MAXIMA} sellos`),
    );
  }

  return anuncios;
}

/**
 * Hace crecer la cadena del ganador y sella si toca.
 * @returns {{nivel:number, tiradaSellada:string|null, esCadenaMaxima:boolean, anuncios:object[]}}
 */
export function crecerCadena(cadena, tiradaGanadora) {
  const nivelAnterior = cadena.nivel();

  cadena.registrarVictoria(tiradaGanadora);

  const nivel = cadena.nivel();
  const tiradaSellada = intentarSellar(cadena, tiradaGanadora, nivel);
  const esCadenaMaxima = cadena.tieneCadenaMaxima();

  const anuncios = cartelesDeCadena({
    nivel,
    nivelAnterior,
    tiradaSellada,
    tiradaGanadora,
    sellos: cadena.sellos.length,
    esCadenaMaxima,
  });

  return { nivel, tiradaSellada, esCadenaMaxima, anuncios };
}

/**
 * Rompe la cadena del perdedor y devuelve el cartel si había algo que romper.
 * @returns {object[]} lista de anuncios (vacía o con uno)
 */
export function romperCadena(cadena, perdedor) {
  if (cadena.racha === 0) return [];
  if (!cadena.romper()) return [];

  const subtitulo = perdedor === JUGADOR ? "tu racha se acabó" : "le has cortado la racha";
  return [cartel("cf-rota", "CADENA ROTA", subtitulo)];
}
