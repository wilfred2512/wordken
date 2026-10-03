/**
 * Construcción de la aplicación Express.
 *
 * Está separada de server.js a propósito: así se puede montar la app en una
 * prueba automática sin levantar ningún puerto.
 */
import express from "express";
import cors from "cors";
import { rutasApi } from "../routes/indice-rutas.js";
import { rutaNoEncontrada } from "../middlewares/ruta-no-encontrada.js";
import { manejadorDeErrores } from "../middlewares/manejador-errores.js";
import { entorno } from "./entorno.js";

const LIMITE_CUERPO_JSON = "16kb";

/**
 * Política CORS explícita.
 * Si ORIGENES_PERMITIDOS está vacío se permite cualquier origen, lo cual solo
 * es aceptable en desarrollo; en producción la variable debe estar rellena.
 */
function construirOpcionesCors() {
  if (entorno.origenesPermitidos.length === 0) {
    return { origin: true };
  }

  return {
    origin: entorno.origenesPermitidos,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-clave-api"],
  };
}

/** Devuelve la app ya configurada, sin escuchar en ningún puerto. */
export function crearAplicacion() {
  const app = express();

  app.use(cors(construirOpcionesCors()));
  app.use(express.json({ limit: LIMITE_CUERPO_JSON }));

  app.use("/api", rutasApi);

  // El orden importa: primero las rutas, luego el 404, y el manejador de
  // errores siempre el último.
  app.use(rutaNoEncontrada);
  app.use(manejadorDeErrores);

  return app;
}
