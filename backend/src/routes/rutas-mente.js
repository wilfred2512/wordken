/**
 * Rutas de /api/mente.
 *
 * No guardan nada en la base de datos: son un intermediario hacia el modelo de
 * lenguaje. Por eso no hay PUT ni DELETE, y por eso no piden la clave de la
 * API interna: no hay nada destructivo que proteger.
 */
import { Router } from "express";
import { consultarEstado, pedirJugada, pedirAyuda, probar } from "../controllers/controlador-mente.js";

export const rutasMente = Router();

rutasMente.get("/", consultarEstado);
rutasMente.get("/prueba", probar);
rutasMente.post("/jugada", pedirJugada);
rutasMente.post("/ayuda", pedirAyuda);
