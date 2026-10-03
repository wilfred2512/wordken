/**
 * El ayudante: un chat que explica cómo se juega, sin salir del juego.
 *
 * Tiene dos cerebros y cambia de uno a otro sin avisar al jugador:
 *   · si el servidor tiene un modelo de lenguaje configurado, le pregunta
 *   · si no, responde con la tabla de modules/faq-juego.js
 * La diferencia se nota en la calidad de la respuesta, no en que funcione o
 * deje de funcionar: el enunciado pide un chatbot, y un chatbot que solo
 * arranca si alguien paga una API no le sirve a nadie que corrija esto.
 *
 * Al jugador se le habla siempre normal. Qué cerebro contestó y por qué falló
 * el modelo solo se enseña en modo diagnóstico (ver utils/diagnostico.js).
 *
 * Se construye desde aquí y no desde el HTML porque es una capa flotante que
 * vive por encima de todas las pantallas, igual que los efectos.
 */
import { crearElemento } from "../utils/dom.js";
import { responderSinModelo, PREGUNTAS_SUGERIDAS } from "../modules/faq-juego.js";
import { preguntarAlAyudante, comprobarModelo } from "../services/servicio-mente.js";
import { gestorAudio } from "../modules/audio/gestor-audio.js";
import { MODO_DIAGNOSTICO } from "../utils/diagnostico.js";

const SALUDO =
  "¡Hola! Soy el ayudante de WordKen. Pregúntame lo que quieras sobre cómo se juega.";

const ESTRUCTURA =
  '<button class="chat-abrir" type="button" aria-label="Abrir el ayudante">?</button>' +
  '<section class="chat-panel" hidden>' +
  '<header class="chat-cabecera"><b>AYUDANTE</b><small class="chat-estado" hidden></small>' +
  '<button class="chat-cerrar" type="button" aria-label="Cerrar">&#10005;</button></header>' +
  '<div class="chat-mensajes" aria-live="polite"></div>' +
  '<div class="chat-sugerencias"></div>' +
  '<form class="chat-pie">' +
  '<input class="chat-campo" type="text" maxlength="200" autocomplete="off" placeholder="¿Qué es la cadena?">' +
  '<button class="chat-enviar" type="submit" aria-label="Enviar">&#10148;</button>' +
  "</form></section>";

let nodo = null;
let hayModelo = false;
let sinServidor = false;
let esperando = false;

/** La conversación, en el formato que entiende el backend. */
const conversacion = [];

/** Añade una burbuja al panel y baja el scroll. */
function anadirMensaje(texto, deQuien) {
  const lista = nodo.querySelector(".chat-mensajes");

  lista.appendChild(crearElemento("p", { clase: `chat-burbuja ${deQuien}`, texto }));
  lista.scrollTop = lista.scrollHeight;
}

/** Pinta los botones de preguntas rápidas. */
function pintarSugerencias() {
  const caja = nodo.querySelector(".chat-sugerencias");
  caja.innerHTML = "";

  PREGUNTAS_SUGERIDAS.forEach((pregunta) => {
    const boton = crearElemento("button", {
      clase: "chat-sugerencia",
      texto: pregunta,
      atributos: { type: "button" },
    });

    boton.addEventListener("click", () => enviar(pregunta));
    caja.appendChild(boton);
  });
}

/**
 * Vuelve a preguntar si hay modelo cuando la primera vez salió que no.
 *
 * La comprobación del arranque se hace nada más cargar la página, y es muy
 * fácil que para entonces el backend todavía no esté levantado: basta con
 * abrir el juego antes de arrancar el servidor, que es justo el orden en que
 * lo hace cualquiera. Sin esto, el ayudante se quedaba con sus respuestas de
 * repuesto para el resto de la sesión aunque el modelo apareciera un minuto
 * después, y la única forma de enterarse era recargar.
 */
async function reconsiderarModelo() {
  if (hayModelo) return true;

  pintarEstado(await comprobarModelo());
  return hayModelo;
}

/** La etiqueta de la cabecera tal como la quiere ver quien desarrolla. */
function estadoTecnico(estado) {
  if (hayModelo) return `IA: ${estado.modelo ?? "conectada"}`;
  return sinServidor ? "IA: sin backend" : "IA: apagada";
}

