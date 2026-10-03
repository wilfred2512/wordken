/**
 * Error con código de estado HTTP.
 *
 * Permite que los servicios lancen errores sin conocer req ni res: el
 * middleware de errores lee el estado y responde. Así la regla de negocio no
 * se contamina con detalles del protocolo.
 */
export class ErrorHttp extends Error {
  /**
   * @param {number} estado  código HTTP (400, 401, 404, 500...)
   * @param {string} mensaje texto que verá el cliente
   * @param {object[]} detalles lista opcional de errores de validación
   */
  constructor(estado, mensaje, detalles = []) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.estado = estado;
    this.detalles = detalles;
  }
}

/** 400 — la petición trae datos mal formados. */
export function errorPeticionInvalida(mensaje, detalles = []) {
  return new ErrorHttp(400, mensaje, detalles);
}

/** 401 — falta la credencial o no coincide. */
export function errorNoAutorizado(mensaje = "Credencial ausente o incorrecta.") {
  return new ErrorHttp(401, mensaje);
}

/** 404 — el recurso pedido no existe. */
export function errorNoEncontrado(mensaje = "Recurso no encontrado.") {
  return new ErrorHttp(404, mensaje);
}
