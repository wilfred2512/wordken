/**
 * Catálogo de música y efectos, y ajustes del sonido.
 *
 * Una cadena vacía ("") significa "esta pista no suena". El juego funciona
 * igual sin ningún archivo de audio: los efectos caen en los pitidos
 * sintetizados y la música simplemente no se oye.
 *
 * PRIORIDAD de la música cuando varias podrían sonar a la vez:
 *   duelo > cadenaMaxima > cadenaTriple > cadenaDoble > vida25 > vida50 >
 *   vida75 > partida
 */

const CARPETA = "src/assets/audios";

export const MUSICA = {
  menu: `${CARPETA}/menu.mp3`,
  partida: `${CARPETA}/partida.mp3`,

  cadenaDoble: `${CARPETA}/cadena-doble.mp3`,
  cadenaTriple: `${CARPETA}/cadena-triple.mp3`,
  cadenaMaxima: `${CARPETA}/cadena-maxima.mp3`,

  vida75: `${CARPETA}/vida-75.mp3`,
  vida50: `${CARPETA}/vida-50.mp3`,
  vida25: `${CARPETA}/vida-25.mp3`,

  duelo: `${CARPETA}/duelo-wordle.mp3`,

  victoria: `${CARPETA}/victoria.mp3`,
  derrota: `${CARPETA}/derrota.mp3`,
};

/**
 * LA CARPETA DE RISAS. Cada vez que toca reírse suena una de estas al azar,
 * y nunca la misma dos veces seguidas.
 *
 * Para añadir una risa: mete el .mp3 en `assets/audios/risas/` (nombre en
 * minúsculas y con guiones) y escribe aquí su nombre sin la extensión. Hay que
 * apuntarla a mano porque un navegador no puede mirar qué hay en una carpeta.
 */
const NOMBRES_DE_RISAS = ["gerson", "brook", "luffy", "nelson", "patricio"];

export const RISAS = NOMBRES_DE_RISAS.map((nombre) => `${CARPETA}/risas/${nombre}.mp3`);

/**
 * Efectos puntuales con archivo propio. Los que se quedan vacíos suenan como
 * pitidos generados por código (ver sintetizador.js), así que el juego no se
 * queda mudo aunque falten los archivos.
 *
 * Un efecto puede ser una ruta o una LISTA de rutas. Con una lista, el gestor
 * de audio escoge una al azar cada vez (ver `efecto` en gestor-audio.js).
 */
export const EFECTOS_SONIDO = {
  clic: "",
  elegir: "",
  ganar: "",
  perder: "",
  empate: "",
  sello: "",
  maxima: "",
  bloqueo: "",
  umbral: "",
  cargaSube: "",
  cargaLlena: "",
  tecla: "",
  letraCorrecta: "",
  letraPosicion: "",
  letraIncorrecta: "",
  poderGanado: "",
  poderActivado: "",
  pistola: "",
  escudo: "",
  pausa: "",
  reanudar: "",
  tiempoCorto: "",
  tiempoAgotado: "",

  /* Un sonido por gesto de poder: son los mismos nombres que usa el catálogo
     de poderes, así que la fanfarria no necesita ninguna tabla de conversión. */
  disparo: "",
  muro: "",
  dados: "",
  reflejo: "",
  llave: "",
  colmillos: "",
  impacto: "",
  cerrojo: "",
  giro: "",
  explosion: "",
  brindis: "",

  /* Los de los impactos y el jackpot: vacíos a propósito, salen del sintetizador. */
  silbido: "",
  rodillo: "",
  parada: "",
  moneda: "",
  jackpot: "",

  /** La risa del rival cuando te roba una bonificación: una al azar. */
  poderRobado: RISAS,
};

export const AJUSTES_AUDIO = {
  volumenMusica: 0.55,
  volumenEfectos: 0.7,
  duracionFundidoMs: 600,
  musicaEnBucle: true,

  /** ¿La cadena de la IA también cambia la música? */
  musicaCadenaParaIa: true,

  usarPitidosDeRespaldo: true,
};

/** Pasos del fundido cruzado, en milisegundos. */
export const PASO_DE_FUNDIDO_MS = 40;
