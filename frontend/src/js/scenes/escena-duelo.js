/**
 * Escena del duelo de palabras (el Wordle).
 *
 * Se abre cuando el círculo de carga se llena. Si se acierta la palabra, el
 * jugador se lleva una bonificación; si falla o se le acaba el tiempo, se la
 * lleva la IA.
 */
import { RondaWordle, RECHAZO } from "../entities/ronda-wordle.js";
import { CuentaAtras } from "../core/reloj.js";
import { gestorDeEscenas } from "../core/gestor-escenas.js";
import { estadoDelJuego } from "../core/estado-juego.js";
import * as pintor from "../render/pintor-wordle.js";
import * as avatar from "../render/avatar-ia.js";
import { entregarPremio, entregarCastigo, cerrarMenuDePremios } from "./premio-duelo.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { musicaDeDuelo } from "../modules/audio/director-musical.js";
import { entradaDeTeclado } from "../input/entrada-teclado.js";
import { ESTADO_LETRA } from "../modules/logica-wordle.js";
import {
  SEGUNDOS_DE_DUELO,
  INTENTOS_DE_DUELO,
  ESPERA_TRAS_GANAR_DUELO,
  ESPERA_TRAS_PERDER_DUELO,
} from "../modules/constantes.js";
import { normalizar } from "../utils/texto.js";
import { esperar } from "../utils/tiempo.js";
import { escribirTexto } from "../utils/dom.js";

const MILISEGUNDOS_POR_SEGUNDO = 1000;
const PAUSA_TRAS_VOLTEAR_MS = 900;
const AVISO_DE_APURO_MS = 10000;

/** Mensajes de rechazo, para no repartir textos por el código. */
const MENSAJE_DE_RECHAZO = {
  [RECHAZO.VACIO]: "Escribe algo primero.",
  [RECHAZO.LARGO]: "No tiene el número de letras correcto.",
  [RECHAZO.CARACTERES]: "Solo se admiten letras.",
  [RECHAZO.REPETIDO]: "Esa palabra ya la probaste.",
};

/** Sonido según el color de la casilla que se acaba de voltear. */
const SONIDO_DE_LETRA = {
  [ESTADO_LETRA.CORRECTA]: "letraCorrecta",
  [ESTADO_LETRA.POSICION]: "letraPosicion",
  [ESTADO_LETRA.INCORRECTA]: "letraIncorrecta",
};

/** Estado interno de la escena. */
const duelo = { ronda: null, escrito: [], reloj: null, bloqueado: false, avisado: false };

/** Escribe una letra si cabe. */
function escribirLetra(letra) {
  if (duelo.escrito.length >= duelo.ronda.largo()) return;

  duelo.escrito.push(letra);
  gestorAudio.efecto("tecla");
  refrescarFila();
}

/** Borra la última letra escrita. */
function borrarLetra() {
  duelo.escrito.pop();
  refrescarFila();
}

/** Repinta la fila en curso con lo tecleado. */
function refrescarFila() {
  pintor.pintarFilaEnCurso(duelo.ronda.intentos.length, duelo.escrito, duelo.ronda.largo());
}

/** Cada latido del reloj: barra, número y aviso de que queda poco. */
function alLatirElReloj(restanteMs, fraccion) {
  pintor.pintarTiempo(restanteMs, fraccion);

  if (restanteMs > AVISO_DE_APURO_MS || duelo.avisado) return;

  duelo.avisado = true;
  gestorAudio.efecto("tiempoCorto");
}

/** Comprueba el intento escrito y lo registra si vale. */
async function enviarIntento() {
  if (duelo.bloqueado || duelo.ronda.terminada) return;

  const texto = duelo.escrito.join("");
  const rechazo = duelo.ronda.revisarIntento(texto);

  if (rechazo) {
    pintor.temblarFila(duelo.ronda.intentos.length);
    pintor.mostrarMensajeDuelo(MENSAJE_DE_RECHAZO[rechazo], true);
    return;
  }

  duelo.bloqueado = true;
  const indice = duelo.ronda.intentos.length;
  const informe = duelo.ronda.registrarIntento(texto);

  pintor.pintarResultado(indice, informe.palabra, informe.resultado, (estado) => {
    gestorAudio.efecto(SONIDO_DE_LETRA[estado]);
  });

  await esperar(informe.resultado.length * 180 + PAUSA_TRAS_VOLTEAR_MS);
  await trasElIntento();
}

