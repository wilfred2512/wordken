/**
 * Las respuestas del ayudante cuando NO hay modelo de lenguaje detrás.
 *
 * Por qué existe este archivo: el enunciado pide un chatbot que explique cómo
 * se juega, pero un chatbot que solo funciona si alguien paga una API no
 * explica nada el día que se corrige el proyecto sin clave. Así que el
 * ayudante tiene dos cerebros: si el servidor tiene modelo, contesta el
 * modelo; si no, contesta esta tabla.
 *
 * El emparejamiento es a propósito tonto —se cuentan palabras clave— porque
 * aquí lo que importa es acertar el TEMA, no entender la frase. Para entender
 * la frase ya está el modelo.
 *
 * No confundir con el manual del backend (services/manual-juego.js): aquel es
 * el contexto que lee el modelo, este son respuestas ya escritas.
 */

/** Cada entrada: palabras que la disparan y lo que se contesta. */
const RESPUESTAS = [
  {
    claves: ["empez", "inici", "jugar", "como se juega", "empiezo", "primera vez"],
    texto:
      "Elige piedra, papel o tijera (teclas 1, 2 y 3) y gánale rondas a la IA hasta dejarla sin vida. " +
      "Lo demás son capas encima: cadenas, duelos de palabras y bonificaciones.",
  },
  {
    claves: ["cadena", "racha", "multiplic", "seguidas", "sello"],
    texto:
      "Ganar rondas seguidas sube el multiplicador de daño: x2 con dos seguidas y x3 con dos más de la misma tirada. " +
      "Ganar dos veces con la MISMA tirada la deja sellada, y sellar las tres es CADENA MÁXIMA: victoria instantánea.",
  },
  {
    claves: ["duelo", "wordle", "palabra", "circulo", "círculo", "carga", "minijuego"],
    texto:
      "El círculo del centro se llena con el daño que le haces a la IA. Al llenarse se enciende el botón DUELO (tecla D) " +
      "y se abre un Wordle de jergas del español. Si lo ganas eliges una bonificación; si lo pierdes, se la queda la IA.",
  },
  {
    claves: ["pistola", "escudo", "especial"],
    texto:
      "La PISTOLA gana a piedra, papel y tijera, pero al activarla el rival recibe un ESCUDO. " +
      "El ESCUDO solo para a la pistola: contra las tres tiradas normales pierde. Disparar es una apuesta.",
  },
  {
    claves: ["poder", "bonific", "mochila", "habilidad", "carta extra"],
    texto:
      "Hay once: pistola, escudo, doble o nada, espejo, ganzúa, vampiro, martillo, candado, ruleta, " +
      "bomba (3 de daño directo) y mamajuana (cura 4). " +
      "Se ganan en el duelo y se activan pulsando su ficha en la mochila. Pasa el cursor por encima para ver qué hace cada una.",
  },
  {
    claves: ["dificult", "rival", "mongolo", "una gente", "tiguere", "tíguere", "genio", "nivel"],
    texto:
      "Cuatro rivales: EL MONGOLO tira al azar, UNA GENTE castiga que repitas, EL TÍGUERE te busca patrones " +
      "y EL GENIO piensa cada jugada con inteligencia artificial. Se eligen al configurar la partida.",
  },
  {
    claves: ["empate", "bloqueo", "prohib", "veta", "vetada"],
    texto:
      "Tras cinco empates seguidos salta el BLOQUEO: a cada uno se le prohíbe una tirada distinta durante dos rondas, " +
      "para que la partida no se quede atascada en empates.",
  },
  {
    claves: ["tecla", "atajo", "control", "raton", "ratón", "teclado"],
    texto:
      "1, 2 y 3 son piedra, papel y tijera (4 y 5 la pistola y el escudo). D abre el duelo y P pausa. " +
      "Cualquier clic o tecla se salta las animaciones si te parecen lentas.",
  },
  {
    claves: ["vida", "dano", "daño", "golpe", "cuanto quita", "cuánto quita"],
    texto:
      "Cada victoria quita daño base por el multiplicador de cadena, por el de doble o nada, por la ruleta, " +
      "y al final se suma el martillo. La vida de cada uno se configura antes de empezar.",
  },
  {
    claves: ["puntuacion", "puntuación", "ranking", "tabla", "record", "récord"],
    texto:
      "Al acabar, la partida se guarda sola y sale en PUNTUACIONES, en el menú. " +
      "Si justo entonces no hay conexión el juego sigue igual, solo que esa partida no se apunta.",
  },

  /* Las de conversación van AL FINAL a propósito: en un empate gana la que
     está antes, así que «hola, ¿qué es la cadena?» contesta lo de la cadena. */
  {
    claves: ["hola", "buenas", "buenos dias", "saludos", "klk", "que lo que", "que tal", "hey"],
    texto:
      "¡Hola! ¿En qué te ayudo? Puedo contarte cómo se juega, qué son las cadenas, " +
      "cómo va el duelo de palabras o qué hace cada bonificación.",
  },
  {
    claves: ["quien eres", "que eres", "como te llamas", "eres un bot", "eres una ia", "eres un robot"],
    texto:
      "Soy el ayudante de WordKen. Estoy aquí para explicarte el juego: reglas, cadenas, duelos, " +
      "bonificaciones y rivales.",
  },
  {
    claves: ["gracias", "thanks"],
    texto: "¡De nada! Si te queda otra duda, aquí estoy.",
  },
  {
    claves: ["adios", "chao", "hasta luego", "nos vemos"],
    texto: "¡Suerte en la partida! Si te atascas, vuelve a escribirme.",
  },
];

