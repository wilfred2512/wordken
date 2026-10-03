/**
 * Constantes de configuración del juego.
 *
 * Todos los números que se pueden tocar para reequilibrar la partida están
 * aquí. Ninguna otra parte del código escribe un número suelto.
 */

/** Nombre provisional del juego. El equipo todavía no lo ha decidido. */
export const NOMBRE_JUEGO = "WordKen";

/** Lema que aparece bajo el título del menú. */
export const LEMA_JUEGO = "rompe la racha · llena el círculo · gana el duelo";

/** Los dos bandos. Se usan como claves en todo el estado. */
export const JUGADOR = "jugador";
export const IA = "ia";
export const BANDOS = [JUGADOR, IA];

/** Devuelve el bando contrario. */
export function bandoContrario(bando) {
  return bando === JUGADOR ? IA : JUGADOR;
}

/* --- vida ---------------------------------------------------------------- */
export const VIDA_MAXIMA = 1000;
export const VIDA_MINIMA = 1;
export const VIDA_POR_DEFECTO = 20;

/**
 * Daño base fijo en 1, a propósito.
 * Si el daño creciera con la vida, subir la vida no alargaría la partida:
 * harían falta los mismos golpes. Con daño fijo, más vida es más rondas.
 */
export const DANO_BASE = 1;

/** Porcentajes de vida que cambian la música, del más alto al más bajo. */
export const UMBRALES_VIDA = [75, 50, 25];

/* --- cadenas ------------------------------------------------------------- */
export const RACHA_PARA_DOBLE = 2;
export const SUBRACHA_PARA_TRIPLE = 2;
export const SELLOS_PARA_CADENA_MAXIMA = 3;

/* --- empates ------------------------------------------------------------- */
export const EMPATES_PARA_BLOQUEO = 5;

/* --- medidor de carga y duelo -------------------------------------------- */
export const CARGA_MINIMA = 1;
export const CARGA_MAXIMA = 50;
export const CARGA_POR_DEFECTO = 5;

/** Segundos de la cuenta atrás del duelo, según la dificultad de la IA. */
export const SEGUNDOS_DE_DUELO = {
  facil: 60,
  normal: 45,
  dificil: 35,
  mente: 35,
};

export const INTENTOS_DE_DUELO = 5;

/**
 * Fallos antes de que se desbloquee la PISTA EXTRA.
 * La pista normal se ve desde el primer segundo: con el reloj corriendo,
 * esconderla solo servía para que se acabara el tiempo leyendo.
 */
export const FALLOS_PARA_PISTA_EXTRA = 2;

/** Milisegundos que se queda el tablero a la vista al terminar el duelo. */
export const ESPERA_TRAS_GANAR_DUELO = 900;
export const ESPERA_TRAS_PERDER_DUELO = 2600;

/** Cuántos poderes puede elegir el jugador según los intentos que le sobren. */
export const OPCIONES_POR_INTENTOS_RESTANTES = { 0: 1, 1: 1, 2: 2, 3: 3, 4: 3 };

/* --- ritmo de las animaciones (milisegundos) -----------------------------
   Estos números deciden lo rápido que se siente el juego. Una ronda es la
   suma de todos ellos, así que subir `cartelCorto` 300 ms puede alargar una
   ronda con tres carteles casi un segundo. Todas las esperas son saltables
   con un clic o una tecla (ver utils/tiempo.js). */
export const RITMO = {
  pensarIa: 300,
  revelar: 190,
  congelarNormal: 60,
  congelarTriple: 100,
  cartelCorto: 620,
  cartelLargo: 1500,
  fanfarria: 520,
  pausaConCarteles: 140,
  pausaSinCarteles: 380,
};

/** Tope de marcas visibles en la tira de historial. */
export const MAXIMO_HISTORIAL_VISIBLE = 22;
