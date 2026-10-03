/**
 * Los poderes de un bando: los que tiene guardados y los que están activos.
 *
 * Guardado = ganado en un duelo, esperando a que lo activen.
 * Activo    = ya en marcha, con un contador de usos o de rondas.
 */
import { DURACION, obtenerPoder } from "../modules/catalogo-poderes.js";

export class MochilaDePoderes {
  constructor() {
    /** @type {string[]} identificadores de poderes sin usar */
    this.guardados = [];

    /** @type {Map<string, {usos:number, rondas:number}>} */
    this.activos = new Map();

    this.totalActivados = 0;
  }

  /** Mete un poder recién ganado en la mochila. */
  guardar(idPoder) {
    this.guardados.push(idPoder);
  }

  /** true si ese poder está guardado y se puede activar. */
  puedeActivar(idPoder) {
    return this.guardados.includes(idPoder);
  }

  /** Mete el poder en la lista de activos con sus contadores. */
  ponerEnMarcha(idPoder) {
    const poder = obtenerPoder(idPoder);

    this.activos.set(idPoder, {
      usos: poder.duracion === DURACION.UN_USO ? 1 : Infinity,
      rondas: poder.rondas ?? Infinity,
    });
  }

  /**
   * Saca el poder de la mochila y lo pone en marcha.
   * Los poderes inmediatos no se quedan en `activos`: su efecto ocurre una
   * sola vez, en el momento de activarlos.
   *
   * @returns {boolean} si se pudo activar
   */
  activar(idPoder) {
    const posicion = this.guardados.indexOf(idPoder);
    if (posicion === -1) return false;

    this.guardados.splice(posicion, 1);
    this.totalActivados++;

    if (obtenerPoder(idPoder).duracion === DURACION.INMEDIATO) return true;

    this.ponerEnMarcha(idPoder);
    return true;
  }

  /**
   * Pone un poder en marcha sin pasar por la mochila.
   * Lo usa el ESCUDO, que no se gana en un duelo: se concede solo, en el
   * momento en que el rival activa su pistola.
   */
  conceder(idPoder) {
    this.ponerEnMarcha(idPoder);
  }

  /** Retira un poder activo aunque le queden usos. */
  retirar(idPoder) {
    this.activos.delete(idPoder);
  }

  /** true si el poder está surtiendo efecto ahora mismo. */
  estaActivo(idPoder) {
    return this.activos.has(idPoder);
  }

  /** Gasta un uso del poder y lo retira si se le acaban. */
  consumir(idPoder) {
    const estado = this.activos.get(idPoder);
    if (!estado) return false;

    estado.usos--;
    if (estado.usos <= 0) this.activos.delete(idPoder);

    return true;
  }

  /**
   * Descuenta una ronda a los poderes que duran varias.
   * Se llama al final de cada ronda, desde el motor.
   * @returns {string[]} poderes que acaban de caducar
   */
  avanzarRonda() {
    const caducados = [];

    this.activos.forEach((estado, idPoder) => {
      if (estado.rondas === Infinity) return;

      estado.rondas--;
      if (estado.rondas <= 0) caducados.push(idPoder);
    });

    caducados.forEach((idPoder) => this.activos.delete(idPoder));
    return caducados;
  }

  /** Lista de identificadores activos, para pintarlos. */
  listaDeActivos() {
    return Array.from(this.activos.keys());
  }
}
