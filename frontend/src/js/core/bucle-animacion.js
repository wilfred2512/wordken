/**
 * Bucle principal de animación.
 *
 * Solo corre mientras alguien lo necesita. Cuando la última tarea termina, el
 * bucle se apaga y deja de gastar batería: un requestAnimationFrame eterno
 * con el lienzo vacío consumiría igual que uno lleno de partículas.
 */
export class BucleDeAnimacion {
  constructor() {
    this.tareas = new Set();
    this.corriendo = false;
    this.momentoAnterior = 0;
  }

  /**
   * Añade una tarea al bucle y lo arranca si estaba parado.
   * @param {(deltaMs:number) => boolean} tarea devuelve false cuando termina
   */
  anadir(tarea) {
    this.tareas.add(tarea);
    this.arrancar();
  }

  /** Quita una tarea a mano. */
  quitar(tarea) {
    this.tareas.delete(tarea);
  }

  /** Arranca el bucle si no estaba ya en marcha. */
  arrancar() {
    if (this.corriendo) return;

    this.corriendo = true;
    this.momentoAnterior = performance.now();
    requestAnimationFrame((momento) => this.avanzar(momento));
  }

  /** Un fotograma: avanza todas las tareas y borra las que han terminado. */
  avanzar(momento) {
    const deltaMs = momento - this.momentoAnterior;
    this.momentoAnterior = momento;

    this.tareas.forEach((tarea) => {
      if (tarea(deltaMs) === false) this.tareas.delete(tarea);
    });

    if (this.tareas.size === 0) {
      this.corriendo = false;
      return;
    }

    requestAnimationFrame((siguiente) => this.avanzar(siguiente));
  }
}

/** Instancia compartida por los efectos visuales. */
export const bucleDeAnimacion = new BucleDeAnimacion();
