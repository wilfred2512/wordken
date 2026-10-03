/**
 * Qué hace cada poder cuando se activa y cuando surte efecto.
 *
 * El catálogo dice CÓMO SE LLAMAN y CUÁNTO DURAN; este archivo dice QUÉ HACEN.
 * Separarlos permite enseñar la lista de poderes en el menú sin arrastrar
 * ninguna regla de partida.
 */
import { obtenerPoder } from "./catalogo-poderes.js";
import { TIRADAS, TIRADA_PISTOLA, TIRADA_ESCUDO } from "./reglas-tiradas.js";
import { JUGADOR, BANDOS, bandoContrario } from "./constantes.js";
import { elegirAlAzar, enteroAlAzar } from "../utils/azar.js";

/** Tiradas que el bando ha usado a lo largo de la partida. */
function tiradasUsadasPor(partida, bando) {
  const clave = bando === JUGADOR ? "tiradaJugador" : "tiradaIa";
  return partida.historial.map((entrada) => entrada[clave]).filter(Boolean);
}

/** La tirada que más ha repetido ese bando, o una al azar si no hay datos. */
function tiradaFavoritaDe(partida, bando) {
  const usadas = tiradasUsadasPor(partida, bando);
  if (usadas.length === 0) return elegirAlAzar(TIRADAS);

  const cuenta = { piedra: 0, papel: 0, tijera: 0 };
  usadas.forEach((tirada) => {
    if (cuenta[tirada] !== undefined) cuenta[tirada]++;
  });

  return TIRADAS.reduce((mejor, tirada) => (cuenta[tirada] > cuenta[mejor] ? tirada : mejor));
}

/** GANZÚA: regala un sello de una tirada que todavía falte. */
function aplicarGanzua(partida, bando) {
  const cadena = partida.cadena[bando];
  const pendientes = TIRADAS.filter((tirada) => !cadena.sellos.includes(tirada));

  if (pendientes.length === 0) return { texto: "Ya tenías las tres tiradas selladas." };

  const elegida = elegirAlAzar(pendientes);
  cadena.sellarPorPoder(elegida);

  return { texto: `Sello robado: ${elegida.toUpperCase()}.`, selloGanado: elegida };
}

/** CANDADO: veta al rival su tirada favorita. */
function aplicarCandado(partida, bando) {
  const rival = bandoContrario(bando);
  const favorita = tiradaFavoritaDe(partida, rival);
  const poder = obtenerPoder("candado");

  partida.vetarTirada(rival, favorita, poder.rondas);

  return { texto: `El rival se queda sin ${favorita.toUpperCase()}.` };
}

/**
 * PISTOLA: el rival recibe al instante un ESCUDO.
 *
 * Es la pieza de equilibrio del juego. Sin ella la pistola era una victoria
 * regalada; con ella, disparar es una apuesta: si el rival adivina la ronda y
 * saca el escudo, el tiro se pierde y encima gana él.
 */
function entregarEscudoAlRival(partida, bando) {
  const rival = bandoContrario(bando);
  partida.mochila[rival].conceder(TIRADA_ESCUDO);

  return {
    texto: "El rival recibe un ESCUDO: disparar ya no es gratis.",
    escudoConcedido: rival,
  };
}

/**
 * BOMBA: daño directo al rival, sin necesidad de ganar una ronda.
 * Puede dejarlo a cero; quien la activa comprueba después si hay ganador.
 */
function aplicarBomba(partida, bando) {
  const rival = bandoContrario(bando);
  const dano = partida.combatiente[rival].recibirDano(obtenerPoder("bomba").danoDirecto);

  if (bando === JUGADOR) partida.estadisticas.danoHecho += dano;
  else partida.estadisticas.danoRecibido += dano;

  return { texto: `¡BOOM! ${dano} de daño directo.`, danoDirecto: dano };
}

