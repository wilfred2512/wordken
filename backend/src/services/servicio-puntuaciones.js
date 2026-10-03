/**
 * Reglas de negocio de la tabla de puntuaciones (leaderboard).
 *
 * La consulta agregada la hace el repositorio; aquí solo se decide cuántas
 * filas se devuelven y se numeran las posiciones.
 */
import { obtenerFilasDePuntuaciones } from "../repositories/repositorio-partidas.js";
import { aFilaDePuntuaciones } from "../models/modelo-partida.js";
import { entorno } from "../config/entorno.js";

const LIMITE_MAXIMO = 50;
const PRIMERA_POSICION = 1;

/** Recorta el límite pedido entre 1 y LIMITE_MAXIMO. */
function normalizarLimite(limiteCrudo) {
  const limite = Number.parseInt(limiteCrudo, 10);
  if (Number.isNaN(limite) || limite < 1) return entorno.limitePuntuaciones;
  return Math.min(limite, LIMITE_MAXIMO);
}

/**
 * Tabla de puntuaciones ya ordenada y numerada.
 * La posición se asigna aquí y no en SQL para no depender de funciones de
 * ventana, que no todos los motores soportan igual.
 *
 * @param {string|number} limiteCrudo
 */
export function obtenerTablaDePuntuaciones(limiteCrudo) {
  const limite = normalizarLimite(limiteCrudo);
  const filas = obtenerFilasDePuntuaciones(limite);

  return filas.map((fila, indice) => aFilaDePuntuaciones(fila, indice + PRIMERA_POSICION));
}
