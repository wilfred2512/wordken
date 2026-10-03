/**
 * Escena de fin de partida: resumen, puntuación y guardado en el servidor.
 */
import { gestorDeEscenas } from "../core/gestor-escenas.js";
import { estadoDelJuego } from "../core/estado-juego.js";
import { abrirVentana, cerrarVentana } from "../render/ventanas.js";
import { explosion } from "../render/efectos-visuales.js";
import * as avatar from "../render/avatar-ia.js";
import { musicaDeFinal } from "../modules/audio/director-musical.js";
import { registrarPartida } from "../services/servicio-partidas.js";
import { esFalloDeConexion } from "../services/cliente-http.js";
import { buscar, crearElemento, escribirTexto } from "../utils/dom.js";
import { esperar } from "../utils/tiempo.js";
import { MODO_DIAGNOSTICO } from "../utils/diagnostico.js";
import { JUGADOR } from "../modules/constantes.js";

const ESPERA_ANTES_DEL_RESUMEN_MS = 700;

/** Estadísticas que se enseñan en la tarjeta final. */
function filasDeEstadisticas(partida) {
  const e = partida.estadisticas;

  return [
    ["RONDAS", partida.ronda],
    ["GANADAS", e.victorias],
    ["MEJOR CADENA", e.mejorRacha],
    ["SELLOS", e.sellos],
    ["DAÑO HECHO", e.danoHecho],
    ["DUELOS GANADOS", e.duelosGanados],
    ["DUELOS PERDIDOS", e.duelosPerdidos],
    ["PODERES USADOS", e.poderesUsados],
  ];
}

/** Rellena la cuadrícula de estadísticas. */
function pintarEstadisticas(partida) {
  const contenedor = buscar("#estadisticas-fin");
  contenedor.innerHTML = "";

  filasDeEstadisticas(partida).forEach(([nombre, valor]) => {
    contenedor.appendChild(
      crearElemento("div", {
        clase: "dato-final",
        html: `<b>${valor}</b><span>${nombre}</span>`,
      }),
    );
  });
}

/** Cabecera de la tarjeta: cinta, título y subtítulo. */
function pintarCabecera(partida, haGanado, porCadenaMaxima) {
  const tarjeta = buscar("#tarjeta-fin");
  tarjeta.className = `tarjeta-modal tarjeta-fin${haGanado ? "" : " derrota"}${porCadenaMaxima ? " maxima" : ""}`;

  escribirTexto("#cinta-fin", porCadenaMaxima ? "CADENA MÁXIMA" : haGanado ? "VICTORIA" : "DERROTA");
  escribirTexto("#titulo-fin", haGanado ? "¡HAS GANADO!" : "HAS PERDIDO");

  const subtitulo = porCadenaMaxima
    ? haGanado
      ? "Sellaste piedra, papel y tijera. Victoria instantánea."
      : "La IA selló las tres tiradas. Victoria instantánea para ella."
    : haGanado
      ? `La dejaste sin vida en ${partida.ronda} rondas.`
      : `Te quedaste sin vida en la ronda ${partida.ronda}.`;

  escribirTexto("#subtitulo-fin", subtitulo);
}

/**
 * Guarda la partida en el servidor.
 * Si falla, el jugador ve el aviso pero la pantalla sigue funcionando: la
 * tabla de puntuaciones es un extra, no un requisito para jugar.
 */
async function guardarEnElServidor(partida, haGanado, porCadenaMaxima) {
  escribirTexto("#estado-guardado", "Guardando la partida...");

  try {
    const respuesta = await registrarPartida(partida, haGanado, porCadenaMaxima);
    escribirTexto("#estado-guardado", `Guardada · ${respuesta.partida.puntuacion} puntos`);
  } catch (error) {
    escribirTexto("#estado-guardado", avisoDeNoGuardada(error));
  }
}

/** Qué se dice cuando la partida no se guardó. El porqué, solo en diagnóstico. */
function avisoDeNoGuardada(error) {
  if (!MODO_DIAGNOSTICO) return "Esta vez la partida no se pudo guardar en las puntuaciones.";

  return esFalloDeConexion(error)
    ? "Sin guardar: el servidor no está encendido (arráncalo con jugar.bat o npm start)."
    : `No se pudo guardar: ${error.message}`;
}

export const escenaFin = {
  idPantalla: "pantalla-partida",

  /** @param {{partida:object, ganador:string, porCadenaMaxima:boolean}} datos */
  async entrar({ partida, ganador, porCadenaMaxima }) {
    const haGanado = ganador === JUGADOR;
    estadoDelJuego.resultadoFinal = { ganador, porCadenaMaxima };

    pintarCabecera(partida, haGanado, porCadenaMaxima);
    pintarEstadisticas(partida);

    if (haGanado) explosion(true);

    // La tarjeta final se abre encima de la arena, así que el avatar sigue
    // en pantalla y puede despedirse (o restregarlo) antes de que aparezca.
    avatar.reaccionar(haGanado ? "pierdeLaIa" : "ganaLaIa");

    await esperar(ESPERA_ANTES_DEL_RESUMEN_MS);
    abrirVentana("modal-fin");
    if (!porCadenaMaxima) musicaDeFinal(haGanado);

    guardarEnElServidor(partida, haGanado, porCadenaMaxima);
  },

  salir() {
    cerrarVentana("modal-fin");
  },
};

/** Botones de la tarjeta final. */
export function volverAlMenu() {
  gestorDeEscenas.ir("menu");
}

/** Revancha con los mismos ajustes. */
export function jugarRevancha() {
  gestorDeEscenas.ir("partida");
}
