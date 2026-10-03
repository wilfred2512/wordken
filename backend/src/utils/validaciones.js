/**
 * Comprobaciones reutilizables de datos de entrada.
 *
 * Cada función devuelve `null` si el valor es válido, o un objeto
 * { campo, mensaje } si no lo es. Los middlewares juntan esos objetos en una
 * lista y la mandan entera, para que el usuario corrija todo de una vez en
 * lugar de descubrir un fallo por petición.
 */

export const LARGO_MINIMO_NOMBRE = 2;
export const LARGO_MAXIMO_NOMBRE = 14;

const PATRON_NOMBRE = /^[\p{L}\p{N} _.-]+$/u;

/** Crea el objeto de error de campo con el formato acordado. */
function problema(campo, mensaje) {
  return { campo, mensaje };
}

/** El nombre debe ser texto, del largo correcto y sin símbolos raros. */
export function validarNombre(valor, campo = "nombre") {
  if (typeof valor !== "string") {
    return problema(campo, "Debe ser texto.");
  }

  const limpio = valor.trim();

  if (limpio.length < LARGO_MINIMO_NOMBRE || limpio.length > LARGO_MAXIMO_NOMBRE) {
    return problema(
      campo,
      `Debe tener entre ${LARGO_MINIMO_NOMBRE} y ${LARGO_MAXIMO_NOMBRE} caracteres.`,
    );
  }

  if (!PATRON_NOMBRE.test(limpio)) {
    return problema(campo, "Solo se admiten letras, números, espacios, punto, guion y guion bajo.");
  }

  return null;
}

/** Entero mayor o igual que cero (y opcionalmente con tope). */
export function validarEnteroNoNegativo(valor, campo, maximo = Number.MAX_SAFE_INTEGER) {
  if (!Number.isInteger(valor) || valor < 0) {
    return problema(campo, "Debe ser un número entero mayor o igual que 0.");
  }
  if (valor > maximo) {
    return problema(campo, `No puede superar ${maximo}.`);
  }
  return null;
}

/** El valor debe estar dentro de una lista cerrada de opciones. */
export function validarOpcion(valor, campo, opciones) {
  if (!opciones.includes(valor)) {
    return problema(campo, `Debe ser uno de: ${opciones.join(", ")}.`);
  }
  return null;
}

/** Booleano estricto: ni "true" ni 1 cuelan, para no guardar basura. */
export function validarBooleano(valor, campo) {
  if (typeof valor !== "boolean") {
    return problema(campo, "Debe ser true o false.");
  }
  return null;
}

/** Identificador numérico de la URL: entero positivo. */
export function validarIdentificador(valorCrudo) {
  const numero = Number.parseInt(valorCrudo, 10);
  if (Number.isNaN(numero) || numero < 1) return null;
  return numero;
}
