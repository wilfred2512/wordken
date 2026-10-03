/**
 * Pinta los paneles de vida, la insignia de cadena y los sellos.
 *
 * Estas funciones vuelcan el estado en el HTML y no deciden nada. Prueba de
 * que la frontera está bien puesta: aquí no hay ni un `if` sobre quién gana.
 */
import { buscar, buscarTodos, escribirTexto, reiniciarAnimacion } from "../utils/dom.js";
import { JUGADOR, IA, BANDOS, EMPATES_PARA_BLOQUEO } from "../modules/constantes.js";
import { obtenerPersonaje } from "../modules/personajes-ia.js";

const PORCENTAJE_PELIGRO = 25;
const RACHA_PARA_INSIGNIA = 2;

/** Texto de la insignia según el estado de la cadena. */
function textoDeInsignia(cadena, nivel) {
  if (cadena.racha === 0) return "SIN CADENA";
  if (cadena.racha === 1) return "RACHA 1";

  return nivel === 3 ? `TRIPLE · ${cadena.racha}` : `DOBLE · ${cadena.racha}`;
}

/** Barra de vida y números del bando. */
function pintarVida(partida, bando) {
  const combatiente = partida.combatiente[bando];
  const porcentaje = combatiente.porcentajeDeVida();

  escribirTexto(`#vida-actual-${bando}`, combatiente.vida);
  escribirTexto(`#vida-maxima-${bando}`, combatiente.vidaMaxima);

  const relleno = buscar(`#barra-${bando}`);
  const fantasma = buscar(`#fantasma-${bando}`);

  relleno.style.width = `${porcentaje}%`;
  fantasma.style.width = `${porcentaje}%`;
  relleno.classList.toggle("baja", porcentaje <= PORCENTAJE_PELIGRO);
}

/** Insignia de cadena y huecos de sellos. */
function pintarCadena(partida, bando) {
  const cadena = partida.cadena[bando];
  const nivel = cadena.racha >= RACHA_PARA_INSIGNIA ? cadena.nivel() : 1;
  const insignia = buscar(`#insignia-${bando}`);

  insignia.className = `insignia-cadena${cadena.racha >= RACHA_PARA_INSIGNIA ? ` nivel${nivel}` : ""}`;
  insignia.querySelector(".insignia-multiplicador").textContent = `x${nivel}`;
  insignia.querySelector(".insignia-texto").textContent = textoDeInsignia(cadena, nivel);

  buscarTodos(`#sellos-${bando} .sello`).forEach((hueco) => {
    hueco.classList.toggle("activo", cadena.sellos.includes(hueco.dataset.tirada));
  });
}

/** Contador de empates seguidos, para que el bloqueo no salga de la nada. */
function pintarContadorDeEmpates(partida) {
  const contador = buscar("#contador-empates");
  contador.hidden = partida.empatesSeguidos === 0;

  if (contador.hidden) return;

  contador.querySelector("b").textContent = partida.empatesSeguidos;
  contador.querySelector("i").textContent = `/${EMPATES_PARA_BLOQUEO}`;
  contador.classList.toggle("caliente", partida.empatesSeguidos >= EMPATES_PARA_BLOQUEO - 1);
}

/** Cabecera con nombres, ronda y dificultad. */
function pintarCabecera(partida) {
  const numero = buscar("#numero-ronda");

  // Solo se anima cuando el número cambia de verdad: si se reanimara en cada
  // repintado, el contador estaría dando saltos toda la partida.
  if (numero.textContent !== String(partida.ronda)) {
    numero.textContent = partida.ronda;
    reiniciarAnimacion(numero, "cambia");
  }

  const rival = obtenerPersonaje(partida.ajustes.dificultad);

  escribirTexto("#nombre-jugador", partida.ajustes.nombre.toUpperCase());
  escribirTexto("#nombre-ia", rival.nombre);
  escribirTexto("#etiqueta-dificultad", rival.etiqueta);
}

/** Repinta todo el HUD desde el estado actual. */
export function pintarHud(partida) {
  if (!partida) return;

  pintarCabecera(partida);

  BANDOS.forEach((bando) => {
    pintarVida(partida, bando);
    pintarCadena(partida, bando);
  });

  pintarContadorDeEmpates(partida);

  const porcentajeJugador = partida.combatiente[JUGADOR].porcentajeDeVida();
  document.body.classList.toggle("en-peligro", porcentajeJugador <= PORCENTAJE_PELIGRO);
}

/** Identificador del panel de un bando, para los efectos. */
export function idHudDe(bando) {
  return bando === IA ? "#hud-ia" : "#hud-jugador";
}
