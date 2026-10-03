/**
 * JACKPOT: la celebración de la CADENA MÁXIMA, como el premio gordo de una
 * tragamonedas.
 *
 * Dura unos 33 segundos para que la música de cadena-maxima.mp3 se sienta,
 * y está SINCRONIZADO con ella: se midió el volumen de la pista y tiene un
 * golpe a los 7 s y el golpe fuerte a los 26 s. Por eso:
 *
 *    0 s   se apaga la sala y baja la máquina con sus bombillas
 *  1.3 s   palanca: giran los tres rodillos
 *  3.6 s   para el primero en PIEDRA · 5 s el segundo en PAPEL
 *  5.7 s   el tercero frena con suspense...
 *    7 s   ...TIJERA: ¡JACKPOT!  (el primer golpe de la música)
 *   14 s   el multiplicador se dispara, todo acelera y la máquina tiembla
 *   26 s   ¡¡MEGA JACKPOT!!  (el golpe fuerte de la música)
 *   32 s   fundido y a la pantalla final
 *
 * Los tres símbolos del premio son las tres tiradas selladas, que es justo
 * lo que significa la cadena máxima. A partir de los 2 s se puede saltar con
 * un clic o una tecla: el espectáculo es para quien lo quiera ver entero.
 *
 * Aquí solo hay clases y temporizadores; todo lo que se mueve es CSS
 * (jackpot.css) con transform, translate, rotate, scale, opacity y filter.
 */
import { crearElemento, reiniciarAnimacion } from "../utils/dom.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { particulas } from "./particulas.js";
import { golpeDeCamara, destello } from "./efectos-visuales.js";

/** Momentos del espectáculo, en ms desde que empieza. */
const MOMENTOS = {
  palanca: 1300,
  rodillo1: 3600,
  rodillo2: 5000,
  suspenso: 5700,
  jackpot: 7000,
  subida: 14000,
  otraTirada: 15000,
  mega: 26000,
  salida: 32000,
  fin: 33300,
};

const SALTABLE_DESDE_MS = 2000;
const SALIDA_RAPIDA_MS = 320;
const TIC_RODILLO_MS = 110;
const MONEDAS = 36;
const CONFETI = 40;
const BOMBILLAS_POR_FILA = 12;

/** La tira de cada rodillo: ocho símbolos, dos veces, para que el giro no tenga costura. */
const TIRA = ["siete", "piedra", "estrella", "papel", "siete", "tijera", "estrella", "piedra"];

/** En qué posición de la tira se para cada rodillo: piedra, papel y tijera. */
const PARADAS = [1, 3, 5];

/** Lo que va subiendo el multiplicador mientras crece la tensión. */
const SUBIDA = [5, 7, 10, 15, 20, 30, 50, 75, 100, 150, 250, 500, 777, 999];

/** El dibujo de un símbolo de la tira. */
function simbolo(nombre) {
  if (nombre === "siete") return '<i class="jp-simbolo jp-siete">7</i>';
  if (nombre === "estrella") return '<i class="jp-simbolo jp-estrella">★</i>';
  return `<i class="jp-simbolo m-${nombre}"><svg><use href="#icono-${nombre}"></use></svg></i>`;
}

/** Un rodillo con su tira doble y su posición de parada. */
function rodillo(indice) {
  const tira = [...TIRA, ...TIRA].map(simbolo).join("");
  return `<div class="jp-rodillo" data-rodillo="${indice}"><div class="jp-tira">${tira}</div></div>`;
}

/** `cuantos` elementos iguales, cada uno con su número de orden. */
function repetir(cuantos, plantilla) {
  return Array.from({ length: cuantos }, (_, indice) => plantilla(indice)).join("");
}

