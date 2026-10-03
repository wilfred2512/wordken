/**
 * Acceso a datos de la tabla `jugadores`.
 *
 * Es la única capa que escribe SQL. Todas las consultas usan marcadores (?)
 * y nunca concatenan texto: así la inyección SQL no tiene por dónde entrar.
 */
import { obtenerBaseDatos } from "../config/base-datos.js";
import { aJugador, aListaDeJugadores } from "../models/modelo-jugador.js";

const SQL_LISTAR = `
  SELECT id, nombre, creado_en
  FROM jugadores
  ORDER BY nombre COLLATE NOCASE ASC
`;

const SQL_BUSCAR_POR_ID = `
  SELECT id, nombre, creado_en
  FROM jugadores
  WHERE id = ?
`;

const SQL_BUSCAR_POR_NOMBRE = `
  SELECT id, nombre, creado_en
  FROM jugadores
  WHERE nombre = ? COLLATE NOCASE
`;

const SQL_INSERTAR = `
  INSERT INTO jugadores (nombre)
  VALUES (?)
`;

const SQL_ACTUALIZAR = `
  UPDATE jugadores
  SET nombre = ?
  WHERE id = ?
`;

const SQL_BORRAR = `
  DELETE FROM jugadores
  WHERE id = ?
`;

/** Todos los jugadores, ordenados por nombre. */
export function listarJugadores() {
  const filas = obtenerBaseDatos().prepare(SQL_LISTAR).all();
  return aListaDeJugadores(filas);
}

/** Un jugador por su identificador, o null. */
export function buscarJugadorPorId(id) {
  const fila = obtenerBaseDatos().prepare(SQL_BUSCAR_POR_ID).get(id);
  return aJugador(fila);
}

/** Un jugador por su nombre, sin distinguir mayúsculas, o null. */
export function buscarJugadorPorNombre(nombre) {
  const fila = obtenerBaseDatos().prepare(SQL_BUSCAR_POR_NOMBRE).get(nombre);
  return aJugador(fila);
}

/** Inserta y devuelve el jugador ya creado, con su id. */
export function insertarJugador(nombre) {
  const resultado = obtenerBaseDatos().prepare(SQL_INSERTAR).run(nombre);
  return buscarJugadorPorId(resultado.lastInsertRowid);
}

/** Cambia el nombre. Devuelve el jugador actualizado, o null si no existía. */
export function actualizarJugador(id, nombre) {
  const resultado = obtenerBaseDatos().prepare(SQL_ACTUALIZAR).run(nombre, id);
  if (resultado.changes === 0) return null;
  return buscarJugadorPorId(id);
}

/** Borra el jugador (y en cascada sus partidas). Devuelve si borró algo. */
export function borrarJugador(id) {
  const resultado = obtenerBaseDatos().prepare(SQL_BORRAR).run(id);
  return resultado.changes > 0;
}
