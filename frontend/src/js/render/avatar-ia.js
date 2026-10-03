/**
 * El avatar del rival: la carita que se asoma en la arena y comenta la partida.
 *
 * Se construye desde JavaScript y no desde el HTML a propósito. El enunciado
 * limita los archivos a 300 líneas e `index.html` ya iba justo, pero sobre
 * todo: el avatar es un trozo de interfaz que aparece y desaparece con la
 * partida, igual que las capas de efectos. Lo que es estructura fija vive en
 * el HTML; lo que va y viene, aquí.
 *
 * Este archivo no sabe NADA de reglas: recibe el nombre de un momento
 * ("ganaIa", "dueloPerdido"...) y se encarga de la cara, el bocadillo y la
 * animación. Quién decide que ha pasado eso es la escena.
 */
import { crearElemento, buscar, reiniciarAnimacion } from "../utils/dom.js";
import { obtenerPersonaje } from "../modules/personajes-ia.js";
import { frasesDe, ANIMO } from "../modules/frases-avatar.js";
import { elegirAlAzar } from "../utils/azar.js";
import { MODO_DIAGNOSTICO } from "../utils/diagnostico.js";

/** Cuánto se queda el bocadillo en pantalla. */
const DURACION_BOCADILLO_MS = 3400;

/**
 * Lo mínimo que una frase se queda antes de que otra pueda pisarla.
 *
 * Sin esto pasaban las dos cosas malas a la vez: o el rival se quedaba mudo
 * media partida porque el saludo bloqueaba todo lo demás, o las frases se
 * cambiaban tan rápido que no daba tiempo a leer ninguna. Un segundo y pico
 * es lo que cuesta leer una línea corta.
 */
const TIEMPO_MINIMO_EN_PANTALLA_MS = 1300;

/** Momentos tan importantes que cortan lo que se esté diciendo. */
const PRIORITARIOS = new Set(["ganaLaIa", "pierdeLaIa", "dueloPerdido", "dueloGanado"]);

const ESTRUCTURA =
  '<div class="avatar-bocadillo"><p class="avatar-frase"></p></div>' +
  '<div class="avatar-cara"><span class="avatar-emoji"></span></div>' +
  '<p class="avatar-nombre"></p>';

let nodo = null;
let personaje = null;
let ultimaFrase = "";
let temporizador = null;
let dichaEn = 0;

/** Crea el avatar dentro del hueco del rival, una sola vez. */
function asegurarNodo() {
  if (nodo?.isConnected) return nodo;

  const hueco = buscar(".hueco-rival");
  if (!hueco) return null;

  nodo = crearElemento("div", {
    html: ESTRUCTURA,
    atributos: { id: "avatar-ia", "aria-live": "polite" },
  });
  hueco.appendChild(nodo);

  return nodo;
}

/** Pone la cara correspondiente a un ánimo. */
function ponerCara(animo) {
  const emoji = personaje.caras[animo] ?? personaje.caras.quieto;
  const cara = nodo.querySelector(".avatar-cara");

  nodo.querySelector(".avatar-emoji").textContent = emoji;
  cara.className = `avatar-cara animo-${animo}`;
  reiniciarAnimacion(cara, "reacciona");
}

/** Escribe el bocadillo y programa su desaparición. */
function decir(texto, animo) {
  nodo.querySelector(".avatar-frase").textContent = texto;
  nodo.classList.add("hablando");
  ponerCara(animo);
  dichaEn = Date.now();

  clearTimeout(temporizador);
  temporizador = setTimeout(() => nodo.classList.remove("hablando"), DURACION_BOCADILLO_MS);
}

/**
 * Elige frase sin repetir la anterior.
 * Repetir la misma dos veces seguidas es lo que más delata que detrás hay una
 * lista y no alguien pensando, así que se descarta y se vuelve a sortear.
 */
function frasePara(momento) {
  const opciones = frasesDe(personaje.id, momento);
  if (opciones.length === 0) return null;

  const sinRepetir = opciones.filter((frase) => frase !== ultimaFrase);
  return elegirAlAzar(sinRepetir.length > 0 ? sinRepetir : opciones);
}

/**
 * Monta el avatar para una dificultad y lo saluda.
 * @param {string} dificultad
 */
export function montarAvatar(dificultad) {
  personaje = obtenerPersonaje(dificultad);
  if (!asegurarNodo()) return;

  nodo.style.setProperty("--color-avatar", personaje.color);
  nodo.querySelector(".avatar-nombre").textContent = personaje.nombre;
  nodo.classList.remove("hablando");
  ultimaFrase = "";

  ponerCara("quieto");
}

/**
 * El rival reacciona a algo que ha pasado.
 * @param {string} momento  clave de frases-avatar.js
 * @param {string} [textoPropio] frase concreta, si viene de un modelo real
 */
export function reaccionar(momento, textoPropio) {
  if (!personaje || !nodo?.isConnected) return;

  const texto = textoPropio ?? frasePara(momento);
  if (!texto) return;

  // Solo se respeta la frase anterior si acaba de salir: pasado ese momento,
  // lo último que ha ocurrido es siempre lo más interesante. Una frase escrita
  // por el modelo para ESTA ronda no espera nunca: por eso la pidió el juego.
  const manda = Boolean(textoPropio) || PRIORITARIOS.has(momento);
  const reciente = Date.now() - dichaEn < TIEMPO_MINIMO_EN_PANTALLA_MS;
  if (reciente && nodo.classList.contains("hablando") && !manda) return;

  ultimaFrase = texto;
  // En modo diagnóstico el bocadillo se marca cuando lo escribió el modelo: es
  // la única forma de saber, mirando la partida, si EL GENIO está pensando de
  // verdad o tirando de sus frases de repuesto. Al jugador no se le enseña.
  nodo.classList.toggle("habla-el-modelo", MODO_DIAGNOSTICO && Boolean(textoPropio));
  decir(texto, ANIMO[momento] ?? "quieto");
}

/** Cara de "estoy decidiendo", mientras la IA piensa su tirada. */
export function ponerAPensar(pensando) {
  if (!personaje || !nodo?.isConnected) return;
  nodo.classList.toggle("pensando", pensando);
}

/** Quita el avatar al salir de la partida. */
export function desmontarAvatar() {
  clearTimeout(temporizador);
  nodo?.remove();
  nodo = null;
  personaje = null;
}