/** El HTML entero de la escena. */
function estructura(textos) {
  const bombillas = repetir(BOMBILLAS_POR_FILA, () => '<i class="jp-bombilla"></i>');

  return (
    '<div class="jp-velo"></div><div class="jp-rayos"></div><div class="jp-flash"></div>' +
    '<div class="jp-temblor"><div class="jp-maquina">' +
    `<div class="jp-marquesina"><div class="jp-fila">${bombillas}</div>` +
    `<span class="jp-letrero">CADENA MÁXIMA</span><div class="jp-fila">${bombillas}</div></div>` +
    `<div class="jp-ventana">${rodillo(0)}${rodillo(1)}${rodillo(2)}<div class="jp-linea"></div></div>` +
    '<div class="jp-contador"><small>MULTIPLICADOR</small><b class="jp-numero">x1</b></div>' +
    '<div class="jp-palanca"><i class="jp-bola"></i></div>' +
    "</div></div>" +
    `<div class="jp-lluvia">${repetir(MONEDAS, () => '<i class="jp-moneda"></i>')}</div>` +
    `<div class="jp-confeti">${repetir(CONFETI, (i) => `<i class="jp-papelito c${i % 5}"></i>`)}</div>` +
    `<strong class="jp-titulo">${textos.titulo}</strong>` +
    `<strong class="jp-mega">${textos.mega}</strong>` +
    `<p class="jp-subtitulo">${textos.subtitulo}</p>` +
    '<p class="jp-saltar">clic o cualquier tecla para continuar</p>'
  );
}

/** A cada moneda y papelito le toca su carril, su velocidad y su giro. */
function sortearCaidas(nodo) {
  nodo.querySelectorAll(".jp-moneda, .jp-papelito").forEach((pieza) => {
    const duracion = 1.6 + Math.random() * 2.2;
    pieza.style.setProperty("--x", `${(Math.random() * 100).toFixed(1)}vw`);
    pieza.style.setProperty("--dur", `${duracion.toFixed(2)}s`);
    pieza.style.setProperty("--ret", `${(-Math.random() * duracion).toFixed(2)}s`);
    pieza.style.setProperty("--giro", `${Math.round(360 + Math.random() * 720)}deg`);
  });
}

/** Ráfaga de chispas desde varios puntos de la pantalla. */
function fuegosArtificiales(cantidad, esDelJugador) {
  const colores = esDelJugador ? ["#ffd23f", "#35bd86", "#a96cff", "#009dff"] : ["#fe5f55", "#ff9f1c", "#a96cff"];

  for (let i = 0; i < cantidad; i++) {
    const color = colores[i % colores.length];
    const x = window.innerWidth * (0.12 + Math.random() * 0.76);
    const y = window.innerHeight * (0.15 + Math.random() * 0.5);
    setTimeout(() => particulas.emitir(x, y, color, 30, 11), i * 110);
  }
}

/** Los momentos del multiplicador: despacio al principio, cada vez más rápido. */
function calendarioDelContador() {
  const lista = [[MOMENTOS.jackpot, "x1"], [9500, "x2"], [12000, "x3"]];
  const tramo = MOMENTOS.mega - MOMENTOS.subida;

  SUBIDA.forEach((valor, indice) => {
    const avance = ((indice + 1) / (SUBIDA.length + 1)) ** 0.6;
    lista.push([MOMENTOS.subida + Math.round(tramo * avance), `x${valor}`]);
  });

  lista.push([MOMENTOS.mega, "x∞"]);
  return lista;
}

/**
 * Lanza el jackpot y espera a que termine o a que lo salten.
 * @param {{esDelJugador:boolean, subtitulo:string}} opciones
 * @returns {Promise<void>}
 */
export function lanzarJackpot({ esDelJugador, subtitulo }) {
  return new Promise((alTerminar) => {
    const textos = esDelJugador
      ? { titulo: "¡¡JACKPOT!!", mega: "¡¡¡MEGA JACKPOT!!!", subtitulo }
      : { titulo: "JACKPOT DE LA IA", mega: "¡¡TE DEJARON EN LA LONA!!", subtitulo };

    const nodo = crearElemento("div", {
      html: estructura(textos),
      atributos: { id: "jackpot", class: esDelJugador ? "" : "es-rival", "aria-live": "assertive" },
    });

    sortearCaidas(nodo);
    document.body.appendChild(nodo);
    new Espectaculo(nodo, esDelJugador, alTerminar).empezar();
  });
}

/** El guion del espectáculo: programa cada fase y limpia al acabar. */
class Espectaculo {
  constructor(nodo, esDelJugador, alTerminar) {
    this.nodo = nodo;
    this.esDelJugador = esDelJugador;
    this.alTerminar = alTerminar;
    this.temporizadores = [];
    this.intervalos = [];
    this.terminado = false;
    this.alSaltar = () => this.terminar(true);
  }

  /** Apunta un temporizador para poder cancelarlo si se salta. */
  en(ms, accion) {
    this.temporizadores.push(setTimeout(accion, ms));
  }

  /** Cambia de fase: el CSS cuelga cada animación de estas clases. */
  fase(nombre) {
    this.nodo.classList.add(`fase-${nombre}`);
  }

