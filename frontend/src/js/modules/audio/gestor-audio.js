/**
 * Gestor de audio: fundidos cruzados, bucles y tolerancia a pistas vacías.
 *
 * Ningún navegador deja reproducir audio antes de que el usuario interactúe
 * con la página. No es un fallo del juego, es política del navegador. Por eso
 * existe `desbloquear()`, que se llama en el primer clic o tecla, y por eso
 * el gestor reintenta solo si le bloquean el play.
 */
import { MUSICA, EFECTOS_SONIDO, AJUSTES_AUDIO, PASO_DE_FUNDIDO_MS } from "./catalogo-audio.js";
import { sintetizador } from "./sintetizador.js";
import { limitar } from "../../utils/numeros.js";
import { elegirAlAzar } from "../../utils/azar.js";

export class GestorDeAudio {
  constructor() {
    this.elementos = {};
    /** Por cada efecto con varias grabaciones, la última que sonó. */
    this.ultimaVariante = {};
    this.pistaActual = null;
    this.pistaEnEspera = null;
    this.silenciado = false;
    this.enPausa = false;
    this.desbloqueado = false;
    this.bloqueadoPorNavegador = false;
    this.fundidosEnCurso = {};
    this.reintentoArmado = false;
  }

  /** Crea (o recupera) el elemento <audio> de una pista. */
  obtenerElemento(nombrePista) {
    const ruta = MUSICA[nombrePista];
    if (!ruta) return null;

    if (!this.elementos[nombrePista]) {
      const elemento = new Audio(ruta);
      elemento.loop = AJUSTES_AUDIO.musicaEnBucle;
      elemento.volume = 0;
      elemento.preload = "auto";
      this.elementos[nombrePista] = elemento;
    }

    return this.elementos[nombrePista];
  }

  /** Se llama en el primer gesto del usuario. */
  desbloquear() {
    if (this.desbloqueado) return;

    this.desbloqueado = true;
    if (!this.pistaEnEspera) return;

    const pendiente = this.pistaEnEspera;
    this.pistaEnEspera = null;
    this.pistaActual = null;
    this.ponerMusica(pendiente);
  }

  /**
   * Cambia la música de fondo con fundido cruzado.
   * La comparación con `pistaActual` es lo que evita que la misma pista se
   * reinicie cada ronda.
   */
  ponerMusica(nombrePista) {
    if (this.pistaActual === nombrePista && !this.bloqueadoPorNavegador) return;

    const anterior = this.pistaActual;
    this.pistaActual = nombrePista;

    if (!this.desbloqueado) {
      this.pistaEnEspera = nombrePista;
      return;
    }

    if (anterior && anterior !== nombrePista) {
      this.fundir(anterior, 0, AJUSTES_AUDIO.duracionFundidoMs, true);
    }

    const elemento = this.obtenerElemento(nombrePista);
    if (!elemento || this.silenciado || this.enPausa) return;

    this.reiniciarYReproducir(elemento, nombrePista);
  }

  /** Vuelve al principio de la pista y la lanza. */
  reiniciarYReproducir(elemento, nombrePista) {
    try {
      elemento.currentTime = 0;
    } catch (error) {
      // El archivo aún no tiene metadatos: se reproduce desde donde esté.
    }
    this.reproducir(elemento, nombrePista);
  }

  /** Intenta reproducir y gestiona el bloqueo del navegador. */
  reproducir(elemento, nombrePista) {
    const promesa = elemento.play();
    const subirVolumen = () =>
      this.fundir(nombrePista, AJUSTES_AUDIO.volumenMusica, AJUSTES_AUDIO.duracionFundidoMs, false);

    if (!promesa?.catch) {
      subirVolumen();
      return;
    }

    promesa
      .then(() => {
        this.bloqueadoPorNavegador = false;
        subirVolumen();
      })
      .catch(() => {
        this.bloqueadoPorNavegador = true;
        this.armarReintento();
      });
  }

  /** Si el navegador cortó el audio, se reintenta en el siguiente gesto. */
  armarReintento() {
    if (this.reintentoArmado) return;
    this.reintentoArmado = true;

    const reintentar = () => {
      this.reintentoArmado = false;
      const elemento = this.elementos[this.pistaActual];
      if (elemento && this.bloqueadoPorNavegador) this.reproducir(elemento, this.pistaActual);
    };

    window.addEventListener("pointerdown", reintentar, { once: true });
    window.addEventListener("keydown", reintentar, { once: true });
  }

