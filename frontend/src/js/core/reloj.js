/**
 * Control del tiempo: cuenta atrás del duelo de palabras.
 *
 * Usa requestAnimationFrame y no setInterval porque el navegador frena los
 * intervalos de las pestañas en segundo plano: con setInterval, cambiar de
 * pestaña regalaría segundos al jugador.
 */
export class CuentaAtras {
  /**
   * @param {number} duracionMs  tiempo total
   * @param {(restanteMs:number, fraccion:number) => void} alLatir
   * @param {() => void} alAgotarse
   */
  constructor(duracionMs, alLatir, alAgotarse) {
    this.duracionMs = duracionMs;
    this.alLatir = alLatir;
    this.alAgotarse = alAgotarse;
    this.identificadorFotograma = null;
    this.momentoFinal = 0;
    this.corriendo = false;
  }

  /** Arranca (o reinicia) la cuenta. */
  arrancar() {
    this.detener();
    this.momentoFinal = performance.now() + this.duracionMs;
    this.corriendo = true;
    this.latir();
  }

  /** Un fotograma de la cuenta. Se llama a sí misma hasta llegar a cero. */
  latir() {
    if (!this.corriendo) return;

    const restanteMs = Math.max(0, this.momentoFinal - performance.now());
    this.alLatir(restanteMs, restanteMs / this.duracionMs);

    if (restanteMs <= 0) {
      this.corriendo = false;
      this.alAgotarse();
      return;
    }

    this.identificadorFotograma = requestAnimationFrame(() => this.latir());
  }

  /** Para la cuenta sin avisar de que se agotó. */
  detener() {
    this.corriendo = false;
    if (this.identificadorFotograma === null) return;

    cancelAnimationFrame(this.identificadorFotograma);
    this.identificadorFotograma = null;
  }

  /** Regala tiempo extra, por ejemplo como premio por acertar letras. */
  sumarTiempo(milisegundos) {
    this.momentoFinal += milisegundos;
  }
}
