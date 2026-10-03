/**
 * Rutas de /api/puntuaciones.
 *
 * Recurso de solo lectura: se construye a partir de /api/partidas.
 */
import { Router } from "express";
import { listarPuntuaciones } from "../controllers/controlador-puntuaciones.js";

export const rutasPuntuaciones = Router();

rutasPuntuaciones.get("/", listarPuntuaciones);
