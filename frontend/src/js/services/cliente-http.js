/**
 * Cliente HTTP: el único sitio del frontend donde se llama a `fetch`.
 *
 * Toda la comunicación con el backend pasa por aquí, y los servicios de
 * arriba solo dicen qué recurso quieren. En las vistas no hay ni un fetch
 * suelto.
 */
import { URL_BASE_API, TIEMPO_LIMITE_MS } from "./configuracion-api.js";

/** Estado que se usa cuando la petición no llegó siquiera a salir. */
export const SIN_CONEXION = 0;

/** Error con el código de estado, para poder distinguir un 404 de un 500. */
export class ErrorDeApi extends Error {
  constructor(mensaje, estado, detalles = []) {
    super(mensaje);
    this.name = "ErrorDeApi";
    this.estado = estado;
    this.detalles = detalles;
  }
}

/**
 * true cuando el fallo es que el servidor no está levantado.
 * Es distinto de un 404 o un 500: ahí el servidor sí contestó.
 */
export function esFalloDeConexion(error) {
  return error instanceof ErrorDeApi && error.estado === SIN_CONEXION;
}

/**
 * Aborta la petición si el servidor tarda demasiado.
 * @param {number} limiteMs por defecto el del resto de la API
 */
function crearAbortador(limiteMs = TIEMPO_LIMITE_MS) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), limiteMs);

  return { senal: controlador.signal, cancelar: () => clearTimeout(temporizador) };
}

/** Convierte la respuesta al formato { success, data, message } del backend. */
async function interpretarRespuesta(respuesta) {
  const cuerpo = await respuesta.json().catch(() => null);

  if (respuesta.ok && cuerpo?.success) return cuerpo.data;

  throw new ErrorDeApi(
    cuerpo?.message ?? `El servidor respondió ${respuesta.status}.`,
    respuesta.status,
    cuerpo?.data?.detalles ?? [],
  );
}

/**
 * Petición genérica.
 * @param {string} ruta    por ejemplo "/puntuaciones"
 * @param {object} opciones método, cuerpo, cabeceras y `limiteMs`
 */
export async function pedir(ruta, opciones = {}) {
  const { senal, cancelar } = crearAbortador(opciones.limiteMs);

  try {
    const respuesta = await fetch(`${URL_BASE_API}${ruta}`, {
      method: opciones.metodo ?? "GET",
      headers: { "Content-Type": "application/json", ...opciones.cabeceras },
      body: opciones.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined,
      signal: senal,
    });

    return await interpretarRespuesta(respuesta);
  } catch (error) {
    if (error instanceof ErrorDeApi) throw error;
    throw new ErrorDeApi("El servidor no responde.", SIN_CONEXION);
  } finally {
    cancelar();
  }
}

/**
 * Atajos por verbo, para que los servicios se lean como la documentación.
 * El último argumento `extra` sirve para alargar el tiempo de espera de una
 * petición suelta: `{ limiteMs: 30000 }`. Lo usan las del modelo.
 */
export const http = {
  obtener: (ruta, extra) => pedir(ruta, { ...extra }),
  crear: (ruta, cuerpo, extra) => pedir(ruta, { metodo: "POST", cuerpo, ...extra }),
  actualizar: (ruta, cuerpo, cabeceras) => pedir(ruta, { metodo: "PUT", cuerpo, cabeceras }),
  borrar: (ruta, cabeceras) => pedir(ruta, { metodo: "DELETE", cabeceras }),
};
