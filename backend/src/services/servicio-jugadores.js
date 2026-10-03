/**
 * Reglas de negocio de los jugadores.
 *
 * Esta capa no conoce req ni res: recibe datos limpios y lanza ErrorHttp
 * cuando algo no cuadra. El controlador es quien traduce eso a una respuesta.
 */
import * as repositorio from "../repositories/repositorio-jugadores.js";
import { errorNoEncontrado, errorPeticionInvalida } from "../utils/error-http.js";

/** Lista completa de jugadores. */
export function obtenerJugadores() {
  return repositorio.listarJugadores();
}

/**
 * Un jugador por id. Lanza 404 si no existe, para que el controlador no tenga
 * que repetir la comprobación en cada endpoint.
 */
export function obtenerJugadorPorId(id) {
  const jugador = repositorio.buscarJugadorPorId(id);
  if (!jugador) {
    throw errorNoEncontrado(`No existe ningún jugador con id ${id}.`);
  }
  return jugador;
}

/** Crea un jugador. El nombre es único, sin distinguir mayúsculas. */
export function crearJugador(nombreCrudo) {
  const nombre = nombreCrudo.trim();

  if (repositorio.buscarJugadorPorNombre(nombre)) {
    throw errorPeticionInvalida(`El nombre "${nombre}" ya está ocupado.`, [
      { campo: "nombre", mensaje: "Ya existe un jugador con ese nombre." },
    ]);
  }

  return repositorio.insertarJugador(nombre);
}

/**
 * Devuelve el jugador con ese nombre y, si no existe todavía, lo crea.
 * Lo usa el registro de partidas: el juego manda un nombre, no un id.
 */
export function obtenerOCrearJugador(nombreCrudo) {
  const nombre = nombreCrudo.trim();
  const existente = repositorio.buscarJugadorPorNombre(nombre);
  return existente ?? repositorio.insertarJugador(nombre);
}

/** Renombra un jugador existente. */
export function renombrarJugador(id, nombreCrudo) {
  const nombre = nombreCrudo.trim();
  const ocupado = repositorio.buscarJugadorPorNombre(nombre);

  if (ocupado && ocupado.id !== id) {
    throw errorPeticionInvalida(`El nombre "${nombre}" ya está ocupado.`, [
      { campo: "nombre", mensaje: "Ya existe otro jugador con ese nombre." },
    ]);
  }

  const actualizado = repositorio.actualizarJugador(id, nombre);
  if (!actualizado) {
    throw errorNoEncontrado(`No existe ningún jugador con id ${id}.`);
  }

  return actualizado;
}

/** Elimina un jugador y, en cascada, todas sus partidas. */
export function eliminarJugador(id) {
  const borrado = repositorio.borrarJugador(id);
  if (!borrado) {
    throw errorNoEncontrado(`No existe ningún jugador con id ${id}.`);
  }
  return { id };
}
