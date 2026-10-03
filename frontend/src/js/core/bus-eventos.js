/**
 * Bus de eventos interno.
 *
 * Es el cable que separa la lógica del pintado: el motor de la partida
 * anuncia "ha pasado esto" y quien quiera pintarlo se suscribe. Ninguna clase
 * de lógica necesita conocer al que escucha.
 */
export class BusDeEventos {
  constructor() {
    this.oyentes = new Map();
  }

  /**
   * Registra una función para un tipo de evento.
   * @returns {Function} función para darse de baja
   */
  suscribir(tipo, funcion) {
    if (!this.oyentes.has(tipo)) this.oyentes.set(tipo, new Set());
    this.oyentes.get(tipo).add(funcion);

    return () => this.oyentes.get(tipo)?.delete(funcion);
  }

  /** Avisa a todos los suscritos a ese tipo. */
  emitir(tipo, datos) {
    const suscritos = this.oyentes.get(tipo);
    if (!suscritos) return;

    suscritos.forEach((funcion) => funcion(datos));
  }

  /** Borra todos los oyentes de un tipo, o todos los del bus. */
  limpiar(tipo) {
    if (tipo) this.oyentes.delete(tipo);
    else this.oyentes.clear();
  }
}

/** Nombres de los eventos, en un solo sitio para evitar erratas. */
export const EVENTOS = {
  RONDA_RESUELTA: "ronda-resuelta",
  CARGA_LLENA: "carga-llena",
  DUELO_TERMINADO: "duelo-terminado",
  PARTIDA_TERMINADA: "partida-terminada",
  PODER_OBTENIDO: "poder-obtenido",
  PODER_ACTIVADO: "poder-activado",
};

/** Instancia compartida por toda la aplicación. */
export const bus = new BusDeEventos();
