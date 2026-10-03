/**
 * Un bando de la partida: su vida y su umbral de música.
 *
 * No sabe nada del HTML. Se le puede pedir su estado, pero no se pinta solo.
 */
import { limitar, porcentaje } from "../utils/numeros.js";
import { UMBRALES_VIDA } from "../modules/constantes.js";

const UMBRAL_INICIAL = 100;

export class Combatiente {
  /**
   * @param {string} nombre     nombre visible
   * @param {number} vidaMaxima puntos de vida iniciales
   */
  constructor(nombre, vidaMaxima) {
    this.nombre = nombre;
    this.vidaMaxima = vidaMaxima;
    this.vida = vidaMaxima;

    /**
     * Marca de agua del umbral de vida: solo puede bajar.
     * Si un golpe cruza el 75 y el 50 de golpe, se queda con el 50 y avisa
     * una sola vez en vez de dos.
     */
    this.umbral = UMBRAL_INICIAL;
  }

  /** Porcentaje de vida actual, de 0 a 100. */
  porcentajeDeVida() {
    return porcentaje(this.vida, this.vidaMaxima);
  }

  /** true mientras le quede al menos un punto de vida. */
  estaVivo() {
    return this.vida > 0;
  }

  /** Resta vida sin bajar de cero. Devuelve el daño realmente aplicado. */
  recibirDano(cantidad) {
    const antes = this.vida;
    this.vida = Math.max(0, this.vida - cantidad);
    return antes - this.vida;
  }

  /** Suma vida sin pasar del máximo. Devuelve la curación aplicada. */
  curar(cantidad) {
    const antes = this.vida;
    this.vida = limitar(this.vida + cantidad, 0, this.vidaMaxima);
    return this.vida - antes;
  }

  /**
   * Comprueba si acaba de cruzar un umbral de vida hacia abajo.
   * @returns {number|null} el umbral recién cruzado, o null
   */
  cruzarUmbral() {
    const actual = this.porcentajeDeVida();
    const masBajoAlcanzado = UMBRALES_VIDA.filter((umbral) => actual <= umbral).pop();
    const nuevoUmbral = masBajoAlcanzado ?? UMBRAL_INICIAL;

    if (nuevoUmbral >= this.umbral) return null;

    this.umbral = nuevoUmbral;
    return nuevoUmbral;
  }
}
