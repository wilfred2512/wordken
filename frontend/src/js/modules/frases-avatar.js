/**
 * Lo que dice el rival, personaje por personaje y momento por momento.
 *
 * Están separadas de personajes-ia.js porque son lo que más se va a tocar:
 * añadir chistes no debería obligar a abrir el archivo donde se decide cómo
 * juega la IA. Cada clave es un MOMENTO de la partida y cada valor una lista;
 * el avatar coge una al azar y evita repetir la última que dijo.
 *
 * Los momentos son siempre los mismos para los cuatro personajes, así que si
 * se inventa un personaje nuevo basta con copiar el bloque y reescribir el
 * tono. Si a uno le falta un momento, el avatar se calla: mejor callado que
 * diciendo algo que no pega.
 */

/* No se entera de nada y le da igual. Juega por instinto y casi siempre mal. */
const MONGOLO = {
  saludo: ["¿Y esto cómo e' que se juega?", "Hola. ¿Ya empezamos o qué?", "Voy a tirar lo primero que salga."],
  ganaIa: ["¡Gané! ...¿gané?", "Ni yo sé cómo hice eso.", "¡Wao! Fue sin querer, lo juro."],
  pierdeIa: ["Ah, era así la cosa.", "Bueno. Ya me irá saliendo.", "Me la pusiste fácil, ¿verdad?"],
  empate: ["¡Pensamos igual!", "¿Eso es bueno o es malo?", "Empate cuenta como ganar, ¿no?"],
  cadenaJugador: ["Uy, llevas una rachita.", "Tú sabe' algo que yo no sé.", "Enséñame ese truco ahí."],
  poderIa: ["Le di al botón bonito.", "No sé qué hace esto pero allá va.", "Ojalá sirva pa' algo."],
  poderJugador: ["¿Eso se podía hacer?", "Ah, yo quiero uno de esos.", "Qué cosa más linda, diablo."],
  dueloAbierto: ["¿Palabras? Ay, no, mi hermano.", "Yo leo poquito, suerte con eso.", "Esa parte me da miedo."],
  dueloGanado: ["¡Te la sabías! Qué inteligencia.", "Yo ni la hubiera pensado.", "Felicidades, en serio."],
  dueloPerdido: ["Tranquilo, a mí me pasa siempre.", "Casi, casi. Casi na'.", "Me quedo yo con el premio entonces."],
  vidaBajaIa: ["Creo que voy perdiendo.", "¿Esto duele?", "Ya casi me acaba', ¿verdad?"],
  vidaBajaJugador: ["¿Tú ta' bien? Te veo flojito.", "No te me caiga' ahora.", "Oye, respira un chin."],
  ganaLaIa: ["¿Gané yo? ¡GANÉ YO!", "Mami, mira, gané.", "Fue de pura chepa pero gané."],
  pierdeLaIa: ["Jugaste bien. Me cae' bien.", "Bien merecido, de verdad.", "Otra vez, ¿sí? Prometo aprender."],
};

/* El tipo normal: ni bueno ni malo, ni le va ni le viene. Trabaja y se va. */
const UNA_GENTE = {
  saludo: ["Buenas. Vamos a jugar.", "Dale, cuando tú quieras.", "Aquí estamos. Empieza tú."],
  ganaIa: ["Esa fue mía.", "Bueno, una para mí.", "Salió bien, mira tú."],
  pierdeIa: ["Esa fue tuya, tranquilo.", "Bien jugado.", "Ok, vamos a la otra."],
  empate: ["Empate. Seguimos.", "Ninguno de los dos, pues.", "Igual. Otra vez."],
  cadenaJugador: ["Llevas varias seguidas, eh.", "Ahí vas bien.", "Ya te cogí el ritmo, espérate."],
  poderIa: ["Voy a usar esto.", "Me toca a mí.", "A ver qué tal sale."],
  poderJugador: ["Ah, tenías eso guardado.", "Buena jugada.", "Ok, eso lo cambia un chin."],
  dueloAbierto: ["Ahora las palabras. Suerte.", "A ver qué tal se te da.", "Tienes el tiempo justo."],
  dueloGanado: ["La sacaste. Bien.", "Eso estuvo bueno.", "Te la ganaste."],
  dueloPerdido: ["No salió. Pasa.", "Se acabó el tiempo, mi hermano.", "Estaba difícil esa."],
  vidaBajaIa: ["Me tienes apretao.", "Ahí voy, ahí voy.", "Esto se puso serio."],
  vidaBajaJugador: ["Te queda poquito ya.", "Cuidado ahí.", "Ya casi, eh."],
  ganaLaIa: ["Se acabó. Buen juego.", "Esta vez me tocó a mí.", "Gracias por la partida."],
  pierdeLaIa: ["Ganaste limpio. Bien.", "Nada que decir, jugaste mejor.", "La próxima me toca a mí."],
};

