/**
 * Entrada de teclado, aislada del resto de la lógica.
 *
 * Solo hay UN `keydown` permanente en todo el proyecto, y está aquí. Las
 * escenas no escuchan al navegador: le dicen a este módulo "mientras yo esté
 * activa, manda las teclas a esta función".
 *
 * (Los otros dos `keydown` del proyecto son de un solo disparo, `{once:true}`,
 * y sirven únicamente para desbloquear el audio en el primer gesto: no son
 * entrada de juego.)
 *
 * Es importante que el teclado pase por el mismo sitio que los botones,
 * porque las teclas se saltan el atributo `disabled` de la mano: si el
 * cerrojo de la ronda no se comprobara también aquí, tres pulsaciones
 * rápidas lanzarían tres rondas solapadas.
 */
export class EntradaDeTeclado {
  constructor() {
    this.manejadorActual = null;
    this.atajosGlobales = new Map();
    this.conectado = false;
  }

  /** Engancha el único escuchador del proyecto. */
  conectar() {
    if (this.conectado) return;

    this.conectado = true;
    document.addEventListener("keydown", (evento) => this.repartir(evento));
  }

  /** Atajo que funciona en cualquier pantalla (Escape, silenciar...). */
  registrarAtajoGlobal(tecla, funcion) {
    this.atajosGlobales.set(tecla.toLowerCase(), funcion);
  }

  /** La escena activa reclama las teclas normales. */
  usar(manejador) {
    this.manejadorActual = manejador;
  }

  /** La escena se va: deja de recibir teclas. */
  soltar() {
    this.manejadorActual = null;
  }

  /** Decide si la tecla es un atajo global o va a la escena activa. */
  repartir(evento) {
    const tecla = evento.key.toLowerCase();
    const atajo = this.atajosGlobales.get(tecla);

    if (atajo) {
      atajo(evento);
      return;
    }

    if (this.manejadorActual) this.manejadorActual(evento);
  }
}

export const entradaDeTeclado = new EntradaDeTeclado();

/** Teclas numéricas que eligen tirada en la partida. */
export const TECLAS_DE_TIRADA = {
  1: "piedra",
  2: "papel",
  3: "tijera",
  4: "pistola",
  5: "escudo",
};