  /**
   * Efecto puntual: archivo si lo hay, pitido sintetizado si no.
   * Si el catálogo trae una lista de archivos (las risas), suena uno al azar.
   */
  efecto(nombreEfecto) {
    if (this.silenciado) return;

    const fuente = EFECTOS_SONIDO[nombreEfecto];

    if (Array.isArray(fuente) && fuente.length > 0) {
      this.efectoAlAzar(nombreEfecto, fuente);
      return;
    }

    if (typeof fuente === "string" && fuente) {
      this.reproducirArchivo(fuente);
      return;
    }

    if (AJUSTES_AUDIO.usarPitidosDeRespaldo) sintetizador.reproducir(nombreEfecto);
  }

  /** Lanza un archivo de efecto y devuelve su elemento <audio>. */
  reproducirArchivo(ruta) {
    const elemento = new Audio(ruta);
    elemento.volume = AJUSTES_AUDIO.volumenEfectos;
    elemento.play()?.catch(() => {});
    return elemento;
  }

  /**
   * Una grabación al azar de la lista, distinta de la última que sonó.
   *
   * Mientras una sigue sonando no se lanza otra. Al perder un duelo la risa
   * se pide dos veces casi seguidas (al enseñar la solución y cuando el rival
   * se lleva el poder), y dos risas distintas una encima de otra son un ruido.
   */
  efectoAlAzar(nombreEfecto, rutas) {
    const ultima = this.ultimaVariante[nombreEfecto];
    if (ultima && !ultima.elemento.paused && !ultima.elemento.ended) return;

    const candidatas = rutas.filter((ruta) => ruta !== ultima?.ruta);
    const ruta = elegirAlAzar(candidatas.length > 0 ? candidatas : rutas);

    this.ultimaVariante[nombreEfecto] = { ruta, elemento: this.reproducirArchivo(ruta) };
  }

  /**
   * Para la música sin tocar el interruptor de silencio del jugador.
   *
   * Son dos cosas distintas a propósito: si la pausa reutilizara `silenciar`,
   * al volver al juego se desharía el silencio que el jugador había puesto a
   * mano. Por eso hay dos estados separados.
   */
  pausar() {
    this.enPausa = true;
    this.elementos[this.pistaActual]?.pause();
  }

  /** Reanuda la música, salvo que el jugador la tenga silenciada. */
  reanudar() {
    this.enPausa = false;
    if (this.silenciado) return;

    const elemento = this.elementos[this.pistaActual];
    if (elemento) this.reproducir(elemento, this.pistaActual);
  }

  /** Silencia o reactiva todo el audio. */
  silenciar(activado) {
    this.silenciado = activado;

    if (activado) {
      Object.values(this.elementos).forEach((elemento) => elemento.pause());
      // Una risa dura varios segundos: si no se corta, sigue tras silenciar.
      Object.values(this.ultimaVariante).forEach((variante) => variante.elemento.pause());
      return;
    }

    const elemento = this.elementos[this.pistaActual];
    if (elemento) this.reproducir(elemento, this.pistaActual);
  }

  /**
   * Sube o baja el volumen poco a poco.
   * Se indexa por NOMBRE de pista y no por URL para que dos fundidos
   * distintos no se pisen el temporizador.
   */
  fundir(nombrePista, volumenDestino, duracionMs, pausarAlFinal) {
    const elemento = this.elementos[nombrePista];
    if (!elemento) return;

    clearInterval(this.fundidosEnCurso[nombrePista]);

    const volumenInicial = elemento.volume;
    const pasos = Math.max(1, Math.round(duracionMs / PASO_DE_FUNDIDO_MS));
    let pasoActual = 0;

    this.fundidosEnCurso[nombrePista] = setInterval(() => {
      pasoActual++;
      const avance = pasoActual / pasos;
      elemento.volume = limitar(volumenInicial + (volumenDestino - volumenInicial) * avance, 0, 1);

      if (pasoActual < pasos) return;

      clearInterval(this.fundidosEnCurso[nombrePista]);
      delete this.fundidosEnCurso[nombrePista];
      elemento.volume = limitar(volumenDestino, 0, 1);
      if (pausarAlFinal) elemento.pause();
    }, PASO_DE_FUNDIDO_MS);
  }
}

export const gestorAudio = new GestorDeAudio();
