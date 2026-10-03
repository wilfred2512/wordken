/**
 * Rutas de /api/partidas.
 */
import { Router } from "express";
import * as controlador from "../controllers/controlador-partidas.js";
import { validarCuerpoDePartida } from "../middlewares/validar-partida.js";
import { validarIdDeRuta } from "../middlewares/validar-jugador.js";
import { autorizarClave } from "../middlewares/autorizar-clave.js";

export const rutasPartidas = Router();

rutasPartidas.get("/", controlador.listarPartidas);
rutasPartidas.get("/:id", validarIdDeRuta, controlador.obtenerPartida);
rutasPartidas.post("/", validarCuerpoDePartida, controlador.registrarPartida);
rutasPartidas.delete("/:id", autorizarClave, validarIdDeRuta, controlador.eliminarPartida);
