/**
 * La llamada al proveedor del modelo de lenguaje.
 *
 * Es el ÚNICO archivo del proyecto que habla con una IA externa, y por eso es
 * el único que toca la clave. Habla el formato de OpenAI (`/chat/completions`)
 * porque es el que aceptan casi todos los proveedores —OpenAI, Groq, Together,
 * OpenRouter, o un Ollama en tu propio portátil—, así que cambiar de uno a
 * otro es cambiar el .env y nada más.
 *
 * Regla de oro de este archivo: NUNCA revienta. Si no hay clave, si el
 * proveedor tarda o si devuelve basura, se devuelve `null` y quien llama sigue
 * con su plan B. El juego tiene que poder jugarse entero sin internet.
 */
import { entorno } from "../config/entorno.js";

const TEMPERATURA_POR_DEFECTO = 0.8;
const MAXIMO_DE_TOKENS = 160;

/** true si hay clave configurada y por tanto se puede preguntar. */
export function hayModelo() {
  return entorno.modelo.activo;
}

/** Corta la espera para que una ronda no se quede colgada de un servidor lento. */
function abortoPorTiempo() {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), entorno.modelo.tiempoLimiteMs);

  return { senal: controlador.signal, soltar: () => clearTimeout(temporizador) };
}

/** El cuerpo de la petición, en el formato que espera el proveedor. */
function cuerpoDePeticion(guion, mensajes, temperatura) {
  return JSON.stringify({
    model: entorno.modelo.nombre,
    temperature: temperatura,
    max_tokens: MAXIMO_DE_TOKENS,
    messages: [{ role: "system", content: guion }, ...mensajes],
  });
}

/** Saca el texto de la respuesta, sea cual sea el proveedor. */
function textoDeLaRespuesta(datos) {
  const contenido = datos?.choices?.[0]?.message?.content;
  return typeof contenido === "string" ? contenido.trim() : null;
}

/**
 * Por qué falló la última consulta, en palabras que entienda quien lo lea.
 *
 * Antes cualquier fallo era un `null` mudo: el juego seguía con su plan B y
 * nadie sabía si el problema era la URL, el nombre del modelo, que Ollama
 * estaba apagado o que tardaba demasiado. Ahora el motivo se guarda aquí, se
 * escribe en la terminal del backend y el chat lo enseña debajo de la
 * respuesta de repuesto.
 */
let ultimoFallo = null;

/** El último motivo de fallo, o null si la última consulta salió bien. */
export function motivoDelUltimoFallo() {
  return ultimoFallo;
}

/** Guarda el motivo y lo deja escrito en la terminal del backend. */
function anotarFallo(motivo) {
  ultimoFallo = motivo;
  process.stderr.write(`[modelo] ${motivo}\n`);
}

/** Traduce una excepción de fetch a algo que se pueda arreglar. */
function explicarExcepcion(error) {
  const url = entorno.modelo.urlBase;

  if (error?.name === "AbortError") {
    return `el modelo tardó más de ${entorno.modelo.tiempoLimiteMs} ms (sube IA_TIEMPO_LIMITE_MS en backend/.env)`;
  }

  return `no hay nada escuchando en ${url} (¿está abierto Ollama? ¿está bien IA_URL_BASE?)`;
}

/** Traduce una respuesta HTTP de error, con la pista más probable. */
async function explicarRespuestaMala(respuesta) {
  const cuerpo = (await respuesta.text().catch(() => "")).slice(0, 160);
  const pista = respuesta.status === 404
    ? ` · ¿existe el modelo "${entorno.modelo.nombre}"? ¿termina IA_URL_BASE en /v1?`
    : respuesta.status === 401 ? " · la clave IA_CLAVE no vale" : "";

  return `el proveedor respondió ${respuesta.status}${pista} · ${cuerpo}`;
}

/** Hace la petición HTTP y devuelve el texto, o anota por qué no. */
async function llamarAlProveedor(guion, mensajes, temperatura, senal) {
  const respuesta = await fetch(`${entorno.modelo.urlBase}/chat/completions`, {
    method: "POST",
    signal: senal,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${entorno.modelo.clave}`,
    },
    body: cuerpoDePeticion(guion, mensajes, temperatura),
  });

  if (!respuesta.ok) {
    anotarFallo(await explicarRespuestaMala(respuesta));
    return null;
  }

  const texto = textoDeLaRespuesta(await respuesta.json().catch(() => null));
  if (!texto) anotarFallo("el modelo contestó, pero sin texto dentro");

  return texto || null;
}

/**
 * Le hace una consulta al modelo.
 *
 * @param {string} guion    instrucciones de sistema
 * @param {object[]} mensajes  [{ role, content }]
 * @param {number} [temperatura]
 * @returns {Promise<string|null>} la respuesta, o null si no se pudo
 */
export async function preguntarAlModelo(guion, mensajes, temperatura = TEMPERATURA_POR_DEFECTO) {
  if (!hayModelo()) {
    ultimoFallo = "IA_CLAVE está vacía en backend/.env (o el backend no encontró el .env)";
    return null;
  }

  const { senal, soltar } = abortoPorTiempo();

  try {
    const texto = await llamarAlProveedor(guion, mensajes, temperatura, senal);
    if (texto) ultimoFallo = null;
    return texto;
  } catch (error) {
    anotarFallo(explicarExcepcion(error));
    return null; // plan B: el juego sigue con sus respuestas de repuesto
  } finally {
    soltar();
  }
}

/**
 * Como la anterior, pero esperando un objeto JSON.
 *
 * Los modelos tienen la manía de envolver el JSON en ```json ... ```, aunque
 * se les pida que no lo hagan, así que se limpia antes de interpretarlo.
 */
export async function preguntarJson(guion, mensajes, temperatura) {
  const texto = await preguntarAlModelo(guion, mensajes, temperatura);
  if (!texto) return null;

  // Además del envoltorio ```json, los modelos pequeños suelen añadir una
  // frase antes o después del objeto. Se recorta de la primera { a la última }.
  const limpio = texto.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const objeto = limpio.slice(limpio.indexOf("{"), limpio.lastIndexOf("}") + 1);

  try {
    return JSON.parse(objeto);
  } catch (error) {
    anotarFallo(`el modelo no devolvió JSON válido: ${texto.slice(0, 80)}`);
    return null;
  }
}
