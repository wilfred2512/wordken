/**
 * El motor de la ronda: la pieza que decide qué ha pasado.
 *
 * Idea central del proyecto: este archivo NO pinta nada. Recibe la jugada,
 * cambia el estado y devuelve un PARTE DE RONDA. La escena lee ese parte y lo
 * escenifica con animaciones y sonido. Por eso se puede probar la partida
 * entera desde la consola sin que haya una sola carta en pantalla.
 */
import { resolverJugada, RESULTADO_EMPATE } from "./resolutor-tiradas.js";
import { crecerCadena, romperCadena } from "./gestion-cadenas.js";
import { calcularDano, explicarDano } from "./calculo-dano.js";
import {
  aplicarVampiro,
  intentarEspejo,
  activarPoder,
  limpiarEscudosSinAmenaza,
} from "./efectos-poderes.js";
import { repartirBloqueos, comprobarUmbrales } from "./eventos-de-ronda.js";
import { JUGADOR, IA, BANDOS, EMPATES_PARA_BLOQUEO, bandoContrario } from "./constantes.js";
import { TIRADA_PISTOLA, TIRADA_ESCUDO, comparar, VEREDICTO } from "./reglas-tiradas.js";

/** Cartas que se gastan en cuanto se juegan, ganen o pierdan. */
const CARTAS_ESPECIALES = [TIRADA_PISTOLA, TIRADA_ESCUDO];

/** Parte de ronda en blanco. */
function parteVacio() {
  return {
    cartasJugador: [],
    cartasIa: [],
    apostante: null,
    resultado: RESULTADO_EMPATE,
    ganador: null,
    perdedor: null,
    nivel: 1,
    dano: 0,
    explicacion: "",
    ruleta: 1,
    martillo: 0,
    curacion: 0,
    espejoSalto: false,
    tiradaSellada: null,
    cadenaMaxima: false,
    duelosDesbloqueados: 0,
    poderDeLaIa: null,
    comentarioDelRival: null,
    anuncios: [],
    cruces: [],
  };
}

/** El bando que tiene DOBLE O NADA activo, o null. */
function buscarApostante(partida) {
  return BANDOS.find((bando) => partida.mochila[bando].estaActivo("dobleONada")) ?? null;
}

/** Las cartas que juega la IA esta ronda. */
function elegirCartasDeLaIa(partida, apostante, sugerida) {
  const memoria = partida.memoriaParaIa();
  const vetada = partida.tiradaVetadaDe(IA);
  const primera = partida.oponente.elegirTiradaConPoderes(
    memoria,
    vetada,
    partida.mochila[IA],
    partida.mochila[JUGADOR],
    sugerida,
  );

  if (apostante !== IA) return [primera];

  return [primera, partida.oponente.elegirSegundaTirada(primera)];
}

/**
 * El espejo del perdedor convierte la derrota en victoria.
 * @returns {{resultado:string, espejoSalto:boolean}}
 */
function aplicarEspejo(partida, resultado) {
  if (resultado === RESULTADO_EMPATE) return { resultado, espejoSalto: false };

  const perdedor = bandoContrario(resultado);
  if (!intentarEspejo(partida, perdedor)) return { resultado, espejoSalto: false };

  return { resultado: perdedor, espejoSalto: true };
}

/**
 * Gasta las cartas especiales que se hayan jugado, para que no valgan dos
 * veces. Se gastan aunque pierdan: disparar y fallar cuesta la bala igual.
 */
function consumirCartasEspeciales(partida, parte) {
  const jugadas = { [JUGADOR]: parte.cartasJugador, [IA]: parte.cartasIa };

  BANDOS.forEach((bando) => {
    CARTAS_ESPECIALES.forEach((carta) => {
      if (jugadas[bando].includes(carta)) partida.mochila[bando].consumir(carta);
    });
  });
}

/** Rama de empate: ni daño ni rotura de cadena, pero sí cuenta para el bloqueo. */
function procesarEmpate(partida, parte) {
  partida.estadisticas.empates++;
  partida.empatesSeguidos++;

  if (partida.empatesSeguidos < EMPATES_PARA_BLOQUEO) return;

  parte.anuncios.push(repartirBloqueos(partida));
  partida.empatesSeguidos = 0;
  partida.estadisticas.bloqueos++;
}

/** Apunta el daño y la curación en las estadísticas del jugador. */
function anotarEstadisticas(partida, ganador, dano) {
  const estadisticas = partida.estadisticas;

  if (ganador === JUGADOR) {
    estadisticas.victorias++;
    estadisticas.danoHecho += dano;
  } else {
    estadisticas.derrotas++;
    estadisticas.danoRecibido += dano;
  }

  estadisticas.mejorRacha = Math.max(estadisticas.mejorRacha, partida.cadena[JUGADOR].racha);
  estadisticas.sellos = partida.cadena[JUGADOR].sellos.length;
}

/**
 * La carta con la que se ganó, que es la que sella.
 * Con DOBLE O NADA puede ser la segunda, así que se busca cuál venció de
 * verdad en vez de dar por hecho que fue la primera.
 */