/** Qué hacer una vez volteada la fila. */
async function trasElIntento() {
  duelo.escrito = [];
  duelo.bloqueado = false;

  pintor.pintarTeclado(duelo.ronda.estadoTeclado);
  pintor.pintarCabeceraDuelo(duelo.ronda);

  if (duelo.ronda.terminada) {
    await cerrarDuelo();
    return;
  }

  const restantes = duelo.ronda.intentosRestantes();
  pintor.mostrarMensajeDuelo(`No fue esa. Te quedan ${restantes} intentos.`);
}

/**
 * Reparte el premio o el castigo y vuelve a la partida.
 *
 * Al perder se deja el tablero a la vista un buen rato con la solución
 * escrita: si la pantalla saltara al instante, no daría tiempo a comparar lo
 * que escribiste con lo que era, que es donde se aprende la palabra.
 */
async function cerrarDuelo() {
  duelo.reloj?.detener();

  const partida = estadoDelJuego.partida;

  if (duelo.ronda.ganada) {
    pintor.mostrarMensajeDuelo(`¡Esa era! ${duelo.ronda.palabraSecreta}`);
    await esperar(ESPERA_TRAS_GANAR_DUELO);
    await entregarPremio(partida, duelo.ronda);
  } else {
    pintor.mostrarMensajeDuelo("Se acabó. Mira dónde estuvo el fallo.", true);
    pintor.revelarSolucion(duelo.ronda.palabraSecreta);
    gestorAudio.efecto("poderRobado");
    await esperar(ESPERA_TRAS_PERDER_DUELO);
    await entregarCastigo(partida, duelo.ronda.palabraSecreta);
  }

  gestorDeEscenas.ir("partida", { reanudar: true });
  avatar.reaccionar(duelo.ronda.ganada ? "dueloGanado" : "dueloPerdido");
}

/** Se acabó el tiempo: derrota inmediata. */
async function alAgotarseElTiempo() {
  if (duelo.ronda.terminada) return;

  gestorAudio.efecto("tiempoAgotado");
  duelo.ronda.agotarTiempo();
  await cerrarDuelo();
}

/** Una pulsación, venga del teclado físico o del virtual. */
function pulsarTecla(tecla) {
  if (duelo.bloqueado) return;

  if (tecla === "ENVIAR") return enviarIntento();
  if (tecla === "BORRAR") return borrarLetra();

  const letra = normalizar(tecla);
  if (letra.length === 1 && /[A-ZÑ]/.test(letra)) escribirLetra(letra);

  return undefined;
}

/** Traduce el teclado físico al mismo vocabulario que el virtual. */
function manejarTecladoFisico(evento) {
  if (evento.key === "Enter") return pulsarTecla("ENVIAR");
  if (evento.key === "Backspace") return pulsarTecla("BORRAR");
  return pulsarTecla(evento.key);
}

/** Arranca la cuenta atrás con los segundos que dicte la dificultad. */
function arrancarReloj(dificultad) {
  const segundos = SEGUNDOS_DE_DUELO[dificultad] ?? SEGUNDOS_DE_DUELO.normal;

  duelo.reloj = new CuentaAtras(
    segundos * MILISEGUNDOS_POR_SEGUNDO,
    alLatirElReloj,
    alAgotarseElTiempo,
  );
  duelo.reloj.arrancar();
}

export const escenaDuelo = {
  idPantalla: "pantalla-duelo",

  entrar({ partida }) {
    duelo.ronda = new RondaWordle();
    duelo.escrito = [];
    duelo.bloqueado = false;
    duelo.avisado = false;
    estadoDelJuego.dueloEnCurso = duelo.ronda;

    pintor.construirTablero(duelo.ronda.largo());
    pintor.construirTeclado(pulsarTecla);
    pintor.pintarCabeceraDuelo(duelo.ronda);
    pintor.mostrarMensajeDuelo(
      `${duelo.ronda.largo()} letras y ${INTENTOS_DE_DUELO} intentos. ¡Corre!`,
    );
    escribirTexto("#duelo-numero", partida.medidor.duelosJugados);

    entradaDeTeclado.usar(manejarTecladoFisico);
    musicaDeDuelo();
    arrancarReloj(partida.ajustes.dificultad);
  },

  salir() {
    duelo.reloj?.detener();
    entradaDeTeclado.soltar();
    cerrarMenuDePremios();
    estadoDelJuego.dueloEnCurso = null;
  },
};