/**
 * La etiqueta de la cabecera.
 *
 * Al jugador solo le dice «en línea» cuando hay un modelo contestando, y si
 * no lo hay no le dice nada: el ayudante funciona igual y no hay nada que él
 * pueda arreglar. El nombre del modelo y el motivo de que falte son cosa del
 * modo diagnóstico.
 */
function pintarEstado(estado) {
  hayModelo = Boolean(estado.disponible);
  sinServidor = Boolean(estado.sinServidor);
  nodo.classList.toggle("con-modelo", hayModelo);

  const etiqueta = nodo.querySelector(".chat-estado");
  etiqueta.textContent = MODO_DIAGNOSTICO ? estadoTecnico(estado) : "en línea";
  etiqueta.hidden = !hayModelo && !MODO_DIAGNOSTICO;
}

/** Por qué se contestó con la tabla y no con el modelo. Solo en diagnóstico. */
function notaTecnica(motivo) {
  if (sinServidor) return "respuesta de repuesto · el backend no responde (¿lo arrancaste?)";
  if (!hayModelo) return "respuesta de repuesto · el backend no tiene IA configurada";
  return `respuesta de repuesto · ${motivo ?? "el modelo no contestó"}`;
}

/**
 * Contesta con el modelo si lo hay, y si no con la tabla de respuestas.
 * Devuelve el texto y, si hubo que tirar de la tabla, la nota técnica.
 */
async function contestar(pregunta) {
  if (!(await reconsiderarModelo())) {
    return { texto: responderSinModelo(pregunta), nota: notaTecnica() };
  }

  const resultado = await preguntarAlAyudante([...conversacion]);
  if (resultado.respuesta) return { texto: resultado.respuesta, nota: null };

  if (resultado.sinServidor) sinServidor = true;
  return {
    texto: responderSinModelo(pregunta, { seAtasco: true }),
    nota: notaTecnica(resultado.motivo),
  };
}

/** Manda una pregunta y espera la respuesta. */
async function enviar(pregunta) {
  const texto = pregunta.trim();
  if (texto.length === 0 || esperando) return;

  esperando = true;
  nodo.classList.add("pensando");
  anadirMensaje(texto, "del-jugador");
  conversacion.push({ role: "user", content: texto });

  const { texto: respuesta, nota } = await contestar(texto);

  conversacion.push({ role: "assistant", content: respuesta });
  anadirMensaje(respuesta, "del-ayudante");
  if (nota && MODO_DIAGNOSTICO) anadirMensaje(nota, "chat-nota");
  nodo.classList.remove("pensando");
  esperando = false;
}

/** Abre o cierra el panel. */
function alternar(abrir) {
  const panel = nodo.querySelector(".chat-panel");

  panel.hidden = !abrir;
  nodo.classList.toggle("abierto", abrir);
  gestorAudio.efecto("clic");

  if (abrir) nodo.querySelector(".chat-campo").focus();
}

/** Conecta el botón, el aspa, el formulario y la tecla Escape. */
function conectar() {
  const campo = nodo.querySelector(".chat-campo");

  nodo.querySelector(".chat-abrir").addEventListener("click", () => {
    alternar(nodo.querySelector(".chat-panel").hidden);
  });
  nodo.querySelector(".chat-cerrar").addEventListener("click", () => alternar(false));

  nodo.querySelector(".chat-pie").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const escrito = campo.value;
    campo.value = "";
    enviar(escrito);
  });

  // El chat se come sus propias teclas: si no, escribir "papel" jugaría papel.
  campo.addEventListener("keydown", (evento) => evento.stopPropagation());
}

/**
 * Crea el ayudante y pregunta si hay modelo.
 * Se llama una sola vez, al arrancar el juego.
 */
export async function montarAyudante() {
  if (nodo) return;

  nodo = crearElemento("div", { html: ESTRUCTURA, atributos: { id: "chat-ayuda" } });
  document.body.appendChild(nodo);

  conectar();
  pintarSugerencias();
  anadirMensaje(SALUDO, "del-ayudante");

  pintarEstado(await comprobarModelo());
}
