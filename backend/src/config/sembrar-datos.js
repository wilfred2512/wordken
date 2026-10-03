/**
 * Semilla de datos de ejemplo.
 *
 * Sirve para que la tabla de puntuaciones no salga vacía el día de la
 * presentación. Se ejecuta con: npm run semilla
 */
import { obtenerBaseDatos, cerrarBaseDatos } from "./base-datos.js";
import { registrarPartida } from "../services/servicio-partidas.js";

/** Partidas ficticias, ya en el formato que acepta el servicio. */
const PARTIDAS_DE_EJEMPLO = [
  {
    nombreJugador: "Tiguere",
    gano: true,
    cadenaMaxima: true,
    dificultad: "dificil",
    rondas: 14,
    danoHecho: 20,
    danoRecibido: 6,
    mejorCadena: 6,
    sellos: 3,
    duelosGanados: 2,
    duelosPerdidos: 0,
    poderesUsados: 2,
  },
  {
    nombreJugador: "Chamo",
    gano: true,
    cadenaMaxima: false,
    dificultad: "normal",
    rondas: 22,
    danoHecho: 20,
    danoRecibido: 13,
    mejorCadena: 4,
    sellos: 1,
    duelosGanados: 1,
    duelosPerdidos: 1,
    poderesUsados: 1,
  },
  {
    nombreJugador: "Parcero",
    gano: false,
    cadenaMaxima: false,
    dificultad: "facil",
    rondas: 18,
    danoHecho: 11,
    danoRecibido: 20,
    mejorCadena: 3,
    sellos: 0,
    duelosGanados: 0,
    duelosPerdidos: 2,
    poderesUsados: 0,
  },
];

function sembrar() {
  obtenerBaseDatos();

  PARTIDAS_DE_EJEMPLO.forEach((partida) => registrarPartida(partida));

  process.stdout.write(`Sembradas ${PARTIDAS_DE_EJEMPLO.length} partidas de ejemplo.\n`);
  cerrarBaseDatos();
}

sembrar();
