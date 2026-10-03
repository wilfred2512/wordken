/**
 * Servidor estático mínimo para la carpeta `frontend/`.
 *
 * Existe para no depender de ninguna extensión de editor ni de descargar un
 * paquete: el juego usa módulos ES6 y el navegador los bloquea si la página se
 * abre con doble clic (`file://`), así que hace falta un servidor sí o sí.
 * Este usa solo lo que trae Node de fábrica.
 *
 * Uso:  node herramientas/servidor-estatico.mjs [puerto]
 */
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, resolve, extname, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "../frontend");
const PUERTO_POR_DEFECTO = 5500;

/** Extensión -> tipo de contenido. Solo lo que sirve este proyecto. */
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".ico": "image/x-icon",
};

/**
 * Convierte la URL pedida en una ruta de disco dentro de `frontend/`.
 * Devuelve null si la petición intenta salirse de esa carpeta.
 */
function rutaSegura(urlPedida) {
  const sinConsulta = decodeURIComponent(urlPedida.split("?")[0]);
  const relativa = normalize(sinConsulta === "/" ? "/index.html" : sinConsulta);
  const destino = join(RAIZ, relativa);

  return destino.startsWith(RAIZ) ? destino : null;
}

/** Responde con un texto plano y el código indicado. */
function responderTexto(respuesta, codigo, texto) {
  respuesta.writeHead(codigo, { "Content-Type": "text/plain; charset=utf-8" });
  respuesta.end(texto);
}

/** Envía el archivo pedido si existe. */
async function servirArchivo(ruta, respuesta) {
  const informacion = await stat(ruta);
  if (!informacion.isFile()) throw new Error("no es un archivo");

  respuesta.writeHead(200, {
    "Content-Type": TIPOS[extname(ruta).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": informacion.size,
    "Cache-Control": "no-cache",
  });

  createReadStream(ruta).pipe(respuesta);
}

/** Atiende una petición. */
async function atender(peticion, respuesta) {
  const ruta = rutaSegura(peticion.url);

  if (ruta === null) {
    responderTexto(respuesta, 403, "Fuera de la carpeta del juego.");
    return;
  }

  try {
    await servirArchivo(ruta, respuesta);
  } catch (error) {
    responderTexto(respuesta, 404, `No se encontró ${peticion.url}`);
  }
}

/** Arranca el servidor y devuelve la instancia. */
export function arrancarServidorEstatico(puerto = PUERTO_POR_DEFECTO) {
  const servidor = createServer(atender);

  servidor.listen(puerto, () => {
    process.stdout.write(`Juego servido en http://localhost:${puerto}\n`);
  });

  servidor.on("error", (error) => {
    const aviso = error.code === "EADDRINUSE"
      ? `El puerto ${puerto} ya está ocupado. Cierra el otro servidor o usa otro puerto.`
      : `Error del servidor estático: ${error.message}`;

    process.stderr.write(`${aviso}\n`);
    process.exit(1);
  });

  return servidor;
}

/** Si se ejecuta directamente (y no como import), arranca solo. */
if (process.argv[1] && process.argv[1].endsWith("servidor-estatico.mjs")) {
  arrancarServidorEstatico(Number.parseInt(process.argv[2], 10) || PUERTO_POR_DEFECTO);
}
