/**
 * Lógica pura del duelo de palabras. Sin DOM.
 *
 * El punto delicado son las letras repetidas. Si la palabra es MANGO y el
 * jugador escribe MAMMA, solo la primera M puede marcarse: las otras dos no
 * "están en otra posición", simplemente no existen. Por eso se cuenta cuántas
 * veces aparece cada letra y se van consumiendo.
 */
import { enLetras } from "../utils/texto.js";

/** Estado de cada casilla del tablero. */
export const ESTADO_LETRA = {
  CORRECTA: "correcta",
  POSICION: "posicion",
  INCORRECTA: "incorrecta",
};

/** Cuenta cuántas veces aparece cada letra de la palabra secreta. */
function contarLetras(letras) {
  const cuenta = new Map();

  letras.forEach((letra) => {
    cuenta.set(letra, (cuenta.get(letra) ?? 0) + 1);
  });

  return cuenta;
}

/**
 * Primera pasada: las letras que están en su sitio exacto.
 * Consume una aparición de cada acierto para que la segunda pasada no la
 * vuelva a contar.
 */
function marcarCorrectas(letrasIntento, letrasSecretas, disponibles, resultado) {
  letrasIntento.forEach((letra, indice) => {
    if (letra !== letrasSecretas[indice]) return;

    resultado[indice] = ESTADO_LETRA.CORRECTA;
    disponibles.set(letra, disponibles.get(letra) - 1);
  });
}

/** Segunda pasada: letras que existen pero en otra posición. */
function marcarPosiciones(letrasIntento, disponibles, resultado) {
  letrasIntento.forEach((letra, indice) => {
    if (resultado[indice] === ESTADO_LETRA.CORRECTA) return;
    if ((disponibles.get(letra) ?? 0) <= 0) return;

    resultado[indice] = ESTADO_LETRA.POSICION;
    disponibles.set(letra, disponibles.get(letra) - 1);
  });
}

/**
 * Evalúa un intento contra la palabra secreta.
 * @returns {string[]} un estado por letra, en orden
 */
export function evaluarIntento(intento, palabraSecreta) {
  const letrasIntento = enLetras(intento);
  const letrasSecretas = enLetras(palabraSecreta);

  const resultado = new Array(letrasIntento.length).fill(ESTADO_LETRA.INCORRECTA);
  const disponibles = contarLetras(letrasSecretas);

  marcarCorrectas(letrasIntento, letrasSecretas, disponibles, resultado);
  marcarPosiciones(letrasIntento, disponibles, resultado);

  return resultado;
}

/** Prioridad de los estados: una letra verde nunca vuelve a amarilla. */
const PRIORIDAD = {
  [ESTADO_LETRA.INCORRECTA]: 0,
  [ESTADO_LETRA.POSICION]: 1,
  [ESTADO_LETRA.CORRECTA]: 2,
};

/**
 * Actualiza el color de cada tecla del teclado virtual.
 * @param {Map<string,string>} estadoTeclado mapa letra -> estado
 */
export function actualizarEstadoTeclado(estadoTeclado, intento, resultado) {
  enLetras(intento).forEach((letra, indice) => {
    const nuevo = resultado[indice];
    const anterior = estadoTeclado.get(letra);

    if (!anterior || PRIORIDAD[nuevo] > PRIORIDAD[anterior]) {
      estadoTeclado.set(letra, nuevo);
    }
  });
}

/** true si todas las letras están en su sitio. */
export function esAcierto(resultado) {
  return resultado.every((estado) => estado === ESTADO_LETRA.CORRECTA);
}
