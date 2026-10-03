/**
 * Pinta la tabla de puntuaciones que sirve el backend.
 *
 * Si el servidor no responde, se avisa y ya está: el juego funciona igual sin
 * backend, porque la tabla es un extra y no una condición para jugar.
 */
import { buscar, crearElemento } from "../utils/dom.js";
import { obtenerTablaDePuntuaciones } from "../services/servicio-puntuaciones.js";
import { esFalloDeConexion } from "../services/cliente-http.js";
import { MODO_DIAGNOSTICO } from "../utils/diagnostico.js";

const COLUMNAS = ["#", "JUGADOR", "MEJOR", "GANADAS", "DUELOS"];

/** Fila de cabecera de la tabla. */
function crearCabecera() {
  const fila = crearElemento("div", { clase: "fila-ranking cabecera" });

  COLUMNAS.forEach((titulo) => {
    fila.appendChild(crearElemento("span", { texto: titulo }));
  });

  return fila;
}

/** Fila de un jugador. */
function crearFila(entrada) {
  const fila = crearElemento("div", { clase: `fila-ranking puesto-${entrada.posicion}` });

  [
    entrada.posicion,
    entrada.nombre,
    entrada.mejorPuntuacion,
    entrada.partidasGanadas,
    entrada.duelosGanados,
  ].forEach((valor) => fila.appendChild(crearElemento("span", { texto: String(valor) })));

  return fila;
}

/** Mensaje centrado cuando no hay datos o falla la conexión. */
function mostrarMensaje(texto) {
  const contenedor = buscar("#tabla-ranking");
  contenedor.innerHTML = "";
  contenedor.appendChild(crearElemento("p", { clase: "ranking-vacio", texto }));
}

/**
 * Explicación con instrucciones cuando el servidor no está encendido.
 *
 * Solo sale en modo diagnóstico: a quien desarrolla le hace falta saber que
 * el backend no está en marcha y cuál es el comando para levantarlo, pero a
 * quien juega eso no le dice nada y tampoco puede arreglarlo.
 */
function mostrarServidorApagado() {
  const contenedor = buscar("#tabla-ranking");
  contenedor.innerHTML = "";

  contenedor.appendChild(
    crearElemento("div", {
      clase: "ranking-apagado",
      html:
        "<strong>El servidor no está encendido.</strong>" +
        "<span>La tabla de puntuaciones la sirve el backend. Para verla, abre una " +
        "terminal en la carpeta del proyecto y ejecuta:</span>" +
        "<code>cd backend<br>npm start</code>" +
        "<span>Si usas <b>jugar.bat</b> se levanta solo. El juego funciona igual " +
        "sin él: solo no se guardan las partidas.</span>",
    }),
  );
}

/** Descarga la tabla y la pinta. */
export async function cargarTablaDePuntuaciones() {
  mostrarMensaje("Cargando...");

  try {
    const tabla = await obtenerTablaDePuntuaciones();

    if (tabla.length === 0) {
      mostrarMensaje("Todavía no hay partidas guardadas. Sé el primero.");
      return;
    }

    const contenedor = buscar("#tabla-ranking");
    contenedor.innerHTML = "";
    contenedor.appendChild(crearCabecera());
    tabla.forEach((entrada) => contenedor.appendChild(crearFila(entrada)));
  } catch (error) {
    mostrarFallo(error);
  }
}

/** La tabla no se pudo cargar: se dice normal, y con detalle en diagnóstico. */
function mostrarFallo(error) {
  if (!MODO_DIAGNOSTICO) {
    mostrarMensaje(
      "Ahora mismo no se pueden ver las puntuaciones. Puedes jugar igual y volver a mirar en un rato.",
    );
    return;
  }

  if (esFalloDeConexion(error)) mostrarServidorApagado();
  else mostrarMensaje(`El servidor devolvió un error: ${error.message}`);
}
