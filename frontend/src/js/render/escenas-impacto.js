/**
 * Las ESCENAS de impacto: qué sale en pantalla cuando una habilidad hace lo
 * que dice, y ENCIMA DE QUÉ.
 *
 * La fanfarria (fanfarria-poder.js) anuncia un poder en el centro de la
 * pantalla. Esto es lo otro: el martillo que baja sobre la barra de vida del
 * rival, la pistola que le dispara a su carta, los murciélagos que le chupan
 * la vida y te la traen. Cada escena dice:
 *
 *   · hasta     el elemento que recibe el golpe (y qué punto de él)
 *   · desde     de dónde sale el proyectil, si lo hay
 *   · luego     a dónde rebota, si rebota (el espejo)
 *   · html      los actores; el CSS de impactos.css los mueve
 *   · duracion  ms que dura todo; el CSS lo recibe como --dura
 *   · golpe     ms en que llega el golpe: chispas, sonido, sacudida
 *   · reacciones  clases que se ponen a los elementos golpeados, y cuándo
 *
 * Es solo datos: el motor que los interpreta está en impactos.js. Para darle
 * impacto a un poder nuevo basta una entrada aquí y un bloque de CSS.
 */
import { JUGADOR } from "../modules/constantes.js";

/* Selectores de las piezas de la mesa. `c` es el contexto: { bando, rival, tirada }. */
const barra = (bando) => `#barra-${bando}`;
const cajaBarra = (bando) => `#hud-${bando} .barra`;
const carta = (bando) => `#carta-${bando}`;
const mochila = (bando) => `#mochila-${bando}`;
const centro = () => "#medidor-carga";

/** El sello que se acaba de conseguir, o la fila entera si no hay uno concreto. */
const sello = (c) => (c.tirada ? `#sellos-${c.bando} .sello[data-tirada="${c.tirada}"]` : `#sellos-${c.bando}`);

/** Sobre qué cae el candado: la carta vetada de tu mano, o el hueco de la IA. */
const objetivoDelCandado = (c) => (c.rival === JUGADOR && c.tirada
  ? `#mano .carta[data-tirada="${c.tirada}"]`
  : carta(c.rival));

const ARMA = '<i class="arma"><svg><use href="#icono-pistola"></use></svg></i>';
const DISPARO = `${ARMA}<i class="fogonazo"></i><i class="bala"></i><i class="humo">💨</i>`;

