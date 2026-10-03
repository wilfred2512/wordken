/**
 * Catálogo de bonificaciones que se ganan en el duelo de palabras.
 *
 * Es una tabla de datos: el comportamiento lo aplica efectos-poderes.js. Para
 * inventar un poder nuevo se añade una entrada aquí y un caso allí, sin tocar
 * nada más.
 *
 * Todos los poderes son simétricos: si el jugador pierde el duelo, el mismo
 * poder pasa a la IA y funciona igual. Por eso ninguno menciona "tú".
 */

/** Cuánto dura cada efecto. */
export const DURACION = {
  INMEDIATO: "inmediato",
  UN_USO: "un-uso",
  RONDAS: "rondas",
};

export const PODERES = {
  pistola: {
    id: "pistola",
    nombre: "PISTOLA",
    simbolo: "🔫",
    color: "var(--rojo)",
    gesto: "disparo",
    duracion: DURACION.UN_USO,
    resumen: "Una carta que vence a piedra, papel y tijera. Ojo: el rival recibe un escudo.",
    detalle:
      "Al activarla aparece una cuarta carta en tu mano y se queda hasta que la " +
      "dispares. Gana a las tres tiradas normales, pero en el mismo momento el " +
      "rival recibe un ESCUDO, así que disparar es una apuesta.",
  },

  escudo: {
    id: "escudo",
    nombre: "ESCUDO",
    simbolo: "🛡️",
    color: "var(--verde)",
    gesto: "muro",
    duracion: DURACION.UN_USO,
    esConcedido: true,
    resumen: "Para la pistola. Pierde contra piedra, papel y tijera.",
    detalle:
      "No se gana en un duelo: lo recibes automáticamente cuando el rival " +
      "activa su PISTOLA. Solo sirve contra ella; si lo juegas y el rival no " +
      "dispara, pierdes la ronda y te quedas sin escudo.",
  },

  dobleONada: {
    id: "dobleONada",
    nombre: "DOBLE O NADA",
    simbolo: "🎲",
    color: "var(--naranja)",
    gesto: "dados",
    duracion: DURACION.UN_USO,
    resumen: "Juegas dos cartas a la vez. Si las dos ganan, daño doble.",
    detalle:
      "Eliges dos tiradas contra la única del rival. Si las dos ganan, el daño " +
      "se multiplica por dos. Si una gana y otra pierde, no hay daño. Si las " +
      "dos pierden, recibes el doble.",
  },

  espejo: {
    id: "espejo",
    nombre: "ESPEJO",
    simbolo: "🪞",
    color: "var(--azul)",
    gesto: "reflejo",
    duracion: DURACION.UN_USO,
    resumen: "La próxima derrota se convierte en victoria.",
    detalle:
      "Se gasta solo, en el momento exacto en que ibas a perder una ronda. " +
      "El golpe rebota y lo recibe el rival.",
  },

  ganzua: {
    id: "ganzua",
    nombre: "GANZÚA",
    simbolo: "🗝️",
    color: "var(--morado)",
    gesto: "llave",
    duracion: DURACION.INMEDIATO,
    resumen: "Sella al instante una tirada que te falte.",
    detalle:
      "Atajo directo hacia la CADENA MÁXIMA: regala uno de los tres sellos " +
      "sin tener que encadenar dos victorias con esa tirada.",
  },

  vampiro: {
    id: "vampiro",
    nombre: "VAMPIRO",
    simbolo: "🦇",
    color: "var(--verde)",
    gesto: "colmillos",
    duracion: DURACION.RONDAS,
    rondas: 3,
    resumen: "Durante 3 rondas, el daño que haces también te cura.",
    detalle:
      "Cada golpe que conectes te devuelve la misma cantidad de vida, sin " +
      "pasar de tu vida máxima.",
  },

  martillo: {
    id: "martillo",
    nombre: "MARTILLO",
    simbolo: "🔨",
    color: "var(--amarillo)",
    gesto: "impacto",
    duracion: DURACION.UN_USO,
    bonificacionPlana: 3,
    resumen: "Tu próxima victoria suma +3 de daño plano.",
    detalle:
      "Los +3 se suman DESPUÉS del multiplicador de cadena, así que con una " +
      "triple cadena el golpe es de 3 x 1 + 3 = 6.",
  },

  candado: {
    id: "candado",
    nombre: "CANDADO",
    simbolo: "🔒",
    color: "var(--pizarra)",
    gesto: "cerrojo",
    duracion: DURACION.RONDAS,
    rondas: 2,
    resumen: "Prohíbe al rival su tirada favorita durante 2 rondas.",
    detalle:
      "Se calcula mirando qué tirada ha usado más el rival hasta ahora. " +
      "Si aún no hay historial, se elige una al azar.",
  },

  ruleta: {
    id: "ruleta",
    nombre: "RULETA",
    simbolo: "🎰",
    color: "var(--rojo-oscuro)",
    gesto: "giro",
    duracion: DURACION.UN_USO,
    multiplicadorMinimo: 1,
    multiplicadorMaximo: 5,
    resumen: "La próxima ronda el multiplicador es aleatorio, de x1 a x5.",
    detalle:
      "Afecta a quien gane la ronda, seas tú o el rival. Es el poder más " +
      "arriesgado del catálogo y el que más ruido hace.",
  },

  bomba: {
    id: "bomba",
    nombre: "BOMBA",
    simbolo: "💣",
    color: "var(--naranja)",
    gesto: "explosion",
    duracion: DURACION.INMEDIATO,
    danoDirecto: 3,
    resumen: "3 de daño directo al rival, al momento y sin jugar ronda.",
    detalle:
      "El único poder que hace daño sin ganar una ronda. No mira cadenas ni " +
      "multiplicadores: son 3 puntos secos, y pueden acabar la partida.",
  },

  mamajuana: {
    id: "mamajuana",
    nombre: "MAMAJUANA",
    simbolo: "🍾",
    color: "var(--verde)",
    gesto: "brindis",
    duracion: DURACION.INMEDIATO,
    curacion: 4,
    resumen: "Recupera 4 de vida al instante. ¡Salud!",
    detalle:
      "Cura en el momento de activarla, sin pasar de la vida máxima. " +
      "Guardarla para cuando estés en rojo es la gracia.",
  },
};

/** Todos los identificadores del catálogo. */
export const IDS_DE_PODERES = Object.keys(PODERES);

/**
 * Los que se pueden sortear como premio de un duelo.
 * El ESCUDO queda fuera: no es un premio, es la respuesta automática a la
 * pistola. Si pudiera tocar en un sorteo, saldría sin nada que parar.
 */
export const IDS_SORTEABLES = IDS_DE_PODERES.filter((id) => !PODERES[id].esConcedido);

/** Datos de un poder por su identificador. */
export function obtenerPoder(id) {
  return PODERES[id] ?? null;
}
