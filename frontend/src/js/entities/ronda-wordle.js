/**
 * Una ronda del duelo de palabras.
 *
 * Guarda la palabra secreta, los intentos hechos y el estado del teclado.
 * No pinta nada: devuelve un informe de cada intento y la escena lo escenifica.
 */
import { evaluarIntento, actualizarEstadoTeclado, esAcierto } from "../modules/logica-wordle.js";
import { normalizar, esSoloLetras } from "../utils/texto.js";
import { elegirAlAzar } from "../utils/azar.js";
import { DICCIONARIO } from "../modules/diccionario-jergas.js";
import { INTENTOS_DE_DUELO, FALLOS_PARA_PISTA_EXTRA } from "../modules/constantes.js";

const LARGO_MINIMO = 4;
const LARGO_MAXIMO = 9;

/** Motivos por los que un intento puede rechazarse. */
export const RECHAZO = {
  VACIO: "vacio",
  LARGO: "largo",
  CARACTERES: "caracteres",
  REPETIDO: "repetido",
};

/** Elige una palabra del diccionario dentro del largo jugable. */
function elegirPalabra() {
  const jugables = DICCIONARIO.filter((entrada) => {
    const largo = normalizar(entrada.palabra).length;
    return largo >= LARGO_MINIMO && largo <= LARGO_MAXIMO;
  });

  return elegirAlAzar(jugables);
}

export class RondaWordle {
  constructor() {
    const elegida = elegirPalabra();

    this.palabraSecreta = normalizar(elegida.palabra);
    this.tipo = elegida.tipo;
    this.pista = elegida.pista;
    this.region = elegida.region;

    this.intentos = [];
    this.estadoTeclado = new Map();
    this.terminada = false;
    this.ganada = false;
  }

  /** Número de letras que hay que adivinar. */
  largo() {
    return this.palabraSecreta.length;
  }

  /** Intentos que todavía quedan. */
  intentosRestantes() {
    return INTENTOS_DE_DUELO - this.intentos.length;
  }

  /** Fallos que faltan para que se abra la pista extra. */
  fallosParaPistaExtra() {
    return Math.max(0, FALLOS_PARA_PISTA_EXTRA - this.intentos.length);
  }

  /** La pista extra se gana fallando; la normal se ve desde el principio. */
  pistaExtraVisible() {
    return this.fallosParaPistaExtra() === 0;
  }

  /**
   * La pista extra: la primera letra de la palabra.
   * Es información concreta y no depende del diccionario, así que no hay
   * riesgo de que una entrada se quede sin ella.
   */
  pistaExtra() {
    return `Empieza por «${this.palabraSecreta[0]}» y tiene ${this.largo()} letras.`;
  }

  /**
   * Comprueba que el intento sea admisible.
   * @returns {string|null} motivo del rechazo, o null si vale
   */
  revisarIntento(textoCrudo) {
    const intento = normalizar(textoCrudo);

    if (intento.length === 0) return RECHAZO.VACIO;
    if (intento.length !== this.largo()) return RECHAZO.LARGO;
    if (!esSoloLetras(intento)) return RECHAZO.CARACTERES;
    if (this.intentos.some((previo) => previo.palabra === intento)) return RECHAZO.REPETIDO;

    return null;
  }

  /**
   * Registra un intento válido y devuelve su informe.
   * @returns {{palabra:string, resultado:string[], acierto:boolean}}
   */
  registrarIntento(textoCrudo) {
    const palabra = normalizar(textoCrudo);
    const resultado = evaluarIntento(palabra, this.palabraSecreta);
    const acierto = esAcierto(resultado);

    this.intentos.push({ palabra, resultado });
    actualizarEstadoTeclado(this.estadoTeclado, palabra, resultado);

    if (acierto) {
      this.terminada = true;
      this.ganada = true;
    } else if (this.intentosRestantes() <= 0) {
      this.terminada = true;
    }

    return { palabra, resultado, acierto };
  }

  /** Se acabó el tiempo: derrota inmediata. */
  agotarTiempo() {
    this.terminada = true;
    this.ganada = false;
  }
}
