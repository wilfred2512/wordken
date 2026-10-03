/**
 * Atajos para hablar con el HTML.
 *
 * Todo el proyecto pasa por aquí para tocar el DOM. Si mañana cambiamos de
 * librería o de forma de buscar elementos, se cambia en un solo archivo.
 */

/** Primer elemento que coincide con el selector. */
export function buscar(selector, donde = document) {
  return donde.querySelector(selector);
}

/** Todos los elementos que coinciden, ya como array de verdad. */
export function buscarTodos(selector, donde = document) {
  return Array.from(donde.querySelectorAll(selector));
}

/**
 * Crea un elemento con clases, texto e hijos en una sola llamada.
 * @param {string} etiqueta
 * @param {{clase?: string, texto?: string, html?: string, atributos?: object}} opciones
 */
export function crearElemento(etiqueta, opciones = {}) {
  const elemento = document.createElement(etiqueta);

  if (opciones.clase) elemento.className = opciones.clase;
  if (opciones.texto !== undefined) elemento.textContent = opciones.texto;
  if (opciones.html !== undefined) elemento.innerHTML = opciones.html;

  Object.entries(opciones.atributos ?? {}).forEach(([nombre, valor]) => {
    elemento.setAttribute(nombre, valor);
  });

  return elemento;
}

/**
 * Reinicia una animación CSS que ya se reprodujo.
 *
 * Leer offsetWidth obliga al navegador a recalcular el diseño ahora mismo.
 * Sin esa lectura, quitar y volver a poner la clase en la misma línea no
 * cuenta como cambio y la animación no se repite.
 */
export function reiniciarAnimacion(elemento, clase) {
  elemento.classList.remove(clase);
  void elemento.offsetWidth;
  elemento.classList.add(clase);
}

/** Escribe texto en el elemento que coincida con el selector. */
export function escribirTexto(selector, texto) {
  const elemento = buscar(selector);
  if (elemento) elemento.textContent = texto;
}

/** Muestra u oculta un elemento con el atributo hidden. */
export function alternarVisible(elemento, visible) {
  if (elemento) elemento.hidden = !visible;
}

/**
 * Convierte un `var(--algo)` en el color real que hay detrás.
 *
 * El catálogo de poderes guarda los colores como variables CSS, que es lo
 * correcto para el CSS pero no le sirve al motor de partículas: ese dibuja en
 * un canvas y necesita un color de verdad. La traducción se hace aquí, una
 * sola vez por color, porque `getComputedStyle` fuerza un recálculo.
 */
const coloresResueltos = new Map();

export function colorReal(valor) {
  const nombre = /^var\(\s*(--[\w-]+)\s*\)$/.exec(valor ?? "")?.[1];
  if (!nombre) return valor;

  if (!coloresResueltos.has(nombre)) {
    const leido = getComputedStyle(document.documentElement).getPropertyValue(nombre);
    coloresResueltos.set(nombre, leido.trim() || valor);
  }

  return coloresResueltos.get(nombre);
}
