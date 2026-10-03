/**
 * Lectura centralizada de las variables de entorno.
 *
 * Ningún otro archivo llama a process.env. Si mañana cambia el nombre de una
 * variable, solo hay que tocarla aquí.
 */
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

/*
 * El .env se busca SIEMPRE en backend/, venga de donde venga el arranque.
 * `dotenv.config()` a secas lo busca en la carpeta desde la que se lanzó
 * Node: si alguien arrancaba con `node backend/server.js` desde la raíz del
 * proyecto, no encontraba el archivo, la IA se quedaba apagada y el juego
 * seguía funcionando con sus respuestas de repuesto sin dar ni una pista.
 */
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const PUERTO_POR_DEFECTO = 3000;
const LIMITE_PUNTUACIONES_POR_DEFECTO = 10;
const RUTA_BASE_DATOS_POR_DEFECTO = "./datos/juego.db";
const TIEMPO_LIMITE_IA_MS = 6000;

/**
 * Convierte una cadena de entorno en número, con valor de respaldo.
 * parseInt devuelve NaN cuando la variable no existe o trae texto.
 */
function leerNumero(valorCrudo, valorPorDefecto) {
  const numero = Number.parseInt(valorCrudo, 10);
  return Number.isNaN(numero) ? valorPorDefecto : numero;
}

/** Convierte "a.com,b.com" en ["a.com", "b.com"], sin espacios ni vacíos. */
function leerLista(valorCrudo) {
  if (!valorCrudo) return [];
  return valorCrudo
    .split(",")
    .map((elemento) => elemento.trim())
    .filter((elemento) => elemento.length > 0);
}

/**
 * Configuración del modelo de lenguaje que mueve a LA MENTE y al chatbot.
 *
 * La clave vive AQUÍ y solo aquí. El navegador nunca la ve: el frontend le
 * pide las cosas a este servidor y es el servidor quien llama al proveedor.
 * Ponerla en el JavaScript del juego sería publicarla, porque cualquiera
 * puede abrir el código fuente de una página.
 *
 * `urlBase` es compatible con OpenAI, que es el formato que aceptan casi
 * todos (OpenAI, Groq, Together, OpenRouter, Ollama en local...), así que
 * cambiar de proveedor es cambiar dos líneas del .env y nada del código.
 */
function leerModelo() {
  const clave = process.env.IA_CLAVE ?? "";

  // Sin barra final: "http://localhost:11434/v1/" daría ".../v1//chat/completions",
  // que algunos proveedores (Ollama entre ellos) contestan con un 404.
  //
  // Y `localhost` pasa a 127.0.0.1: según la versión de Node y del sistema,
  // localhost se resuelve a
  // la dirección IPv6 (::1), pero Ollama solo escucha en IPv4. PowerShell
  // prueba las dos y por eso `curl localhost:11434` funcionaba, mientras el
  // backend se estrellaba contra ::1 sin que nadie lo viera.
  const urlBase = (process.env.IA_URL_BASE ?? "https://api.openai.com/v1")
    .trim()
    .replace(/\/+$/, "")
    .replace("://localhost", "://127.0.0.1");

  return {
    urlBase,
    clave,
    nombre: process.env.IA_MODELO ?? "gpt-4o-mini",
    tiempoLimiteMs: leerNumero(process.env.IA_TIEMPO_LIMITE_MS, TIEMPO_LIMITE_IA_MS),
    activo: clave.length > 0,
  };
}

export const entorno = {
  puerto: leerNumero(process.env.PUERTO, PUERTO_POR_DEFECTO),
  modelo: leerModelo(),
  modo: process.env.NODE_ENV ?? "desarrollo",
  rutaBaseDatos: process.env.RUTA_BASE_DATOS ?? RUTA_BASE_DATOS_POR_DEFECTO,
  origenesPermitidos: leerLista(process.env.ORIGENES_PERMITIDOS),
  claveApi: process.env.CLAVE_API ?? "",
  limitePuntuaciones: leerNumero(
    process.env.LIMITE_PUNTUACIONES,
    LIMITE_PUNTUACIONES_POR_DEFECTO,
  ),
};

/** true cuando el servidor corre en producción: los errores se ocultan. */
export function esProduccion() {
  return entorno.modo === "produccion" || entorno.modo === "production";
}
