/**
 * Carga del sprite de iconos.
 *
 * Los dibujos SVG viven en src/assets/iconos.svg, no dentro de index.html:
 * son un recurso gráfico, igual que un mp3, y sacarlos deja el HTML ocupándose
 * solo de la estructura. Se inyectan al arrancar para que los `<use>` de todo
 * el juego encuentren los símbolos por su id.
 */
const RUTA_DEL_SPRITE = "src/assets/iconos.svg";

/**
 * Descarga el sprite y lo mete al principio del body.
 * Si falla, el juego sigue funcionando: se verán las cartas sin dibujo, pero
 * la partida es jugable igual.
 */
export async function cargarIconos() {
  try {
    const respuesta = await fetch(RUTA_DEL_SPRITE);
    if (!respuesta.ok) return false;

    const contenedor = document.createElement("div");
    contenedor.hidden = true;
    contenedor.innerHTML = await respuesta.text();
    document.body.prepend(contenedor);

    return true;
  } catch (error) {
    return false;
  }
}
