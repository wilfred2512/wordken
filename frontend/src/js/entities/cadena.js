/**
 * La cadena de victorias de un bando.
 *
 * Principio de diseño: se guardan HECHOS (qué tiradas ganaron, en qué orden)
 * y se derivan las CONCLUSIONES (el nivel, la sub-racha). Si se guardara una
 * variable `nivel`, habría que acordarse de actualizarla en cada punto donde
 * cambia la cadena; olvidarlo en uno solo daría una insignia que dice x3
 * mientras el daño es x2. Calculándolo, es imposible que se contradigan.
 */
import { RACHA_PARA_DOBLE, SUBRACHA_PARA_TRIPLE, SELLOS_PARA_CADENA_MAXIMA } from "../modules/constantes.js";

const NIVEL_NORMAL = 1;
const NIVEL_DOBLE = 2;
const NIVEL_TRIPLE = 3;

export class Cadena {
  constructor() {
    this.racha = 0;
    this.tiradas = [];
    this.haSelladoAlgo = false;
    this.sellos = [];
  }

  /** La tirada con la que se ganó la última ronda, o null. */
  ultimaTirada() {
    return this.tiradas.at(-1) ?? null;
  }

  /**
   * Victorias seguidas Y FINALES con la misma tirada.
   *   [tijera, papel, papel] -> 2   (las dos últimas son papel)
   *   [papel, papel, tijera] -> 1   (la sub-racha se cortó)
   * Es lo que decide si una cadena es doble o triple.
   */
  longitudSubRacha() {
    const ultima = this.ultimaTirada();
    if (ultima === null) return 0;

    let cuenta = 0;
    for (let i = this.tiradas.length - 1; i >= 0 && this.tiradas[i] === ultima; i--) {
      cuenta++;
    }
    return cuenta;
  }

  /**
   * Nivel actual: 1 normal, 2 doble, 3 triple.
   * Mira SOLO la sub-racha final, no la cadena entera: por eso
   * [tijera, papel, papel] es triple aunque empezara mezclada.
   */
  nivel() {
    if (this.racha < RACHA_PARA_DOBLE) return NIVEL_NORMAL;
    return this.longitudSubRacha() >= SUBRACHA_PARA_TRIPLE ? NIVEL_TRIPLE : NIVEL_DOBLE;
  }

  /** Apunta una victoria conseguida con esa tirada. */
  registrarVictoria(tirada) {
    this.racha++;
    this.tiradas.push(tirada);
  }

  /**
   * Sella una tirada. Volver a sellar una ya sellada reinicia la serie con
   * solo esa: así no se puede llegar a la cadena máxima repitiendo una sola.
   */
  sellar(tirada) {
    this.haSelladoAlgo = true;

    if (this.sellos.includes(tirada)) this.sellos = [tirada];
    else this.sellos.push(tirada);
  }

  /** Añade un sello sin pasar por una triple cadena (poder GANZÚA). */
  sellarPorPoder(tirada) {
    if (this.sellos.includes(tirada)) return false;

    this.sellos.push(tirada);
    this.haSelladoAlgo = true;
    return true;
  }

  /** true cuando están selladas las tres tiradas. */
  tieneCadenaMaxima() {
    return this.sellos.length >= SELLOS_PARA_CADENA_MAXIMA;
  }

  /**
   * Rompe la cadena. Si no llegó a sellar nada, se pierden también los
   * sellos acumulados.
   * @returns {boolean} si había una cadena de 2 o más que anunciar
   */
  romper() {
    const teniaCadena = this.racha >= RACHA_PARA_DOBLE;

    if (!this.haSelladoAlgo) this.sellos = [];

    this.racha = 0;
    this.tiradas = [];
    this.haSelladoAlgo = false;

    return teniaCadena;
  }
}
