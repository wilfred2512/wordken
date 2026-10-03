/**
 * Los ajustes elegidos en el menú y su validación.
 *
 * Ojo: esto NO es la partida. Los ajustes sobreviven entre partidas; la
 * partida se crea y se destruye. Al empezar se hace una COPIA de este objeto,
 * para que tocar el menú no cambie una partida en curso.
 */
import { buscar } from "../utils/dom.js";
import { leerEntero } from "../utils/numeros.js";
import { mostrarAviso, marcarCasillaMal } from "../render/ventanas.js";
import {
  VIDA_MAXIMA,
  VIDA_MINIMA,
  VIDA_POR_DEFECTO,
  CARGA_MINIMA,
  CARGA_MAXIMA,
  CARGA_POR_DEFECTO,
} from "./constantes.js";

const LARGO_MAXIMO_DE_NOMBRE = 14;
const NOMBRE_POR_DEFECTO = "Jugador";

/** Objeto de ajustes vivo. Se lee y se escribe desde el menú. */
export const ajustes = {
  nombre: NOMBRE_POR_DEFECTO,
  dificultad: "normal",
  vidaJugador: VIDA_POR_DEFECTO,
  vidaIa: VIDA_POR_DEFECTO,
  vidasSeparadas: false,
  cargaObjetivo: CARGA_POR_DEFECTO,
};

/** Lee una casilla numérica respetando el 0 (que es falsy en JavaScript). */
function leerCasilla(selector, respaldo, minimo, maximo) {
  return leerEntero(buscar(selector).value, respaldo, minimo, maximo);
}

/** Vuelca los campos del formulario en el objeto de ajustes. */
export function leerFormulario() {
  const nombreEscrito = (buscar("#campo-nombre").value || NOMBRE_POR_DEFECTO)
    .trim()
    .slice(0, LARGO_MAXIMO_DE_NOMBRE);

  ajustes.nombre = nombreEscrito || NOMBRE_POR_DEFECTO;
  ajustes.cargaObjetivo = leerCasilla("#campo-carga", CARGA_POR_DEFECTO, CARGA_MINIMA, CARGA_MAXIMA);

  if (ajustes.vidasSeparadas) {
    ajustes.vidaJugador = leerCasilla("#campo-vida-jugador", VIDA_POR_DEFECTO, VIDA_MINIMA, VIDA_MAXIMA);
    ajustes.vidaIa = leerCasilla("#campo-vida-ia", VIDA_POR_DEFECTO, VIDA_MINIMA, VIDA_MAXIMA);
  } else {
    const compartida = leerCasilla("#campo-vida", VIDA_POR_DEFECTO, VIDA_MINIMA, VIDA_MAXIMA);
    ajustes.vidaJugador = compartida;
    ajustes.vidaIa = compartida;
  }

  return ajustes;
}

/** Copia congelada para arrancar una partida. */
export function fotoDeLosAjustes() {
  return { ...leerFormulario() };
}

/**
 * Mientras se escribe: solo filtra caracteres raros y corta por arriba.
 * No corrige valores bajos todavía, porque el jugador puede estar a mitad de
 * escribir "150" y haber tecleado solo el "1".
 */
export function vigilarMientrasEscribe(casilla, maximo, tituloAviso, mensajeAviso) {
  const soloDigitos = casilla.value.replace(/[^\d]/g, "");
  if (soloDigitos === "") return;

  const valor = Number.parseInt(soloDigitos, 10);

  if (valor > maximo) {
    casilla.value = maximo;
    marcarCasillaMal(casilla);
    mostrarAviso(tituloAviso, mensajeAviso);
  } else if (casilla.value !== soloDigitos) {
    casilla.value = soloDigitos;
  }
}

/**
 * Al salir de la casilla: tres situaciones distintas, tres respuestas.
 * Meter "vacío" y "el usuario escribió 1" en el mismo saco fue un error real
 * de una versión anterior, y por eso están separados.
 */
export function corregirAlSalir(casilla, reglas) {
  const valor = Number.parseInt(casilla.value, 10);

  if (Number.isNaN(valor)) {
    casilla.value = reglas.porDefecto;
    marcarCasillaMal(casilla);
    mostrarAviso(reglas.tituloVacio, reglas.mensajeVacio);
    return;
  }

  if (valor < reglas.minimo) {
    casilla.value = reglas.minimo;
    marcarCasillaMal(casilla);
    mostrarAviso(reglas.tituloBajo, reglas.mensajeBajo);
    return;
  }

  casilla.value = Math.min(valor, reglas.maximo);
}
