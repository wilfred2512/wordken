/**
 * Diccionario del duelo de palabras: jergas del español.
 *
 * CRITERIO DE SELECCIÓN, en dos niveles:
 *   · Las palabras **dominicanas** son la mitad del diccionario. Es el juego
 *     de un equipo dominicano y se nota.
 *   · Las de **otros países** solo entran si se conocen fuera de su país: las
 *     que cualquiera ha oído en música, series o redes. Se quitaron las
 *     demasiado locales (pololo, cachai, jato, bondi, burda...), porque
 *     adivinar una palabra que nunca has oído no es jugar, es rendirse.
 *
 * Formato compacto de cada entrada:
 *   [ palabra, tipo, pista, región ]
 *
 * `tipo` y `región` son cosas DISTINTAS a propósito: el tipo dice DE QUÉ habla
 * la palabra (una persona, dinero, un baile...) y la región de dónde viene.
 * Antes iban en un solo campo y el duelo llegaba a enseñar "España / España".
 *
 * Las tildes se pueden escribir o no: el duelo compara las palabras
 * normalizadas (ver utils/texto.js). La Ñ sí cuenta.
 */

const ENTRADAS = [
  // --- República Dominicana · gente y actitud -------------------------------
  ["TIGUERE", "Persona", "Astuto y con calle, se las sabe todas", "República Dominicana"],
  ["PALOMO", "Persona", "Ingenuo, fácil de engañar", "República Dominicana"],
  ["PARIGUAYO", "Persona", "El que mira la fiesta sin entrar en ella", "República Dominicana"],
  ["MATATAN", "Persona", "El que manda, el mejor en lo suyo", "República Dominicana"],
  ["CARAJITO", "Persona", "Niño, muchachito", "República Dominicana"],
  ["LAMBON", "Persona", "Adulador, el que hace la pelota", "República Dominicana"],
  ["PRESENTAO", "Persona", "Entrometido, se mete donde no lo llaman", "República Dominicana"],
  ["GUILLAO", "Actitud", "Creído, que se las da de algo", "República Dominicana"],
  ["BULTO", "Actitud", "Fanfarronería, puro cuento", "República Dominicana"],
  ["QUILLAO", "Estado", "Molesto, enojado", "República Dominicana"],
  ["JUMO", "Estado", "Borrachera", "República Dominicana"],
  ["DESACATAO", "Estado", "Desatado, fuera de control", "República Dominicana"],

  // --- República Dominicana · vida diaria -----------------------------------
  ["VAINA", "Cosa", "Una cosa, un asunto, lo que sea", "República Dominicana"],
  ["COROTOS", "Cosa", "Trastos, cosas de la casa", "República Dominicana"],
  ["CHIN", "Cantidad", "Una cantidad muy pequeña, un poquito", "República Dominicana"],
  ["ÑAPA", "Cantidad", "Lo que te dan de más, de regalo", "República Dominicana"],
  ["CUARTOS", "Dinero", "Lo que se gasta y nunca alcanza", "República Dominicana"],
  ["COLMADO", "Lugar", "La tienda de barrio de toda la vida", "República Dominicana"],
  ["CONCHO", "Transporte", "Carro que hace ruta por un precio fijo", "República Dominicana"],
  ["ZAFACON", "Objeto", "Donde se echa la basura", "República Dominicana"],
  ["CHOPO", "Cualidad", "De mala calidad, corriente", "República Dominicana"],
  ["JEVI", "Cualidad", "Algo que está muy bien", "República Dominicana"],
  ["TATO", "Expresión", "Todo bien, de acuerdo", "República Dominicana"],
  ["FUCU", "Creencia", "Mala suerte, mal agüero", "República Dominicana"],
  ["CHEPA", "Suerte", "Casualidad, golpe de suerte", "República Dominicana"],

  // --- República Dominicana · fiesta y calle --------------------------------
  ["TETEO", "Fiesta", "Fiesta, salir a gozar", "República Dominicana"],
  ["JANGUEO", "Fiesta", "Salir a pasarla bien con la gente", "República Dominicana"],
  ["CHERCHA", "Relajo", "Burla y risas entre amigos", "República Dominicana"],
  ["PICHEAR", "Acción", "Ignorar a alguien a propósito", "República Dominicana"],
  ["BOCHE", "Regaño", "Regaño fuerte", "República Dominicana"],
  ["CANTAZO", "Golpe", "Golpe fuerte, trompada", "República Dominicana"],

  // --- República Dominicana · comida y música -------------------------------
  ["MANGU", "Comida", "Plátano verde hervido y majado", "República Dominicana"],
  ["LOCRIO", "Comida", "Arroz guisado con carne", "República Dominicana"],
  ["QUIPE", "Comida", "Croqueta de trigo y carne", "República Dominicana"],
  ["CHENCHEN", "Comida", "Maíz molido, típico del sur", "República Dominicana"],
  ["MORO", "Comida", "Arroz y habichuelas cocinados juntos", "República Dominicana"],
  ["MABI", "Bebida", "Bebida fermentada de bejuco", "República Dominicana"],
  ["MERENGUE", "Baile", "El baile nacional dominicano", "República Dominicana"],
  ["BACHATA", "Baile", "Guitarra, güira y desamor", "República Dominicana"],
  ["DEMBOW", "Música", "El ritmo que suena en toda la isla", "República Dominicana"],
  ["TAMBORA", "Instrumento", "Tambor de dos parches del merengue", "República Dominicana"],
  ["GUIRA", "Instrumento", "Se rasca con una peineta de metal", "República Dominicana"],

  // --- Caribe (conocidas en toda la región) ---------------------------------
  ["CHEVERE", "Cualidad", "Genial, estupendo", "Caribe y Venezuela"],
  ["PANA", "Persona", "Amigo de confianza", "Caribe"],
  ["GUAGUA", "Transporte", "Autobús", "Antillas y Canarias"],
  ["BREGAR", "Acción", "Lidiar con un asunto complicado", "Caribe"],
  ["BOCHINCHE", "Relajo", "Chisme y alboroto a la vez", "Caribe"],
  ["ASERE", "Persona", "Amigo, colega", "Cuba"],
  ["RUMBA", "Fiesta", "Fiesta larga", "Colombia y Venezuela"],
  ["PARRANDA", "Fiesta", "Fiesta que va de casa en casa", "Caribe"],
  ["PERREO", "Baile", "La forma de bailar el reguetón", "Caribe"],
  ["SALSA", "Baile", "Nació entre Cuba y Nueva York", "Caribe"],
  ["SANCOCHO", "Comida", "Guiso espeso de carnes y viandas", "Caribe"],
  ["MOFONGO", "Comida", "Plátano majado con ajo y chicharrón", "Puerto Rico y RD"],
  ["ASOPAO", "Comida", "Arroz caldoso", "Caribe"],
  ["TOSTON", "Comida", "Rodaja de plátano aplastada y frita", "Caribe"],
  ["YUCA", "Comida", "Raíz que se hierve o se fríe", "Caribe"],

  // --- México (las que se oyen en todas partes) -----------------------------
  ["CHIDO", "Cualidad", "Genial, muy bueno", "México"],
  ["NETA", "Expresión", "La pura verdad", "México"],
  ["GUEY", "Persona", "Tipo, colega", "México"],
  ["CHAMBA", "Trabajo", "El empleo, lo que da de comer", "México y Perú"],
  ["LANA", "Dinero", "Lo que se gasta y nunca alcanza", "México"],
  ["CRUDA", "Estado", "El malestar del día después", "México"],
  ["ANTRO", "Lugar", "Discoteca", "México"],
  ["FRESA", "Persona", "Pijo o creído", "México"],
  ["CHELA", "Bebida", "Cerveza bien fría", "México"],
  ["TAMAL", "Comida", "Masa de maíz cocida envuelta en hoja", "América Latina"],

  // --- España (las que llegan por series y cine) ----------------------------
  ["GUAY", "Cualidad", "Genial, estupendo", "España"],
  ["CURRO", "Trabajo", "El empleo, lo que da de comer", "España"],
  ["PASTA", "Dinero", "Lo que se gasta y nunca alcanza", "España"],
  ["FLIPAR", "Acción", "Alucinar, quedarse impresionado", "España"],
  ["CHAVAL", "Persona", "Chico joven", "España"],
  ["BOTELLON", "Fiesta", "Beber en grupo en la calle", "España"],

  // --- Sur y Andes (solo las muy conocidas) ---------------------------------
  ["BOLUDO", "Persona", "Tipo, y también tonto, según el tono", "Argentina"],
  ["PIBE", "Persona", "Chico, muchacho", "Argentina y Uruguay"],
  ["LABURO", "Trabajo", "El empleo, lo que da de comer", "Argentina y Uruguay"],
  ["QUILOMBO", "Lío", "Desorden monumental", "Argentina y Uruguay"],
  ["PARCERO", "Persona", "Amigo, socio", "Colombia"],
  ["BACANO", "Cualidad", "Muy bueno, agradable", "Colombia"],
  ["CHAMO", "Persona", "Chico, muchacho", "Venezuela"],
  ["AREPA", "Comida", "Torta de maíz rellena", "Venezuela y Colombia"],
  ["CEVICHE", "Comida", "Pescado curado en limón", "Perú"],
  ["EMPANADA", "Comida", "Masa rellena, al horno o frita", "Toda Hispanoamérica"],
  ["MONDONGO", "Comida", "Guiso de callos", "América Latina"],
  ["CUMBIA", "Baile", "Ritmo de la costa colombiana", "Colombia"],
];

/** Convierte una entrada compacta en un objeto con nombre. */
function aPalabra([palabra, tipo, pista, region]) {
  return { palabra, tipo, pista, region };
}

/** Todo el diccionario, ya como objetos. */
export const DICCIONARIO = ENTRADAS.map(aPalabra);

/** Cuántas palabras hay en total. Se enseña en el menú. */
export const TOTAL_DE_PALABRAS = DICCIONARIO.length;

/** Cuántas son dominicanas. Sirve para presumir en el menú. */
export const TOTAL_DOMINICANAS = DICCIONARIO.filter((entrada) =>
  entrada.region.includes("Dominicana"),
).length;

/** Los tipos distintos que existen, por si se quiere filtrar en el futuro. */
export function tipos() {
  return [...new Set(DICCIONARIO.map((entrada) => entrada.tipo))];
}
