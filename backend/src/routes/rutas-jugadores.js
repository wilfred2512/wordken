/**
 * Rutas de /api/jugadores.
 *
 * Este archivo solo dice QUÉ verbo va con QUÉ controlador. No hay lógica.
 */
import { Router } from "express";
import * as controlador from "../controllers/controlador-jugadores.js";
import { validarCuerpoDeJugador, validarIdDeRuta } from "../middlewares/validar-jugador.js";
import { autorizarClave } from "../middlewares/autorizar-clave.js";

export const rutasJugadores = Router();

rutasJugadores.get("/", controlador.listarJugadores);
rutasJugadores.get("/:id", validarIdDeRuta, controlador.obtenerJugador);
rutasJugadores.post("/", validarCuerpoDeJugador, controlador.crearJugador);

rutasJugadores.put(
  "/:id",
  autorizarClave,
  validarIdDeRuta,
  validarCuerpoDeJugador,
  controlador.actualizarJugador,
);

rutasJugadores.delete("/:id", autorizarClave, validarIdDeRuta, controlador.eliminarJugador);
