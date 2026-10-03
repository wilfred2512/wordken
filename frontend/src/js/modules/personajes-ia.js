/**
 * Quién es la IA en cada dificultad.
 *
 * Hasta ahora la dificultad era solo un número: cuánta memoria usaba el
 * rival. Aquí se le pone CARA y VOZ, de manera que jugar en fácil y jugar en
 * difícil no se sientan igual aunque el tablero sea el mismo.
 *
 * Este archivo es solo datos: ni pinta ni decide nada. Las frases están en
 * frases-avatar.js y el dibujo en render/avatar-ia.js, para que cambiar lo
 * que dice el rival no obligue a tocar cómo se ve.
 *
 * `mente` es la cuarta dificultad, la que mueve un modelo de lenguaje de
 * verdad. Si el servidor no tiene clave configurada, juega con la estrategia
 * difícil y habla con estas frases de repuesto, así que el juego nunca se
 * queda a medias por no tener internet.
 */

export const PERSONAJES = {
  facil: {
    id: "facil",
    nombre: "EL MONGOLO",
    etiqueta: "FÁCIL",
    lema: "no sabe ni cómo se juega, pero ahí está",
    color: "var(--verde)",
    caras: { quieto: "😵‍💫", contento: "🤪", molesto: "😭", pensando: "🥴" },
  },

  normal: {
    id: "normal",
    nombre: "UNA GENTE",
    etiqueta: "NORMAL",
    lema: "ni bueno ni malo, juega y se va",
    color: "var(--azul)",
    caras: { quieto: "🙂", contento: "😃", molesto: "😕", pensando: "🤔" },
  },

  dificil: {
    id: "dificil",
    nombre: "EL TÍGUERE",
    etiqueta: "DIFÍCIL",
    lema: "te lee los patrones y se burla mientras",
    color: "var(--morado)",
    caras: { quieto: "😎", contento: "😏", molesto: "😤", pensando: "🤨" },
  },

  mente: {
    id: "mente",
    nombre: "EL GENIO",
    etiqueta: "EXTREMA",
    lema: "una IA de verdad al otro lado de la mesa",
    color: "var(--rojo)",
    caras: { quieto: "🧠", contento: "👁️", molesto: "⚡", pensando: "💭" },
    usaModeloReal: true,
  },
};

/** Los identificadores, en el orden en que salen en el menú. */
export const IDS_DE_DIFICULTAD = Object.keys(PERSONAJES);

/** Personaje de una dificultad, con el normal de respaldo. */
export function obtenerPersonaje(dificultad) {
  return PERSONAJES[dificultad] ?? PERSONAJES.normal;
}

/**
 * Qué estrategia mueve las fichas de cada dificultad.
 *
 * LA MENTE apunta a `dificil` porque ese es su plan B: mientras el servidor
 * responde, o si no hay clave, alguien tiene que decidir la tirada. El motor
 * pide el consejo del modelo aparte, y si llega a tiempo manda ese.
 */
export function estrategiaDe(dificultad) {
  return obtenerPersonaje(dificultad).usaModeloReal ? "dificil" : dificultad;
}
