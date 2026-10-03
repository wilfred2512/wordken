/**
 * La ficha de la partida en curso.
 *
 * Se crea entera de una vez y se tira entera al volver al menú. No existe
 * ningún "reiniciar" que ponga los campos a cero uno por uno, así que no
 * puede quedar basura de la partida anterior.
 */
import { Combatiente } from "./combatiente.js";
import { Cadena } from "./cadena.js";
import { MedidorDeCarga } from "./medidor-carga.js";
import { MochilaDePoderes } from "./mochila-poderes.js";
import { OponenteIA } from "./oponente-ia.js";
import { JUGADOR, IA, BANDOS, MAXIMO_HISTORIAL_VISIBLE } from "../modules/constantes.js";

/** Estadísticas en blanco de una partida recién empezada. */
function estadisticasVacias() {
  return {
    victorias: 0,
    derrotas: 0,
    empates: 0,
    mejorRacha: 0,
    danoHecho: 0,
    danoRecibido: 0,
    sellos: 0,
    bloqueos: 0,
    duelosGanados: 0,
    duelosPerdidos: 0,
    poderesUsados: 0,
  };
}

/** Veto en blanco: ninguna tirada prohibida. */
function vetoVacio() {
  return { tirada: null, rondas: 0 };
}

export class Partida {
  /**
   * @param {object} ajustes copia congelada de la configuración del menú
   */
  constructor(ajustes) {
    this.ajustes = ajustes;
    this.ronda = 1;

    this.combatiente = {
      [JUGADOR]: new Combatiente(ajustes.nombre, ajustes.vidaJugador),
      [IA]: new Combatiente("IA", ajustes.vidaIa),
    };

    this.cadena = { [JUGADOR]: new Cadena(), [IA]: new Cadena() };
    this.mochila = { [JUGADOR]: new MochilaDePoderes(), [IA]: new MochilaDePoderes() };
    this.veto = { [JUGADOR]: vetoVacio(), [IA]: vetoVacio() };

    this.medidor = new MedidorDeCarga(ajustes.cargaObjetivo);
    this.oponente = new OponenteIA(ajustes.dificultad);

    this.empatesSeguidos = 0;
    this.historial = [];
    this.tiradasDelJugador = [];

    this.terminada = false;
    this.ocupada = false;

    this.estadisticas = estadisticasVacias();
  }

  /** Atajo a los puntos de vida de un bando. */
  vidaDe(bando) {
    return this.combatiente[bando].vida;
  }

  /** La tirada prohibida a un bando esta ronda, o null. */
  tiradaVetadaDe(bando) {
    return this.veto[bando].rondas > 0 ? this.veto[bando].tirada : null;
  }

  /** Prohíbe una tirada a un bando durante N rondas. */
  vetarTirada(bando, tirada, rondas) {
    this.veto[bando] = { tirada, rondas };
  }

  /** Descuenta una ronda a los dos vetos y limpia los caducados. */
  avanzarVetos() {
    BANDOS.forEach((bando) => {
      if (this.veto[bando].rondas <= 0) return;

      this.veto[bando].rondas--;
      if (this.veto[bando].rondas === 0) this.veto[bando] = vetoVacio();
    });
  }

  /** Apunta la ronda en el historial y recorta el más antiguo. */
  apuntarEnHistorial(entrada) {
    this.historial.push(entrada);

    if (this.historial.length > MAXIMO_HISTORIAL_VISIBLE * 2) {
      this.historial.shift();
    }
  }

  /** La última ronda jugada, o null si es la primera. */
  ultimaRonda() {
    return this.historial.at(-1) ?? null;
  }

  /** Lo que la IA necesita saber para predecir. Solo lectura. */
  memoriaParaIa() {
    return {
      tiradasDelJugador: this.tiradasDelJugador,
      cadenaJugador: this.cadena[JUGADOR],
      ultimaRonda: this.ultimaRonda(),
    };
  }

  /** true si alguno de los dos se ha quedado sin vida. */
  hayAlguienSinVida() {
    return BANDOS.some((bando) => !this.combatiente[bando].estaVivo());
  }

  /** El bando que gana por muerte del otro. */
  ganadorPorVida() {
    return this.combatiente[IA].estaVivo() ? IA : JUGADOR;
  }
}
