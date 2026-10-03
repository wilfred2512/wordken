/**
 * El círculo de carga que desbloquea el duelo de palabras.
 *
 * Se llena únicamente con el daño que el JUGADOR le hace a la IA. Los golpes
 * que recibe no cuentan: el duelo es un premio por pegar, no un consuelo por
 * recibir.
 */
export class MedidorDeCarga {
  /**
   * @param {number} objetivo puntos de daño necesarios para llenarlo
   */
  constructor(objetivo) {
    this.objetivo = objetivo;
    this.carga = 0;
    this.duelosDisponibles = 0;
    this.duelosJugados = 0;
  }

  /**
   * Suma daño al medidor. Cada vez que se completa el objetivo se acumula un
   * duelo disponible, de modo que un golpe enorme puede desbloquear dos.
   *
   * @param {number} dano
   * @returns {number} cuántos duelos se acaban de desbloquear
   */
  sumarDano(dano) {
    if (dano <= 0) return 0;

    this.carga += dano;

    const desbloqueados = Math.floor(this.carga / this.objetivo);
    if (desbloqueados > 0) {
      this.carga -= desbloqueados * this.objetivo;
      this.duelosDisponibles += desbloqueados;
    }

    return desbloqueados;
  }

  /** Fracción del círculo que hay que pintar, de 0 a 1. */
  fraccion() {
    return Math.min(1, this.carga / this.objetivo);
  }

  /** true si hay al menos un duelo esperando. */
  hayDueloDisponible() {
    return this.duelosDisponibles > 0;
  }

  /**
   * Consume un duelo. Devuelve false si no había ninguno, para que la escena
   * no abra el minijuego por error.
   */
  consumirDuelo() {
    if (!this.hayDueloDisponible()) return false;

    this.duelosDisponibles--;
    this.duelosJugados++;
    return true;
  }
}