  rodillos() {
    return [...this.nodo.querySelectorAll(".jp-rodillo")];
  }

  empezar() {
    this.fase("entrada");
    this.en(MOMENTOS.palanca, () => this.girar());
    this.en(MOMENTOS.rodillo1, () => this.parar(0));
    this.en(MOMENTOS.rodillo2, () => this.parar(1));
    this.en(MOMENTOS.suspenso, () => this.rodillos()[2].classList.add("suspenso"));
    this.en(MOMENTOS.jackpot, () => this.jackpot());
    this.en(MOMENTOS.subida, () => this.fase("subida"));
    this.en(MOMENTOS.otraTirada, () => this.girar());
    this.en(MOMENTOS.mega, () => this.mega());
    this.en(MOMENTOS.salida, () => this.fase("salida"));
    this.en(MOMENTOS.fin, () => this.terminar(false));
    this.programarContador();
    this.en(SALTABLE_DESDE_MS, () => this.permitirSaltar());
  }

  /** Palanca abajo y los tres rodillos a girar, con su tic-tic-tic. */
  girar() {
    this.fase("palanca");
    reiniciarAnimacion(this.nodo.querySelector(".jp-palanca"), "tirada");
    gestorAudio.efecto("parada");

    this.rodillos().forEach((r) => {
      r.classList.remove("parado", "suspenso");
      r.classList.add("girando");
    });

    this.pararTics();
    this.intervalos.push(setInterval(() => gestorAudio.efecto("rodillo"), TIC_RODILLO_MS));
  }

  /** Para un rodillo en su símbolo, con rebote y chispas. */
  parar(indice) {
    const r = this.rodillos()[indice];
    r.style.setProperty("--parada", PARADAS[indice]);
    r.classList.remove("girando", "suspenso");
    reiniciarAnimacion(r, "parado");
    gestorAudio.efecto("parada");

    const caja = r.getBoundingClientRect();
    particulas.emitir(caja.left + caja.width / 2, caja.top + caja.height / 2, "#ffd23f", 22, 6);
  }

  pararTics() {
    this.intervalos.forEach(clearInterval);
    this.intervalos = [];
  }

  /** El primer golpe de la música: tercer rodillo y JACKPOT. */
  jackpot() {
    this.parar(2);
    this.pararTics();
    this.fase("jackpot");
    gestorAudio.efecto("jackpot");
    destello(this.esDelJugador ? "rgba(255,210,63,.55)" : "rgba(254,95,85,.55)");
    golpeDeCamara(true);
    fuegosArtificiales(6, this.esDelJugador);
  }

  /** El golpe fuerte de la música: los tres rodillos a la vez y todo revienta. */
  mega() {
    [0, 1, 2].forEach((indice) => this.parar(indice));
    this.pararTics();
    this.fase("mega");
    gestorAudio.efecto("jackpot");
    destello("rgba(255,255,255,.75)");
    golpeDeCamara(true);
    fuegosArtificiales(12, this.esDelJugador);

    for (let ms = 900; MOMENTOS.mega + ms < MOMENTOS.salida; ms += 900) {
      this.en(ms, () => fuegosArtificiales(3, this.esDelJugador));
    }
  }

  /** El número del multiplicador, cada vez más deprisa. */
  programarContador() {
    const numero = this.nodo.querySelector(".jp-numero");

    calendarioDelContador().forEach(([ms, texto]) => {
      this.en(ms, () => {
        numero.textContent = texto;
        reiniciarAnimacion(numero, "sube");
        if (ms > MOMENTOS.subida) gestorAudio.efecto("moneda");
      });
    });
  }

  permitirSaltar() {
    if (this.terminado) return;

    this.nodo.classList.add("saltable");
    window.addEventListener("pointerdown", this.alSaltar);
    window.addEventListener("keydown", this.alSaltar);
  }

  /** Limpia todo. Si se saltó, un fundido rápido; si no, ya venía fundido. */
  terminar(saltado) {
    if (this.terminado) return;
    this.terminado = true;

    this.temporizadores.forEach(clearTimeout);
    this.pararTics();
    window.removeEventListener("pointerdown", this.alSaltar);
    window.removeEventListener("keydown", this.alSaltar);

    if (saltado) this.fase("salida-rapida");
    setTimeout(() => {
      this.nodo.remove();
      this.alTerminar();
    }, saltado ? SALIDA_RAPIDA_MS : 0);
  }
}