const TEMAS = "las cadenas, el duelo de palabras, las bonificaciones, los rivales y los controles";

/** Cuando la pregunta no va de nada que el ayudante conozca. */
const RESPUESTA_POR_DEFECTO =
  `Mmm, de eso no sé mucho. Lo mío es WordKen: ${TEMAS}. ¿Cuál te explico?`;

/**
 * Cuando había un modelo para contestar y no llegó a tiempo. Se le pide que
 * repita la pregunta, porque lo normal es que a la segunda sí conteste.
 */
const RESPUESTA_SI_SE_ATASCA =
  `Uy, me quedé en blanco un momento. ¿Me lo preguntas otra vez? Mientras tanto te puedo contar de ${TEMAS}.`;

/** Normaliza para comparar: minúsculas y sin tildes. */
function simplificar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Cuántas claves de una entrada aparecen en la pregunta. */
function puntuar(entrada, preguntaSimple) {
  return entrada.claves.filter((clave) => preguntaSimple.includes(simplificar(clave))).length;
}

/**
 * La respuesta de repuesto a una pregunta.
 * @param {string} pregunta
 * @param {{seAtasco?:boolean}} [opciones] `seAtasco` cuando el modelo debía
 *        contestar y falló: cambia lo que se dice si la tabla tampoco sabe.
 * @returns {string}
 */
export function responderSinModelo(pregunta, opciones = {}) {
  const simple = simplificar(pregunta ?? "");

  const mejor = RESPUESTAS.map((entrada) => ({ entrada, puntos: puntuar(entrada, simple) })).reduce(
    (campeona, candidata) => (candidata.puntos > campeona.puntos ? candidata : campeona),
    { entrada: null, puntos: 0 },
  );

  if (mejor.puntos > 0) return mejor.entrada.texto;
  return opciones.seAtasco ? RESPUESTA_SI_SE_ATASCA : RESPUESTA_POR_DEFECTO;
}

/** Preguntas de ejemplo que se enseñan como botones al abrir el chat. */
export const PREGUNTAS_SUGERIDAS = [
  "¿Cómo se juega?",
  "¿Qué es la cadena?",
  "¿Para qué sirve el duelo?",
  "¿Qué hace cada bonificación?",
];