function elegirTiradaGanadora(parte, ganador) {
  const propias = ganador === JUGADOR ? parte.cartasJugador : parte.cartasIa;
  const rival = ganador === JUGADOR ? parte.cartasIa[0] : parte.cartasJugador[0];

  return propias.find((carta) => comparar(carta, rival) === VEREDICTO.GANA) ?? propias[0];
}

/** Rama de victoria: cadenas, daño, vampiro y medidor de carga. */
function procesarVictoria(partida, parte, multiplicadorDeJugada) {
  const ganador = parte.resultado;
  const perdedor = bandoContrario(ganador);
  const tiradaGanadora = elegirTiradaGanadora(parte, ganador);

  partida.empatesSeguidos = 0;

  const crecimiento = crecerCadena(partida.cadena[ganador], tiradaGanadora);
  parte.anuncios.push(...crecimiento.anuncios);
  parte.anuncios.push(...romperCadena(partida.cadena[perdedor], perdedor));

  Object.assign(parte, {
    ganador,
    perdedor,
    nivel: crecimiento.nivel,
    tiradaSellada: crecimiento.tiradaSellada,
    cadenaMaxima: crecimiento.esCadenaMaxima,
  });

  if (crecimiento.esCadenaMaxima) return;

  aplicarGolpe(partida, parte, multiplicadorDeJugada);
}

/** Resta la vida, cura al vampiro y llena el círculo de carga. */
function aplicarGolpe(partida, parte, multiplicadorDeJugada) {
  const { ganador, perdedor, nivel } = parte;
  const calculo = calcularDano(partida, ganador, nivel, multiplicadorDeJugada);

  parte.dano = partida.combatiente[perdedor].recibirDano(calculo.total);
  parte.explicacion = explicarDano(nivel, multiplicadorDeJugada, calculo.ruleta, calculo.martillo);
  parte.ruleta = calculo.ruleta;
  parte.martillo = calculo.martillo;
  parte.curacion = aplicarVampiro(partida, ganador, parte.dano);

  if (ganador === JUGADOR) {
    parte.duelosDesbloqueados = partida.medidor.sumarDano(parte.dano);
  }

  anotarEstadisticas(partida, ganador, parte.dano);
}

/**
 * Resuelve una ronda completa.
 *
 * @param {object} partida
 * @param {string[]} cartasJugador una carta, o dos con DOBLE O NADA
 * @returns {object} parte de ronda
 */
export function resolverRonda(partida, cartasJugador) {
  const parte = parteVacio();
  const apostante = buscarApostante(partida);

  // LA MENTE contesta mientras el jugador decide, así que aquí el consejo o
  // ya está o no llegó a tiempo: en ningún caso se espera por él.
  const consejo = partida.oponente.consumirConsejo();

  parte.apostante = apostante;
  parte.comentarioDelRival = consejo?.comentario ?? null;
  parte.cartasJugador = cartasJugador;
  parte.cartasIa = elegirCartasDeLaIa(partida, apostante, consejo?.tirada);

  const jugada = resolverJugada({ ...parte, apostante });
  const conEspejo = aplicarEspejo(partida, jugada.resultado);

  parte.resultado = conEspejo.resultado;
  parte.espejoSalto = conEspejo.espejoSalto;

  registrarJugada(partida, parte);
  consumirCartasEspeciales(partida, parte);
  if (apostante) partida.mochila[apostante].consumir("dobleONada");

  if (parte.resultado === RESULTADO_EMPATE) procesarEmpate(partida, parte);
  else procesarVictoria(partida, parte, jugada.multiplicadorDeJugada);

  parte.cruces = comprobarUmbrales(partida);
  cerrarRonda(partida, parte);

  return parte;
}

/** Apunta la jugada en el historial y en la memoria de la IA. */
function registrarJugada(partida, parte) {
  partida.tiradasDelJugador.push(parte.cartasJugador[0]);
  partida.apuntarEnHistorial({
    tiradaJugador: parte.cartasJugador[0],
    tiradaIa: parte.cartasIa[0],
    resultado: parte.resultado,
  });
}

/**
 * La IA decide si gasta uno de sus poderes.
 *
 * Se hace al FINAL de la ronda y no al principio: así el jugador ve el poder
 * en la mochila del rival ANTES de elegir su siguiente carta. Si la IA sacara
 * la pistola al empezar la ronda, el jugador ya habría elegido y no tendría
 * forma de reaccionar.
 */
function activarPoderDeLaIa(partida) {
  const elegido = partida.oponente.elegirPoderParaActivar(partida.mochila[IA]);
  if (!elegido) return null;

  const resultado = activarPoder(partida, IA, elegido);
  if (!resultado.activado) return null;

  // Se devuelve el resultado entero (sello robado, daño de la bomba, carta
  // vetada...) porque la escena necesita esos datos para apuntar el impacto.
  return { idPoder: elegido, ...resultado };
}

/** Descuenta rondas a vetos y poderes, y deja que la IA mueva ficha. */
function cerrarRonda(partida, parte) {
  partida.avanzarVetos();
  BANDOS.forEach((bando) => partida.mochila[bando].avanzarRonda());

  limpiarEscudosSinAmenaza(partida);
  parte.poderDeLaIa = activarPoderDeLaIa(partida);
}
