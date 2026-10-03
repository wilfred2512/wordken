/**
 * Utilidades de tiempo.
 */

/**
 * Promesa que se resuelve pasados los milisegundos indicados.
 *
 * Permite escribir las animaciones de arriba abajo con await, en vez de
 * anidar setTimeout dentro de setTimeout.
 */
export function esperar(milisegundos) {
  return new Promise((listo) => setTimeout(listo, milisegundos));
}

/**
 * Espera que se puede SALTAR con un clic o una tecla.
 *
 * El juego encadena pausas para que las animaciones se vean, pero obligar a
 * mirarlas hace que la partida se sienta lenta. Con esto, quien ya sabe lo que
 * ha pasado pulsa cualquier cosa y sigue; quien no, espera y lo ve.
 *
 * @param {number} milisegundos tope de espera
 * @returns {Promise<boolean>} true si se saltó a mano
 */
export function esperarSaltable(milisegundos) {
  return new Promise((listo) => {
    let terminado = false;

    const terminar = (saltado) => {
      if (terminado) return;
      terminado = true;

      clearTimeout(temporizador);
      window.removeEventListener("pointerdown", alSaltar);
      window.removeEventListener("keydown", alSaltar);
      listo(saltado);
    };

    const alSaltar = () => terminar(true);
    const temporizador = setTimeout(() => terminar(false), milisegundos);

    window.addEventListener("pointerdown", alSaltar);
    window.addEventListener("keydown", alSaltar);
  });
}

/** Convierte milisegundos en "M:SS" para los relojes de la pantalla. */
export function formatearTiempo(milisegundos) {
  const segundosTotales = Math.max(0, Math.ceil(milisegundos / 1000));
  const minutos = Math.floor(segundosTotales / 60);
  const segundos = segundosTotales % 60;

  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}
