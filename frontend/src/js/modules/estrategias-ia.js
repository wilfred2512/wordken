/**
 * Las tres estrategias de la IA.
 *
 * Todas hacen lo mismo: predicen la próxima tirada del jugador y devuelven la
 * que la vence. Lo único que cambia es cuánta memoria usan.
 *
 * Dato para la defensa: la IA FÁCIL es, en teoría, la más imbatible a largo
 * plazo, porque contra el azar puro no existe estrategia ganadora. Las otras
 * dos son mejores solo porque los humanos somos predecibles.
 */
import { TIRADAS, loQueVenceA } from "./reglas-tiradas.js";
import { elegirAlAzar, ocurreCon } from "../utils/azar.js";

/** Pesos de cada pista que usa la IA difícil. */
const PESO = {
  PATRON_DE_DOS: 3,
  PATRON_DE_UNA: 1.4,
  MANIA_RECIENTE: 0.35,
  REPITE_EN_CADENA: 2.2,
  ACABA_DE_GANAR: 0.9,
  ACABA_DE_PERDER: 1.2,
  ACABA_DE_EMPATAR: 0.7,
};

const AZAR_NORMAL = 0.35;
const AZAR_DIFICIL = 0.1;
const CASTIGO_POR_REPETIR = 0.65;
const MEMORIA_CORTA = 6;
const MEMORIA_MANIA = 10;
const MINIMO_PARA_PREDECIR = 3;

/** Una tirada normal al azar. */
export function tiradaAlAzar() {
  return elegirAlAzar(TIRADAS);
}

/** Contador vacío de tiradas. */
function contadorVacio() {
  return { piedra: 0, papel: 0, tijera: 0 };
}

/** La clave con más puntos de un contador. */
function masPuntuada(puntos) {
  return TIRADAS.reduce((mejor, tirada) => (puntos[tirada] > puntos[mejor] ? tirada : mejor));
}

/**
 * NORMAL: mira tus últimas tiradas y castiga que repitas.
 * @param {object} memoria { tiradasDelJugador, cadenaJugador }
 */
export function estrategiaNormal(memoria) {
  const historial = memoria.tiradasDelJugador;
  if (historial.length < 2 || ocurreCon(AZAR_NORMAL)) return tiradaAlAzar();

  const cadena = memoria.cadenaJugador;
  if (cadena.longitudSubRacha() >= 2 && ocurreCon(CASTIGO_POR_REPETIR)) {
    return loQueVenceA(cadena.ultimaTirada());
  }

  const veces = contadorVacio();
  historial.slice(-MEMORIA_CORTA).forEach((tirada) => {
    veces[tirada]++;
  });

  return loQueVenceA(masPuntuada(veces));
}

/** Suma los puntos de los patrones de orden 1 y 2. */
function puntuarPatrones(historial, puntos) {
  const ultimasDos = `${historial.at(-2)}|${historial.at(-1)}`;
  const ultima = historial.at(-1);

  for (let i = 2; i < historial.length; i++) {
    if (`${historial[i - 2]}|${historial[i - 1]}` === ultimasDos) {
      puntos[historial[i]] += PESO.PATRON_DE_DOS;
    }
  }

  for (let i = 1; i < historial.length; i++) {
    if (historial[i - 1] === ultima) puntos[historial[i]] += PESO.PATRON_DE_UNA;
  }
}

/** Suma los puntos de la psicología clásica del piedra-papel-tijera. */
function puntuarPsicologia(memoria, puntos) {
  memoria.tiradasDelJugador.slice(-MEMORIA_MANIA).forEach((tirada) => {
    puntos[tirada] += PESO.MANIA_RECIENTE;
  });

  const cadena = memoria.cadenaJugador;
  if (cadena.longitudSubRacha() >= 1) puntos[cadena.ultimaTirada()] += PESO.REPITE_EN_CADENA;

  const ultimaRonda = memoria.ultimaRonda;
  if (!ultimaRonda) return;

  if (ultimaRonda.resultado === "jugador") puntos[ultimaRonda.tiradaJugador] += PESO.ACABA_DE_GANAR;
  if (ultimaRonda.resultado === "ia") puntos[loQueVenceA(ultimaRonda.tiradaIa)] += PESO.ACABA_DE_PERDER;
  if (ultimaRonda.resultado === "empate") {
    puntos[loQueVenceA(ultimaRonda.tiradaJugador)] += PESO.ACABA_DE_EMPATAR;
  }
}

/** DIFÍCIL: sistema de puntos con patrones y psicología. */
export function estrategiaDificil(memoria) {
  const historial = memoria.tiradasDelJugador;
  if (historial.length < MINIMO_PARA_PREDECIR || ocurreCon(AZAR_DIFICIL)) return tiradaAlAzar();

  const puntos = contadorVacio();
  puntuarPatrones(historial, puntos);
  puntuarPsicologia(memoria, puntos);

  return loQueVenceA(masPuntuada(puntos));
}

/** Tabla dificultad -> estrategia. Un `switch` menos. */
export const ESTRATEGIAS = {
  facil: () => tiradaAlAzar(),
  normal: estrategiaNormal,
  dificil: estrategiaDificil,
};
