/**
 * Qué impacto toca en cada momento de la partida.
 *
 * Hay dos momentos distintos, y por eso dos funciones públicas:
 *
 *   · AL ACTIVAR un poder que actúa en el acto (ganzúa, candado, bomba,
 *     mamajuana): primero sale su fanfarria y, cuando se apaga, su impacto
 *     sobre lo que toca.
 *   · DURANTE LA RONDA, los poderes que esperaban a que pasara algo (el
 *     martillo espera a que ganes, el espejo a que pierdas...): aquí ya no
 *     hay fanfarria que tape la mesa, solo el impacto con su etiqueta, para
 *     que se vea el martillo cayendo sobre la barra y no un cartel encima.
 *
 * Cada impacto repinta el marcador en el instante del golpe (`alGolpear`).
 * Así la barra baja cuando la toca el martillo, y no un segundo antes.
 *
 * Este archivo no decide nada del juego: lee el parte que devolvió el motor
 * y elige la escena que lo cuenta.
 */
import { lanzarImpacto } from "../render/impactos.js";
import { lanzarFanfarria } from "../render/fanfarria-poder.js";
import { pintarHud } from "../render/pintor-hud.js";
import { obtenerPoder } from "../modules/catalogo-poderes.js";
import { esperar, esperarSaltable } from "../utils/tiempo.js";
import { TIRADA_PISTOLA, TIRADA_ESCUDO } from "../modules/reglas-tiradas.js";
import { JUGADOR, IA, RITMO } from "../modules/constantes.js";
import { RESULTADO_EMPATE } from "../modules/resolutor-tiradas.js";

/** Poderes cuyo efecto se ve en el mismo momento de activarlos. */
const IMPACTO_AL_ACTIVAR = ["ganzua", "candado", "bomba", "mamajuana"];

/** Lo que se deja a la fanfarria para apagarse antes de que entre el impacto. */
const PAUSA_TRAS_FANFARRIA_MS = 650;

/** true si el poder tiene impacto propio al activarse. */
export function tieneImpactoAlActivar(idPoder) {
  return IMPACTO_AL_ACTIVAR.includes(idPoder);
}

/** La nota corta que acompaña al impacto de una activación. */
function notaDeActivacion(idPoder, resultado) {
  const notas = {
    bomba: () => `-${resultado.danoDirecto ?? 0}`,
    mamajuana: () => (resultado.curado > 0 ? `+${resultado.curado}` : "vida llena"),
    ganzua: () => (resultado.selloGanado ? `sello de ${resultado.selloGanado}` : "ya estaba todo sellado"),
    candado: () => (resultado.vetada ? `sin ${resultado.vetada} · ${obtenerPoder("candado").rondas} rondas` : ""),
  };

  return notas[idPoder]?.() ?? "";
}

/**
 * El impacto de un poder recién activado, tras su fanfarria.
 * @param {object} resultado lo que devolvió activarPoder (sello, daño, veto...)
 */
export async function escenificarActivacion(partida, bando, idPoder, resultado) {
  if (!tieneImpactoAlActivar(idPoder)) return;

  await esperar(PAUSA_TRAS_FANFARRIA_MS);

  const duracion = lanzarImpacto(idPoder, bando, {
    nota: notaDeActivacion(idPoder, resultado),
    tirada: idPoder === "ganzua" ? resultado.selloGanado : resultado.vetada,
    alGolpear: () => pintarHud(partida),
  });

  await esperarSaltable(duracion);
}

/** Quién ha jugado esa carta especial, o null. */
function quienJuega(parte, carta) {
  if (parte.cartasJugador.includes(carta)) return JUGADOR;
  if (parte.cartasIa.includes(carta)) return IA;
  return null;
}

/** Qué escena cuenta las cartas especiales de esta ronda, o null si no hay. */
function escenaDeLasCartas(parte) {
  const tirador = quienJuega(parte, TIRADA_PISTOLA);
  const escudado = quienJuega(parte, TIRADA_ESCUDO);

  if (tirador && escudado && tirador !== escudado) {
    return ["disparo-bloqueado", tirador, "¡BLOQUEADO!"];
  }
  if (tirador) return ["disparo", tirador, "¡PUM!"];
  if (escudado) return ["escudo-roto", escudado, "no había tiro que parar"];

  return null;
}

/** La pistola dispara a la carta rival (o contra su escudo) nada más verse. */
export async function escenificarCartasEspeciales(parte) {
  const escena = escenaDeLasCartas(parte);
  if (!escena) return;

  const [idEscena, bando, nota] = escena;
  await esperarSaltable(lanzarImpacto(idEscena, bando, { nota }));
}

/** Cómo ha salido la apuesta del DOBLE O NADA. */
function notaDeLaApuesta(parte) {
  if (parte.resultado === RESULTADO_EMPATE) return "nada";
  return parte.resultado === parte.apostante ? "¡DOBLE!" : "doble castigo";
}

/** Los poderes que han actuado esta ronda, en el orden en que se cuentan. */
function impactosDeLaRonda(parte) {
  const lista = [];

  if (parte.apostante) lista.push(["dobleONada", parte.apostante, notaDeLaApuesta(parte)]);
  if (parte.ruleta > 1) lista.push(["ruleta", parte.ganador, `x${parte.ruleta}`]);
  if (parte.espejoSalto) lista.push(["espejo", parte.ganador, "¡rebotado!"]);
  if (parte.martillo > 0) lista.push(["martillo", parte.ganador, `+${parte.martillo}`]);
  if (parte.curacion > 0) lista.push(["vampiro", parte.ganador, `+${parte.curacion} robada`]);

  return lista;
}

/** El poder que la IA ha decidido gastar al cerrar la ronda. */
async function escenificarPoderDeLaIa(partida, parte) {
  const poder = parte.poderDeLaIa;
  if (!poder) return;

  lanzarFanfarria(poder.idPoder, IA, poder.texto);

  if (tieneImpactoAlActivar(poder.idPoder)) {
    await escenificarActivacion(partida, IA, poder.idPoder, poder);
    return;
  }

  await esperarSaltable(RITMO.fanfarria);
}

/**
 * Todos los impactos de la ronda, uno detrás de otro: dos a la vez se
 * taparían. Cada uno repinta el marcador cuando golpea.
 */
export async function escenificarImpactosDeRonda(partida, parte) {
  const repintar = () => pintarHud(partida);

  for (const [idEscena, bando, nota] of impactosDeLaRonda(parte)) {
    await esperarSaltable(lanzarImpacto(idEscena, bando, { nota, alGolpear: repintar }));
  }

  await escenificarPoderDeLaIa(partida, parte);
}
