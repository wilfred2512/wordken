/**
 * El rival controlado por la máquina.
 *
 * Calcula, no pinta: en toda la clase no aparece ni un `document`. Esa es la
 * prueba de que la frontera entre lógica y renderizado está bien puesta.
 *
 * La IA tampoco hace trampas: el motor le pide la tirada ANTES de apuntar la
 * del jugador en el historial, así que decide a ciegas.
 */
import { ESTRATEGIAS, tiradaAlAzar } from "../modules/estrategias-ia.js";
import { estrategiaDe } from "../modules/personajes-ia.js";
import { TIRADAS, TIRADA_PISTOLA, TIRADA_ESCUDO } from "../modules/reglas-tiradas.js";
import { elegirAlAzar, ocurreCon } from "../utils/azar.js";

/** Probabilidad de que la IA gaste un poder guardado en una ronda dada. */
const PROBABILIDAD_DE_USAR_PODER = 0.45;

/** Probabilidad de que saque el escudo, sabiendo que solo para la pistola. */
const PROBABILIDAD_DE_ESCUDAR = 0.4;

/** Probabilidad de disparar aun teniendo el escudo del rival enfrente. */
const PROBABILIDAD_DE_DISPARAR_BAJO_ESCUDO = 0.35;

export class OponenteIA {
  /**
   * @param {"facil"|"normal"|"dificil"} dificultad
   */
  constructor(dificultad) {
    this.dificultad = dificultad;
    this.forzarTirada = null; // gancho de pruebas desde la consola

    /**
     * Lo que el modelo de lenguaje ha contestado para la ronda que viene,
     * o null. Lo deja ahí modules/mente-rival.js mientras el jugador decide,
     * y se consume al elegir tirada. Ver `consumirConsejo`.
     */
    this.consejo = null;
  }

  /**
   * Coge el consejo del modelo y vacía el cajón.
   * Se vacía siempre, aunque la tirada no sirva: un consejo de la ronda
   * pasada aplicado a la siguiente sería peor que no tener ninguno.
   */
  consumirConsejo() {
    const guardado = this.consejo;
    this.consejo = null;
    return guardado;
  }

  /**
   * La estrategia que toca según la dificultad.
   * LA MENTE no tiene estrategia propia: mueve con la difícil mientras el
   * modelo de lenguaje responde, y si no hay servidor se queda con ella.
   */
  estrategia() {
    return ESTRATEGIAS[estrategiaDe(this.dificultad)] ?? ESTRATEGIAS.normal;
  }

  /**
   * Elige tirada y respeta el veto de esa ronda.
   * @param {object} memoria    historial y cadena del jugador
   * @param {string|null} vetada tirada prohibida esta ronda
   * @param {string|null} sugerida lo que dijo el modelo de lenguaje, si llegó
   *   a tiempo. Se comprueba que sea una tirada de verdad, porque lo que
   *   devuelve un modelo es texto libre: si contestara "lagarto", la ronda se
   *   quedaría sin carta que jugar.
   */
  elegirTirada(memoria, vetada, sugerida) {
    if (this.forzarTirada) return this.forzarTirada(memoria);

    const valeLaSugerida = TIRADAS.includes(sugerida) && sugerida !== vetada;
    const tirada = valeLaSugerida ? sugerida : this.estrategia()(memoria);
    if (!vetada || tirada !== vetada) return tirada;

    return elegirAlAzar(TIRADAS.filter((otra) => otra !== vetada));
  }

  /**
   * ¿Dispara la pistola esta ronda?
   * Con el escudo del rival puesto, disparar es una apuesta: si acierta la
   * ronda, el tiro se pierde y encima gana él. Por eso la IA se lo piensa.
   * Sin escudo enfrente, dispara sin dudar.
   */
  debeDisparar(mochilaRival) {
    if (!mochilaRival.estaActivo(TIRADA_ESCUDO)) return true;
    return ocurreCon(PROBABILIDAD_DE_DISPARAR_BAJO_ESCUDO);
  }

  /**
   * Elige tirada teniendo en cuenta las cartas especiales que tenga en juego.
   * El escudo lo saca a veces, nunca siempre: si fuera predecible, el jugador
   * sabría exactamente cuándo NO disparar.
   */
  elegirTiradaConPoderes(memoria, vetada, mochilaPropia, mochilaRival, sugerida) {
    // El gancho de pruebas manda sobre todo lo demás: si alguien ha forzado
    // la tirada desde la consola, ni pistola ni escudo la pisan.
    if (this.forzarTirada) return this.elegirTirada(memoria, vetada);

    if (mochilaPropia.estaActivo(TIRADA_PISTOLA) && this.debeDisparar(mochilaRival)) {
      return TIRADA_PISTOLA;
    }

    if (mochilaPropia.estaActivo(TIRADA_ESCUDO) && ocurreCon(PROBABILIDAD_DE_ESCUDAR)) {
      return TIRADA_ESCUDO;
    }

    return this.elegirTirada(memoria, vetada, sugerida);
  }

  /**
   * Decide si activa uno de sus poderes guardados y cuál.
   * @returns {string|null} identificador del poder, o null
   */
  elegirPoderParaActivar(mochila) {
    if (mochila.guardados.length === 0) return null;
    if (!ocurreCon(PROBABILIDAD_DE_USAR_PODER)) return null;

    return elegirAlAzar(mochila.guardados);
  }

  /** Segunda tirada para el poder DOBLE O NADA. */
  elegirSegundaTirada(primera) {
    const alternativas = TIRADAS.filter((tirada) => tirada !== primera);
    return ocurreCon(0.5) ? elegirAlAzar(alternativas) : tiradaAlAzar();
  }
}
