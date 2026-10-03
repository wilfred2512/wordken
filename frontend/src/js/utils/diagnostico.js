/**
 * Modo diagnóstico: los avisos técnicos, solo para quien los pide.
 *
 * Quien juega no tiene por qué leer «el modelo tardó más de 20000 ms» ni
 * «arranca el backend»: a él se le habla normal. Pero a quien desarrolla el
 * juego esos avisos le ahorran media hora de buscar, así que no se borran:
 * se esconden detrás de un interruptor.
 *
 * Se enciende abriendo el juego con `?diagnostico` al final de la dirección:
 *
 *     http://127.0.0.1:5500/?diagnostico
 *
 * Con él vuelven la etiqueta «IA: llama3.2» del chat, el motivo de cada
 * respuesta de repuesto, la marca «IA» en lo que dice EL GENIO y las
 * instrucciones para levantar el servidor.
 */
export const MODO_DIAGNOSTICO = new URLSearchParams(window.location.search).has("diagnostico");