/** MAMAJUANA: cura a quien la bebe, sin pasar de su vida máxima. */
function aplicarMamajuana(partida, bando) {
  const curado = partida.combatiente[bando].curar(obtenerPoder("mamajuana").curacion);

  return {
    texto: curado > 0 ? `+${curado} de vida. ¡Salud!` : "Ya tenías la vida llena. Salud igual.",
    curado,
  };
}

/** Poderes con efecto inmediato al activarse. */
const EFECTOS_INMEDIATOS = {
  ganzua: aplicarGanzua,
  candado: aplicarCandado,
  bomba: aplicarBomba,
  mamajuana: aplicarMamajuana,
};

/** Lo que le ocurre al OTRO bando cuando alguien activa un poder. */
const REACCIONES_DEL_RIVAL = {
  [TIRADA_PISTOLA]: entregarEscudoAlRival,
};

/**
 * Activa un poder guardado.
 * @returns {{activado:boolean, texto:string, selloGanado?:string}}
 */
export function activarPoder(partida, bando, idPoder) {
  const mochila = partida.mochila[bando];

  if (!mochila.activar(idPoder)) {
    return { activado: false, texto: "Ese poder no está en la mochila." };
  }

  if (bando === JUGADOR) partida.estadisticas.poderesUsados++;

  const efecto = EFECTOS_INMEDIATOS[idPoder];
  const reaccion = REACCIONES_DEL_RIVAL[idPoder];

  const propio = efecto ? efecto(partida, bando) : { texto: obtenerPoder(idPoder).resumen };
  const ajeno = reaccion ? reaccion(partida, bando) : {};

  // El veto del candado se devuelve aquí para que la escena sepa sobre QUÉ
  // carta dejar caer el cerrojo, sin tener que volver a calcularlo.
  const vetada = partida.tiradaVetadaDe(bandoContrario(bando));

  return { activado: true, vetada, ...propio, ...ajeno };
}

/**
 * Retira los escudos que ya no tienen nada que parar.
 *
 * Un escudo solo existe mientras el rival tenga la pistola cargada. En cuanto
 * la dispara (la acierte o se la paren), el escudo sobra: dejarlo puesto sería
 * regalar una carta que solo sabe perder.
 */
export function limpiarEscudosSinAmenaza(partida) {
  BANDOS.forEach((bando) => {
    const tieneEscudo = partida.mochila[bando].estaActivo(TIRADA_ESCUDO);
    const leApuntan = partida.mochila[bandoContrario(bando)].estaActivo(TIRADA_PISTOLA);

    if (tieneEscudo && !leApuntan) partida.mochila[bando].retirar(TIRADA_ESCUDO);
  });
}

/** MARTILLO: puntos de daño planos que se suman tras el multiplicador. */
export function bonificacionPlanaDe(partida, bando) {
  const mochila = partida.mochila[bando];
  if (!mochila.estaActivo("martillo")) return 0;

  mochila.consumir("martillo");
  return obtenerPoder("martillo").bonificacionPlana;
}

/** RULETA: multiplicador aleatorio para la ronda, o 1 si no está activa. */
export function multiplicadorDeRuleta(partida, bando) {
  const mochila = partida.mochila[bando];
  if (!mochila.estaActivo("ruleta")) return 1;

  mochila.consumir("ruleta");
  const poder = obtenerPoder("ruleta");

  return enteroAlAzar(poder.multiplicadorMinimo, poder.multiplicadorMaximo);
}

/** VAMPIRO: cura al atacante la misma cantidad que ha hecho de daño. */
export function aplicarVampiro(partida, bando, dano) {
  if (!partida.mochila[bando].estaActivo("vampiro")) return 0;

  return partida.combatiente[bando].curar(dano);
}

/**
 * ESPEJO: convierte una derrota en victoria. Se gasta solo.
 * @returns {boolean} si el espejo ha saltado
 */
export function intentarEspejo(partida, bando) {
  const mochila = partida.mochila[bando];
  if (!mochila.estaActivo("espejo")) return false;

  mochila.consumir("espejo");
  return true;
}
