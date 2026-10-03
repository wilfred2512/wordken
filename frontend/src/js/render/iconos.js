/**
 * Iconos SVG de las tiradas.
 *
 * Los dibujos viven una sola vez en index.html, dentro de <defs>, y aquí se
 * generan las referencias <use>. Así no se repite el trazado en cada carta.
 */

/** Marca de tiempo con el icono de una tirada. */
export function iconoDe(tirada) {
  return `<svg aria-hidden="true"><use href="#icono-${tirada}"></use></svg>`;
}

/** Icono de carta boca abajo. */
export function iconoOculto() {
  return iconoDe("oculto");
}
