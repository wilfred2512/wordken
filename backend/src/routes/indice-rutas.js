/**
 * Índice de rutas: monta cada recurso bajo su prefijo.
 *
 * Tener un único punto de montaje evita que app.js se llene de app.use()
 * y deja a la vista el mapa completo de la API.
 */
import { Router } from "express";
import { rutasJugadores } from "./rutas-jugadores.js";
import { rutasPartidas } from "./rutas-partidas.js";
import { rutasPuntuaciones } from "./rutas-puntuaciones.js";
import { rutasMente } from "./rutas-mente.js";
import { responderExito } from "../utils/respuesta-json.js";

export const rutasApi = Router();

/** GET /api — sirve para comprobar de un vistazo que el servidor responde. */
rutasApi.get("/", (_req, res) => {
  responderExito(
    res,
    {
      nombre: "API del mini proyecto RA1",
      recursos: ["/api/jugadores", "/api/partidas", "/api/puntuaciones", "/api/mente"],
    },
    "La API está en marcha.",
  );
});

rutasApi.use("/jugadores", rutasJugadores);
rutasApi.use("/partidas", rutasPartidas);
rutasApi.use("/puntuaciones", rutasPuntuaciones);
rutasApi.use("/mente", rutasMente);
