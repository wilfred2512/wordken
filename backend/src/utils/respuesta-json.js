/**
 * Formato único de respuesta para toda la API: { success, data, message }.
 *
 * Centralizarlo evita que cada controlador invente su propia forma y que el
 * frontend tenga que adivinar dónde viene el dato en cada endpoint.
 */

const ESTADO_OK = 200;
const ESTADO_CREADO = 201;

/**
 * Respuesta correcta.
 * @param {import("express").Response} res
 * @param {*} datos        cuerpo útil
 * @param {string} mensaje texto para la interfaz
 * @param {number} estado  código HTTP
 */
export function responderExito(res, datos, mensaje = "", estado = ESTADO_OK) {
  return res.status(estado).json({
    success: true,
    data: datos,
    message: mensaje,
  });
}

/** Respuesta de recurso recién creado (201). */
export function responderCreado(res, datos, mensaje = "Recurso creado.") {
  return responderExito(res, datos, mensaje, ESTADO_CREADO);
}

/**
 * Respuesta de error. La usa únicamente el middleware de errores;
 * los controladores lanzan ErrorHttp en vez de llamar aquí.
 */
export function responderError(res, estado, mensaje, detalles = []) {
  return res.status(estado).json({
    success: false,
    data: detalles.length > 0 ? { detalles } : null,
    message: mensaje,
  });
}
