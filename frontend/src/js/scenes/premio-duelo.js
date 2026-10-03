/**
 * El premio y el castigo del duelo de palabras.
 *
 * Si ganas eliges bonificación; si pierdes, esa bonificación se la queda la
 * IA. Es la parte que engancha el minijuego con la partida principal: el
 * Wordle no es un adorno, reparte armas.
 */
import { IDS_SORTEABLES } from "../modules/catalogo-poderes.js";
import { OPCIONES_POR_INTENTOS_RESTANTES, JUGADOR, IA, RITMO } from "../modules/constantes.js";
import { tomarAlAzar, elegirAlAzar } from "../utils/azar.js";
import { pintarEleccionDePoder } from "../render/pintor-poderes.js";
import { abrirVentana, cerrarVentana } from "../render/ventanas.js";
import { lanzarFanfarria } from "../render/fanfarria-poder.js";
import { chispasDePoder } from "../render/efectos-visuales.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { esperarSaltable } from "../utils/tiempo.js";
import { buscar, escribirTexto } from "../utils/dom.js";

const MAXIMO_DE_OPCIONES = 3;

/**
 * Cuántas bonificaciones puede elegir el jugador.
 * Cuantos menos intentos haya gastado, más donde elegir: premia resolver
 * la palabra rápido en vez de a la quinta.
 */
function cuantasOpciones(intentosRestantes) {
  return OPCIONES_POR_INTENTOS_RESTANTES[intentosRestantes] ?? MAXIMO_DE_OPCIONES;
}

/**
 * Enseña el menú de premios y espera a que el jugador elija.
 * @returns {Promise<string>} identificador del poder elegido
 */
function pedirEleccion(opciones) {
  return new Promise((elegido) => {
    pintarEleccionDePoder(opciones, (idPoder) => {
      cerrarVentana("modal-premio");
      elegido(idPoder);
    });

    escribirTexto(
      "#premio-subtitulo",
      opciones.length > 1 ? `Elige ${1} de ${opciones.length}` : "Tu recompensa",
    );
    abrirVentana("modal-premio");
  });
}

/**
 * El jugador ha ganado el duelo: elige bonificación.
 * @returns {Promise<void>}
 */
export async function entregarPremio(partida, ronda) {
  const cuantas = cuantasOpciones(ronda.intentosRestantes());
  const opciones = tomarAlAzar(IDS_SORTEABLES, cuantas);

  gestorAudio.efecto("poderGanado");
  chispasDePoder(JUGADOR);

  const elegido = await pedirEleccion(opciones);

  partida.mochila[JUGADOR].guardar(elegido);
  partida.estadisticas.duelosGanados++;

  lanzarFanfarria(elegido, JUGADOR, "actívalo desde tu mochila cuando quieras");
  await esperarSaltable(RITMO.cartelCorto);
}

/**
 * El jugador ha perdido el duelo: la bonificación se la lleva la IA.
 * @returns {Promise<void>}
 */
export async function entregarCastigo(partida, palabraSecreta) {
  const robado = elegirAlAzar(IDS_SORTEABLES);

  partida.mochila[IA].guardar(robado);
  partida.estadisticas.duelosPerdidos++;

  escribirTexto("#premio-subtitulo", "");

  lanzarFanfarria(robado, IA, `la palabra era ${palabraSecreta}`);
  await esperarSaltable(RITMO.cartelCorto);
}

/** Oculta el menú de premios si quedó abierto al salir de la escena. */
export function cerrarMenuDePremios() {
  const ventana = buscar("#modal-premio");
  if (ventana && !ventana.hidden) cerrarVentana("modal-premio");
}
