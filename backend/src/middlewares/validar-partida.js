/**
 * Validación de entrada del endpoint POST /api/partidas.
 *
 * El juego manda muchos contadores; todos tienen que ser enteros no negativos
 * y con un tope razonable, para que nadie guarde "daño hecho: 10^9".
 */
import {
  validarNombre,
  validarEnteroNoNegativo,
  validarOpcion,
  validarBooleano,
} from "../utils/validaciones.js";
import { errorPeticionInvalida } from "../utils/error-http.js";

const DIFICULTADES = ["facil", "normal", "dificil"];
const TOPE_CONTADOR = 100000;

/** Contadores enteros que acepta el endpoint, con su tope común. */
const CAMPOS_NUMERICOS = [
  "rondas",
  "danoHecho",
  "danoRecibido",
  "mejorCadena",
  "sellos",
  "duelosGanados",
  "duelosPerdidos",
  "poderesUsados",
];

/** Campos que deben llegar como booleano estricto. */
const CAMPOS_BOOLEANOS = ["gano", "cadenaMaxima"];

/** Recoge los problemas de todos los contadores numéricos. */
function revisarNumeros(cuerpo) {
  return CAMPOS_NUMERICOS.map((campo) =>
    validarEnteroNoNegativo(cuerpo?.[campo], campo, TOPE_CONTADOR),
  ).filter(Boolean);
}

/** Recoge los problemas de los campos booleanos. */
function revisarBooleanos(cuerpo) {
  return CAMPOS_BOOLEANOS.map((campo) => validarBooleano(cuerpo?.[campo], campo)).filter(Boolean);
}

/** Recoge los problemas del nombre y la dificultad. */
function revisarTextos(cuerpo) {
  const problemas = [];
  const problemaNombre = validarNombre(cuerpo?.nombreJugador, "nombreJugador");
  const problemaDificultad = validarOpcion(cuerpo?.dificultad, "dificultad", DIFICULTADES);

  if (problemaNombre) problemas.push(problemaNombre);
  if (problemaDificultad) problemas.push(problemaDificultad);

  return problemas;
}

/** Middleware: junta todos los problemas y responde una sola vez. */
export function validarCuerpoDePartida(req, _res, siguiente) {
  const problemas = [
    ...revisarTextos(req.body),
    ...revisarBooleanos(req.body),
    ...revisarNumeros(req.body),
  ];

  if (problemas.length > 0) {
    return siguiente(errorPeticionInvalida("Los datos de la partida no son válidos.", problemas));
  }

  return siguiente();
}
