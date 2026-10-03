/**
 * Punto de arranque del servidor.
 *
 * Aquí no hay rutas, ni middlewares, ni SQL: solo se levanta el puerto y se
 * cierra la base de datos con limpieza al apagar.
 */
import { crearAplicacion } from "./src/config/aplicacion.js";
import { obtenerBaseDatos, cerrarBaseDatos } from "./src/config/base-datos.js";
import { entorno } from "./src/config/entorno.js";

/** Escribe una línea en la salida estándar sin usar console.log. */
function anunciar(texto) {
  process.stdout.write(`${texto}\n`);
}

/** Cierra la base de datos y termina el proceso de forma ordenada. */
function apagar(senal) {
  anunciar(`\nRecibida la señal ${senal}. Cerrando la base de datos...`);
  cerrarBaseDatos();
  process.exit(0);
}

/**
 * Explica el fallo más habitual al arrancar en vez de soltar la traza entera:
 * el puerto ocupado porque el servidor ya está corriendo en otra terminal.
 */
function explicarFalloDeArranque(error) {
  if (error.code !== "EADDRINUSE") throw error;

  anunciar(`\nEl puerto ${entorno.puerto} ya está ocupado.`);
  anunciar("Seguramente tienes el servidor corriendo en otra terminal.");
  anunciar("Ciérralo, o cambia PUERTO en el archivo .env.\n");
  process.exit(1);
}

function arrancar() {
  obtenerBaseDatos();

  const servidor = crearAplicacion().listen(entorno.puerto, () => {
    anunciar(`API escuchando en http://localhost:${entorno.puerto}/api`);
    anunciar(`Modo: ${entorno.modo} · Base de datos: ${entorno.rutaBaseDatos}`);
  });

  servidor.on("error", explicarFalloDeArranque);
  ["SIGINT", "SIGTERM"].forEach((senal) => process.on(senal, () => apagar(senal)));
}

arrancar();