export const ESCENAS = {
  martillo: {
    poder: "martillo",
    html: '<i class="actor">🔨</i><i class="choque">💥</i><i class="onda"></i>',
    hasta: (c) => [barra(c.rival), "derecha"],
    duracion: 1150,
    golpe: 560,
    sonido: "impacto",
    chispas: "#ffd23f",
    fuerte: true,
    reacciones: [{ en: 560, selector: (c) => cajaBarra(c.rival), clase: "recibe-impacto" }],
  },

  disparo: {
    poder: "pistola",
    html: `${DISPARO}<i class="agujero"></i>`,
    desde: (c) => [carta(c.bando)],
    hasta: (c) => [carta(c.rival)],
    duracion: 1300,
    golpe: 590,
    sonido: "disparo",
    chispas: "#fff3b0",
    fuerte: true,
    reacciones: [{ en: 590, selector: (c) => carta(c.rival), clase: "recibe-disparo" }],
  },

  "disparo-bloqueado": {
    poder: "escudo",
    html: `${DISPARO}<i class="escudo">🛡️</i>`,
    desde: (c) => [carta(c.bando)],
    hasta: (c) => [carta(c.rival)],
    duracion: 1400,
    golpe: 560,
    sonido: "muro",
    chispas: "#35bd86",
    fuerte: false,
    reacciones: [{ en: 560, selector: (c) => carta(c.rival), clase: "recibe-cerrojo" }],
  },

  "escudo-roto": {
    poder: "escudo",
    html: '<i class="escudo">🛡️</i><i class="grieta">💢</i>',
    hasta: (c) => [carta(c.bando)],
    duracion: 1100,
    golpe: 600,
    sonido: "muro",
    chispas: "#9fb3c2",
  },

  dobleONada: {
    poder: "dobleONada",
    html: '<i class="dado d1">🎲</i><i class="dado d2">🎲</i>',
    desde: (c) => [carta(c.bando)],
    hasta: () => [centro()],
    duracion: 1400,
    golpe: 980,
    sonido: "dados",
    chispas: "#ff9f1c",
  },

  espejo: {
    poder: "espejo",
    html: '<i class="espejo">🪞</i><i class="orbe"></i><i class="choque">✨</i>',
    desde: (c) => [carta(c.rival)],
    hasta: (c) => [carta(c.bando)],
    luego: (c) => [cajaBarra(c.rival)],
    duracion: 1300,
    golpe: 520,
    sonido: "reflejo",
    chispas: "#9ad7ff",
    rebote: { en: 910, chispas: "#fe5f55" },
    reacciones: [{ en: 910, selector: (c) => cajaBarra(c.rival), clase: "recibe-impacto" }],
  },

  vampiro: {
    poder: "vampiro",
    html:
      '<i class="murcielago m1">🦇</i><i class="murcielago m2">🦇</i><i class="murcielago m3">🦇</i>' +
      '<i class="gota g1"></i><i class="gota g2"></i><i class="gota g3"></i><i class="gota g4"></i>',
    desde: (c) => [cajaBarra(c.bando)],
    hasta: (c) => [cajaBarra(c.rival)],
    duracion: 1500,
    golpe: 930,
    sonido: "colmillos",
    chispas: "#c0172a",
    reacciones: [
      { en: 930, selector: (c) => cajaBarra(c.rival), clase: "recibe-impacto" },
      { en: 1400, selector: (c) => cajaBarra(c.bando), clase: "recibe-cura" },
    ],
  },

  ganzua: {
    poder: "ganzua",
    html: '<i class="llave">🗝️</i><i class="cerradura">🔒</i><i class="brillo">✨</i>',
    desde: (c) => [mochila(c.bando)],
    hasta: (c) => [sello(c)],
    duracion: 1400,
    golpe: 1120,
    sonido: "llave",
    chispas: "#ffd23f",
    reacciones: [{ en: 1120, selector: (c) => sello(c), clase: "recibe-sello" }],
  },

  candado: {
    poder: "candado",
    html: '<i class="cadena c1">⛓️</i><i class="cadena c2">⛓️</i><i class="candado">🔒</i>',
    hasta: (c) => [objetivoDelCandado(c)],
    duracion: 1300,
    golpe: 715,
    sonido: "cerrojo",
    chispas: "#9fb3c2",
    fuerte: false,
    reacciones: [{ en: 715, selector: (c) => objetivoDelCandado(c), clase: "recibe-cerrojo" }],
  },

  ruleta: {
    poder: "ruleta",
    html: '<i class="rueda"></i><i class="bolita"></i><i class="premio" data-nota></i>',
    hasta: () => [centro()],
    duracion: 1700,
    golpe: 1225,
    sonido: "giro",
    chispas: "#fe5f55",
    fuerte: false,
  },

  bomba: {
    poder: "bomba",
    html:
      '<i class="proyectil"><i class="bomba">💣</i><i class="mecha">✨</i></i>' +
      '<i class="boom">💥</i><i class="onda"></i><i class="humo h1">💨</i><i class="humo h2">💨</i>',
    desde: (c) => [mochila(c.bando)],
    hasta: (c) => [cajaBarra(c.rival)],
    duracion: 1500,
    golpe: 825,
    sonido: "explosion",
    sonidoInicial: "silbido",
    chispas: "#ff7a1c",
    fuerte: true,
    reacciones: [{ en: 825, selector: (c) => cajaBarra(c.rival), clase: "recibe-impacto" }],
  },

  mamajuana: {
    poder: "mamajuana",
    html:
      '<i class="botella">🍾</i><i class="corcho"></i>' +
      '<i class="gota g1"></i><i class="gota g2"></i><i class="gota g3"></i><i class="gota g4"></i>' +
      '<i class="gota g5"></i><i class="brillo" data-nota></i>',
    hasta: (c) => [cajaBarra(c.bando)],
    duracion: 1500,
    golpe: 1125,
    sonido: "brindis",
    chispas: "#35bd86",
    reacciones: [{ en: 1125, selector: (c) => cajaBarra(c.bando), clase: "recibe-cura" }],
  },
};
