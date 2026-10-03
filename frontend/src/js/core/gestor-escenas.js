/**
 * Gestor de escenas: menú, partida, duelo, pausa y fin.
 *
 * Una escena es un objeto con `entrar()` y, opcionalmente, `salir()`. El
 * gestor se encarga de enseñar la sección correcta del HTML y de avisar a la
 * escena; nadie más toca la clase `es-activa`.
 */
import { buscarTodos } from "../utils/dom.js";

export class GestorDeEscenas {
  constructor() {
    this.escenas = new Map();
    this.actual = null;
  }

  /**
   * @param {string} nombre        clave con la que se pedirá la escena
   * @param {{idPantalla:string, entrar:Function, salir?:Function}} escena
   */
  registrar(nombre, escena) {
    this.escenas.set(nombre, escena);
  }

  /** Enseña solo la sección cuyo id coincide. */
  mostrarPantalla(idPantalla) {
    buscarTodos(".pantalla").forEach((pantalla) => {
      pantalla.classList.toggle("es-activa", pantalla.id === idPantalla);
    });
  }

  /**
   * Cambia de escena: avisa a la que sale, pinta la pantalla y avisa a la
   * que entra.
   * @param {string} nombre
   * @param {*} datos parámetros para la escena que entra
   */
  ir(nombre, datos) {
    const siguiente = this.escenas.get(nombre);
    if (!siguiente) return;

    if (this.actual?.salir) this.actual.salir();

    this.mostrarPantalla(siguiente.idPantalla);
    this.actual = siguiente;
    siguiente.entrar(datos);
  }

  /** Nombre de la escena que se está mostrando. */
  nombreActual() {
    for (const [nombre, escena] of this.escenas) {
      if (escena === this.actual) return nombre;
    }
    return null;
  }
}

/** Instancia compartida. */
export const gestorDeEscenas = new GestorDeEscenas();
