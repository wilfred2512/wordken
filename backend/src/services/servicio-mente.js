/**
 * Las dos cosas que el juego le pide a un modelo de lenguaje:
 *   · la tirada y la pulla de LA MENTE, la cuarta dificultad
 *   · las respuestas del chatbot que explica cómo se juega
 *
 * Ninguna de las dos es imprescindible: si no hay clave configurada o el
 * proveedor no responde, este servicio devuelve `disponible: false` y el
 * frontend tira de su plan B. Esa es la diferencia entre un extra y una
 * dependencia, y aquí es un extra a propósito: el proyecto tiene que poder
 * corregirse sin pedirle a nadie que pague una API.
 */
import { preguntarAlModelo, preguntarJson, hayModelo, motivoDelUltimoFallo } from "./cliente-modelo.js";
import { entorno } from "../config/entorno.js";
import { GUION_DEL_AYUDANTE, GUION_DE_LA_MENTE } from "./manual-juego.js";
import { errorPeticionInvalida } from "../utils/error-http.js";

const TIRADAS_VALIDAS = ["piedra", "papel", "tijera"];
const LARGO_MAXIMO_DE_PREGUNTA = 400;
const LARGO_MAXIMO_DE_COMENTARIO = 90;
const MAXIMO_DE_MENSAJES = 12;
const TEMPERATURA_DE_JUEGO = 0.9;
const TEMPERATURA_DE_AYUDA = 0.4;

/** Resume la partida en el texto que se le pasa al modelo. */
function describirPartida(estado) {
  const mias = (estado.tiradasDeLaIa ?? []).slice(-8).join(", ") || "ninguna";
  const suyas = (estado.tiradasDelJugador ?? []).slice(-8).join(", ") || "ninguna";

  return [
    `Ronda ${estado.ronda ?? 1}.`,
    `Tu vida: ${estado.vidaIa ?? "?"}. La del humano: ${estado.vidaJugador ?? "?"}.`,
    `Tus últimas tiradas: ${mias}.`,
    `Las últimas del humano: ${suyas}.`,
    estado.resultados?.length ? `Cómo acabaron: ${estado.resultados.slice(-8).join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Deja el comentario en una línea corta y sin saltos. */
function recortarComentario(texto) {
  if (typeof texto !== "string") return null;

  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length === 0) return null;

  return limpio.slice(0, LARGO_MAXIMO_DE_COMENTARIO);
}

/**
 * La jugada de LA MENTE para la próxima ronda.
 *
 * Se valida la tirada porque lo que devuelve un modelo es texto libre: si
 * contestara "lagarto", el motor se quedaría sin saber qué hacer. Cuando no
 * es válida se descarta y manda la estrategia normal del juego.
 *
 * @param {object} estado  resumen de la partida
 */
export async function pedirJugadaDeLaMente(estado) {
  if (!hayModelo()) return { disponible: false };

  const respuesta = await preguntarJson(
    GUION_DE_LA_MENTE,
    [{ role: "user", content: describirPartida(estado ?? {}) }],
    TEMPERATURA_DE_JUEGO,
  );

  if (!respuesta) return { disponible: false };

  const tirada = String(respuesta.tirada ?? "").toLowerCase();

  return {
    disponible: true,
    tirada: TIRADAS_VALIDAS.includes(tirada) ? tirada : null,
    comentario: recortarComentario(respuesta.comentario),
  };
}

/** Comprueba que la conversación que llega del navegador tiene buena pinta. */
function validarConversacion(mensajes) {
  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    throw errorPeticionInvalida("Hace falta al menos un mensaje.");
  }

  return mensajes.slice(-MAXIMO_DE_MENSAJES).map((mensaje) => ({
    role: mensaje?.role === "assistant" ? "assistant" : "user",
    content: String(mensaje?.content ?? "").slice(0, LARGO_MAXIMO_DE_PREGUNTA),
  }));
}

/**
 * Respuesta del chatbot de ayuda.
 *
 * Solo se dejan pasar los mensajes, nunca las instrucciones: el guion lo pone
 * el servidor. Si el navegador pudiera mandar su propio guion, el chatbot
 * dejaría de ser el chatbot del juego.
 *
 * @param {object[]} mensajes  [{ role, content }]
 */
export async function responderDudaDeJuego(mensajes) {
  const conversacion = validarConversacion(mensajes);

  if (!hayModelo()) return { disponible: false, respuesta: null };

  const respuesta = await preguntarAlModelo(
    GUION_DEL_AYUDANTE,
    conversacion,
    TEMPERATURA_DE_AYUDA,
  );

  return { disponible: Boolean(respuesta), respuesta, motivo: respuesta ? null : motivoDelUltimoFallo() };
}

/**
 * Si el servidor tiene modelo configurado. El frontend lo pregunta al arrancar.
 * Se devuelve también el nombre del modelo y el último fallo, que es lo que
 * enseña la cabecera del chat.
 */
export function estadoDelModelo() {
  return {
    disponible: hayModelo(),
    modelo: hayModelo() ? entorno.modelo.nombre : null,
    ultimoFallo: motivoDelUltimoFallo(),
  };
}

/**
 * Prueba de verdad: le hace al modelo la MISMA consulta que haría el chat y
 * cuenta cuánto tarda. Es lo primero que hay que abrir cuando el ayudante
 * contesta con frases de repuesto: http://localhost:3000/api/mente/prueba
 */
export async function probarModelo() {
  const inicio = Date.now();
  const respuesta = await preguntarAlModelo(
    GUION_DEL_AYUDANTE,
    [{ role: "user", content: "¿Qué es la cadena? Contesta en una frase." }],
    TEMPERATURA_DE_AYUDA,
  );

  return {
    funciona: Boolean(respuesta),
    milisegundos: Date.now() - inicio,
    limiteMs: entorno.modelo.tiempoLimiteMs,
    url: entorno.modelo.urlBase,
    modelo: entorno.modelo.nombre,
    respuesta,
    fallo: respuesta ? null : motivoDelUltimoFallo(),
  };
}
