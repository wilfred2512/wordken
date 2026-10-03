/**
 * Pitidos generados por código con la Web Audio API.
 *
 * Sirven de respaldo cuando un efecto no tiene archivo. Cada melodía es una
 * lista de notas [frecuencia, duración en segundos, forma de onda, volumen].
 *
 * Ventaja para el proyecto: el juego suena desde el primer arranque sin tener
 * que buscar veinte archivos de sonido, y pesa cero bytes.
 */

const MELODIAS = {
  clic: [[520, 0.05, "square", 0.12]],
  elegir: [[660, 0.07, "square", 0.14]],
  ganar: [[700, 0.07, "square", 0.16], [980, 0.1, "square", 0.16]],
  perder: [[300, 0.1, "sawtooth", 0.14], [180, 0.16, "sawtooth", 0.14]],
  empate: [[420, 0.09, "triangle", 0.12]],
  sello: [[740, 0.07, "square", 0.16], [980, 0.07, "square", 0.16], [1240, 0.16, "square", 0.16]],
  maxima: [
    [520, 0.09, "square", 0.2],
    [700, 0.09, "square", 0.2],
    [980, 0.09, "square", 0.2],
    [1320, 0.35, "square", 0.2],
  ],
  bloqueo: [[240, 0.12, "sawtooth", 0.18], [160, 0.22, "sawtooth", 0.18]],
  umbral: [[420, 0.1, "triangle", 0.16], [300, 0.22, "triangle", 0.16]],

  cargaSube: [[880, 0.04, "square", 0.1]],
  cargaLlena: [
    [660, 0.08, "square", 0.18],
    [880, 0.08, "square", 0.18],
    [1320, 0.22, "square", 0.2],
  ],

  tecla: [[440, 0.03, "square", 0.08]],
  letraCorrecta: [[900, 0.07, "square", 0.15]],
  letraPosicion: [[620, 0.07, "triangle", 0.13]],
  letraIncorrecta: [[220, 0.09, "sawtooth", 0.12]],

  poderGanado: [
    [520, 0.07, "square", 0.18],
    [780, 0.07, "square", 0.18],
    [1040, 0.09, "square", 0.18],
    [1560, 0.25, "square", 0.2],
  ],
  poderActivado: [[980, 0.06, "square", 0.16], [1480, 0.14, "square", 0.16]],
  pistola: [[1600, 0.03, "square", 0.22], [400, 0.14, "sawtooth", 0.2]],
  escudo: [[260, 0.05, "square", 0.2], [880, 0.09, "triangle", 0.18], [1320, 0.18, "triangle", 0.14]],

  pausa: [[660, 0.07, "triangle", 0.16], [440, 0.12, "triangle", 0.14], [330, 0.2, "triangle", 0.12]],
  reanudar: [[330, 0.07, "triangle", 0.14], [520, 0.07, "triangle", 0.16], [780, 0.16, "triangle", 0.16]],

  tiempoCorto: [[1200, 0.04, "square", 0.14]],
  tiempoAgotado: [[420, 0.14, "sawtooth", 0.18], [260, 0.3, "sawtooth", 0.18]],

  // --- Un sonido por GESTO de poder ---
  // Cada habilidad especial suena distinta, igual que se ve distinta. Los
  // nombres son los mismos `gesto` del catálogo de poderes.
  disparo: [[1800, 0.03, "square", 0.22], [520, 0.07, "sawtooth", 0.2], [200, 0.2, "sawtooth", 0.18]],
  muro: [[220, 0.06, "square", 0.22], [660, 0.08, "triangle", 0.18], [1100, 0.22, "triangle", 0.14]],
  dados: [[700, 0.04, "square", 0.14], [500, 0.04, "square", 0.14], [900, 0.04, "square", 0.14], [1300, 0.2, "square", 0.2]],
  reflejo: [[1400, 0.06, "triangle", 0.18], [980, 0.06, "triangle", 0.16], [1700, 0.24, "triangle", 0.18]],
  llave: [[620, 0.05, "square", 0.16], [880, 0.05, "square", 0.16], [1480, 0.18, "square", 0.2]],
  colmillos: [[300, 0.07, "sawtooth", 0.2], [240, 0.09, "sawtooth", 0.18], [760, 0.2, "triangle", 0.16]],
  impacto: [[160, 0.08, "square", 0.24], [120, 0.16, "sawtooth", 0.22], [900, 0.1, "square", 0.14]],
  cerrojo: [[420, 0.05, "square", 0.18], [280, 0.06, "square", 0.18], [180, 0.22, "sawtooth", 0.2]],
  giro: [[600, 0.03, "square", 0.12], [800, 0.03, "square", 0.13], [1000, 0.03, "square", 0.14], [1200, 0.03, "square", 0.15], [1600, 0.24, "square", 0.2]],
  explosion: [[90, 0.06, "sawtooth", 0.28], [60, 0.12, "square", 0.26], [45, 0.34, "sawtooth", 0.24]],
  brindis: [[1760, 0.04, "triangle", 0.18], [2100, 0.05, "triangle", 0.16], [1320, 0.08, "sine", 0.18], [1760, 0.22, "sine", 0.16]],

  // --- Los impactos y el jackpot ---
  silbido: [[400, 0.04, "sine", 0.1], [700, 0.04, "sine", 0.1], [1100, 0.05, "sine", 0.1]],
  rodillo: [[900, 0.02, "square", 0.08]],
  parada: [[220, 0.05, "square", 0.22], [440, 0.12, "square", 0.18]],
  moneda: [[1975, 0.04, "square", 0.12], [2637, 0.14, "square", 0.12]],
  jackpot: [
    [523, 0.08, "square", 0.2], [659, 0.08, "square", 0.2], [784, 0.08, "square", 0.2],
    [1047, 0.08, "square", 0.2], [1319, 0.08, "square", 0.2], [1568, 0.4, "square", 0.22],
  ],
};

export class Sintetizador {
  constructor() {
    this.contexto = null;
  }

  /** Crea el contexto de audio la primera vez que hace falta. */
  asegurarContexto() {
    if (!this.contexto) {
      const Constructor = window.AudioContext ?? window.webkitAudioContext;
      this.contexto = new Constructor();
    }

    if (this.contexto.state === "suspended") this.contexto.resume();
    return this.contexto;
  }

  /** Programa una nota en el instante indicado. */
  programarNota(contexto, nota, momento) {
    const [frecuencia, duracion, forma, volumen] = nota;

    const oscilador = contexto.createOscillator();
    const ganancia = contexto.createGain();

    oscilador.type = forma;
    oscilador.frequency.value = frecuencia;
    ganancia.gain.setValueAtTime(volumen, momento);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, momento + duracion);

    oscilador.connect(ganancia);
    ganancia.connect(contexto.destination);
    oscilador.start(momento);
    oscilador.stop(momento + duracion);
  }

  /** Reproduce la melodía asociada a un nombre de efecto. */
  reproducir(nombreEfecto) {
    const melodia = MELODIAS[nombreEfecto];
    if (!melodia) return;

    try {
      const contexto = this.asegurarContexto();
      let momento = contexto.currentTime;

      melodia.forEach((nota) => {
        this.programarNota(contexto, nota, momento);
        momento += nota[1] * 0.85;
      });
    } catch (error) {
      // Sin Web Audio disponible el juego sigue, simplemente en silencio.
    }
  }
}

export const sintetizador = new Sintetizador();
