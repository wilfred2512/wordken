/**
 * Controlador de /api/mente: el puente entre el juego y el modelo de lenguaje.
 *
 * Existe para que la clave de la API no salga nunca del servidor. El navegador
 * le pide las cosas aquí, y es este proceso —y solo este— el que llama al
 * proveedor con la credencial que hay en el .env.
 *
 * Fíjate en que ninguna de las tres rutas devuelve error cuando no hay modelo:
 * responden `disponible: false` con un 200. No es un fallo que el profesor no
 * tenga clave de OpenAI; es el caso normal, y el juego sabe seguir sin ella.
 */
import {
  pedirJugadaDeLaMente,
  responderDudaDeJuego,
  estadoDelModelo,
  probarModelo,
} from "../services/servicio-mente.js";
import { responderExito } from "../utils/respuesta-json.js";

/** GET /api/mente — ¿hay modelo configurado? */
export function consultarEstado(_req, res) {
  const estado = estadoDelModelo();

  responderExito(
    res,
    estado,
    estado.disponible
      ? "Hay un modelo de lenguaje configurado."
      : "Sin modelo configurado: el juego usa sus respuestas de repuesto.",
  );
}

/** POST /api/mente/jugada — la tirada y la pulla del rival. */
export async function pedirJugada(req, res, next) {
  try {
    const jugada = await pedirJugadaDeLaMente(req.body);
    responderExito(res, jugada, "Jugada de LA MENTE.");
  } catch (error) {
    next(error);
  }
}

/** GET /api/mente/prueba — consulta real al modelo, con tiempo y motivo del fallo. */
export async function probar(_req, res, next) {
  try {
    const resultado = await probarModelo();
    responderExito(
      res,
      resultado,
      resultado.funciona ? "El modelo responde." : `El modelo NO responde: ${resultado.fallo}`,
    );
  } catch (error) {
    next(error);
  }
}

/** POST /api/mente/ayuda — el chatbot que explica cómo se juega. */
export async function pedirAyuda(req, res, next) {
  try {
    const respuesta = await responderDudaDeJuego(req.body?.mensajes);
    responderExito(res, respuesta, "Respuesta del ayudante.");
  } catch (error) {
    next(error);
  }
}
