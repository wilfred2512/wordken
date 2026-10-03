/**
 * Conexión única a SQLite.
 *
 * Se abre una sola vez y se reparte por toda la aplicación. Abrir una conexión
 * por consulta dejaría descriptores de archivo colgando y el fichero .db
 * bloqueado.
 *
 * Usa el SQLite que VIENE DENTRO DE NODE (`node:sqlite`, desde Node 22), no
 * una librería de npm. Antes era `better-sqlite3`, que es un módulo nativo:
 * si para tu versión de Node no había un binario ya hecho, npm lo compilaba
 * con Visual Studio, y en un PC sin Visual Studio `npm install` fallaba y el
 * backend no arrancaba. Con el SQLite de Node no hay nada que compilar ni que
 * descargar, así que funciona igual en cualquier ordenador.
 *
 * Node lo marca como "experimental" y avisa al arrancar; los scripts de npm y
 * el lanzador pasan `--disable-warning=ExperimentalWarning` para que no salga.
 */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { entorno } from "./entorno.js";

const CARPETA_ACTUAL = dirname(fileURLToPath(import.meta.url));
const RUTA_ESQUEMA = resolve(CARPETA_ACTUAL, "../models/esquema.sql");

/*
 * La ruta del .env (RUTA_BASE_DATOS) se toma relativa a la carpeta backend/,
 * y no a la carpeta desde la que se arrancó Node: si alguien lanzaba
 * `node backend/server.js` desde la raíz, la base de datos aparecía en otra
 * carpeta y la tabla de puntuaciones salía vacía sin motivo aparente.
 */
const CARPETA_BACKEND = resolve(CARPETA_ACTUAL, "../..");

let conexion = null;

/** Crea la carpeta del archivo .db si el usuario no la tiene todavía. */
function asegurarCarpetaDeDatos(rutaArchivo) {
  mkdirSync(dirname(rutaArchivo), { recursive: true });
}

/** Lanza el esquema completo. Todas sus sentencias son IF NOT EXISTS. */
function aplicarEsquema(baseDatos) {
  const sentencias = readFileSync(RUTA_ESQUEMA, "utf8");
  baseDatos.exec(sentencias);
}

/**
 * Devuelve la conexión, creándola la primera vez.
 * Los repositorios llaman a esta función; nadie más abre la base de datos.
 */
export function obtenerBaseDatos() {
  if (conexion) return conexion;

  const rutaAbsoluta = resolve(CARPETA_BACKEND, entorno.rutaBaseDatos);
  asegurarCarpetaDeDatos(rutaAbsoluta);

  conexion = new DatabaseSync(rutaAbsoluta);
  conexion.exec("PRAGMA journal_mode = WAL");
  conexion.exec("PRAGMA foreign_keys = ON");
  aplicarEsquema(conexion);

  return conexion;
}

/** Cierra la conexión al apagar el servidor, para no dejar el WAL a medias. */
export function cerrarBaseDatos() {
  if (!conexion) return;
  conexion.close();
  conexion = null;
}