/* Calle pura: te habla por encima del hombro y no se calla ni perdiendo. */
const TIGUERE = {
  saludo: ["Llegó el tíguere. Siéntate.", "Vamo' a ver qué tú trae.", "Dale, que no tengo to' el día."],
  ganaIa: ["Te leí como un colmado abierto.", "Eso estaba cantao, manito.", "Papi, eso no se hace así."],
  pierdeIa: ["Ok. Esa te la dejé.", "Tuviste chepa, na' má'.", "No te guille' con una."],
  empate: ["Pensamos igual. Mal síntoma pa' ti.", "Empate. Qué aburrimiento.", "Otra vez lo mismo, dale."],
  cadenaJugador: ["Bueno, ya te guillaste.", "Disfruta la rachita mientras dure.", "Tres seguidas y te cree' matatán."],
  poderIa: ["Mira lo que tenía guardao.", "Esto lo tenía pa' ti.", "Ahora sí se puso bueno."],
  poderJugador: ["Ah, con trampa jugamo'.", "Úsalo, que igual te gano.", "Eso no te va a salvar."],
  dueloAbierto: ["¿Palabras? Vete, que esa la pierde'.", "A ver si tú sabe' hablar.", "Corre el reloj, apúrate."],
  dueloGanado: ["Bueno... esa sí la sabía'.", "Se te da mejor la letra que la mano.", "Ya, ya. No presuma'."],
  dueloPerdido: ["¡Pichea eso! El premio e' mío.", "Te comiste el tiempo mirando.", "Esa palabra taba fácil, eh."],
  vidaBajaIa: ["Tato, tato. Todavía no.", "Me tiene' apretao, lo admito.", "Un chin má' y me tumba'."],
  vidaBajaJugador: ["Te queda un chin de vida.", "Ya casi, papá. Ya casi.", "Despídete bonito."],
  ganaLaIa: ["Fin. Como taba escrito.", "Gracias por venir, vuelva pronto.", "Te lo dije desde la ronda uno."],
  pierdeLaIa: ["Ok, ok. Ere' bueno. Lo admito.", "Me ganaste limpio. Respeto.", "Revancha. Ahora mismo."],
};

/* Piensa de verdad: es el único al que le mueve la mano un modelo real. */
const GENIO = {
  saludo: ["Ya calculé cómo termina esto.", "Conexión establecida. Juguemos.", "Te voy a estudiar mientras jugamos."],
  ganaIa: ["Elegiste lo probable.", "Tu mano se movió antes que tu idea.", "Exactamente lo que calculé."],
  pierdeIa: ["Interesante. Corrijo el modelo.", "No lo vi venir. Bien.", "Una desviación. Solo una."],
  empate: ["Pensamos lo mismo. Piénsalo.", "Coincidimos. Curioso.", "Un empate no cambia el final."],
  cadenaJugador: ["Una racha es ruido con buena prensa.", "Tres aciertos no son un patrón.", "Sigue. Estoy aprendiendo de ti."],
  poderIa: ["Lo guardaba para este momento exacto.", "Ahora.", "Calculé esta ronda hace seis."],
  poderJugador: ["Lo esperaba antes.", "Eso cambia mis números.", "Adelante. No cambia el final."],
  dueloAbierto: ["Palabras. Mi terreno.", "Cinco intentos contra un idioma entero.", "El reloj no negocia."],
  dueloGanado: ["Correcto. No lo esperaba tan pronto.", "Bien resuelto. Anotado.", "Te lo concedo."],
  dueloPerdido: ["La tenías delante.", "El tiempo era el enemigo, no yo.", "Ese premio ahora es mío."],
  vidaBajaIa: ["Mis probabilidades han caído.", "Un mal cálculo. Uno.", "Recalculando todo."],
  vidaBajaJugador: ["Estás al límite.", "Un golpe más.", "Tus opciones se agotan."],
  ganaLaIa: ["Como estaba previsto desde el principio.", "Ha sido un placer procesarte.", "Fin."],
  pierdeLaIa: ["Has roto la predicción. Enhorabuena.", "Me enseñaste algo. Raro.", "Volveré con mejores números."],
};

/** Frases de cada personaje, por su identificador. */
export const FRASES = {
  facil: MONGOLO,
  normal: UNA_GENTE,
  dificil: TIGUERE,
  mente: GENIO,
};

/** Cara que pone el rival en cada momento. */
export const ANIMO = {
  saludo: "quieto",
  ganaIa: "contento",
  pierdeIa: "molesto",
  empate: "pensando",
  cadenaJugador: "molesto",
  poderIa: "contento",
  poderJugador: "pensando",
  dueloAbierto: "pensando",
  dueloGanado: "molesto",
  dueloPerdido: "contento",
  vidaBajaIa: "molesto",
  vidaBajaJugador: "contento",
  ganaLaIa: "contento",
  pierdeLaIa: "molesto",
};

/** Las frases de un momento, o una lista vacía si ese personaje no habla ahí. */
export function frasesDe(idPersonaje, momento) {
  return FRASES[idPersonaje]?.[momento] ?? [];
}
