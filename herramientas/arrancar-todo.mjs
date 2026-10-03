/**
 * Arranca el juego entero con un solo comando: el backend, el servidor del
 * frontend y el navegador.
 *
 * Es lo que hay detrás de `jugar.bat`, `jugar.sh` y `npm start`.
 *
 * Uso:  node herramientas/arrancar-todo.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, copyFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { arrancarServidorEstatico } from "./servidor-estatico.mjs";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CARPETA_BACKEND = join(RAIZ, "backend");
const PUERTO_JUEGO = 5500;
const ESPERA_ANTES_DE_ABRIR_MS = 1200;

/**
 * Versión mínima de Node. El backend usa el SQLite que trae Node dentro
 * (`node:sqlite`), que existe sin opciones especiales desde la 22.13.
 */
const NODE_MINIMO = [22, 13];

/** Escribe en la consola sin usar console.log. */
function anunciar(texto) {
  process.stdout.write(`${texto}\n`);
}

/** Crea el .env a partir del ejemplo la primera vez. */
function asegurarEntorno() {
  const destino = join(CARPETA_BACKEND, ".env");
  if (existsSync(destino)) return;

  copyFileSync(join(CARPETA_BACKEND, ".env.example"), destino);
  anunciar("Creado backend/.env a partir de .env.example.");
}

/**
 * Para en seco con un mensaje claro si Node es demasiado viejo, en vez de
 * dejar que el backend reviente más tarde con un error incomprensible.
 */
function comprobarVersionDeNode() {
  const [mayor, menor] = process.versions.node.split(".").map(Number);
  const [mayorMinimo, menorMinimo] = NODE_MINIMO;
  if (mayor > mayorMinimo || (mayor === mayorMinimo && menor >= menorMinimo)) return;

  anunciar(`Este juego necesita Node ${mayorMinimo}.${menorMinimo} o más nuevo, y tienes el ${process.versions.node}.`);
  anunciar("Descarga la versión LTS desde https://nodejs.org, instálala y vuelve a probar.\n");
  process.exit(1);
}

/**
 * true si las dependencias del backend ya están instaladas.
 * Se mira un paquete concreto y no solo la carpeta node_modules: una carpeta
 * vacía o a medias (una instalación cortada) también cuenta como "no hay".
 */
function hayDependencias() {
  return existsSync(join(CARPETA_BACKEND, "node_modules", "express", "package.json"));
}

/**
 * Instala las dependencias del backend si faltan, como haría `npm install`.
 * Así un clon recién bajado de GitHub arranca con un solo `npm start`.
 * Son tres paquetes de JavaScript puro: no hay nada que compilar.
 */
function instalarDependencias() {
  if (hayDependencias()) return true;

  anunciar("Primera vez: instalando las dependencias del backend (tarda poco)...\n");
  const resultado = spawnSync("npm", ["install", "--no-audit", "--no-fund"], {
    cwd: CARPETA_BACKEND,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  return resultado.status === 0 && hayDependencias();
}

/**
 * Lanza el backend como proceso aparte.
 * Devuelve null si no se puede, para que el juego arranque igual: la tabla de
 * puntuaciones es un extra, no un requisito para jugar.
 */
function lanzarBackend() {
  if (!instalarDependencias()) {
    anunciar("No se pudieron instalar las dependencias del backend (¿hay internet?).");
    anunciar("El juego arrancará igual, pero sin tabla de puntuaciones ni IA.\n");
    return null;
  }

  asegurarEntorno();

  // El aviso de "SQLite es experimental" de Node no aporta nada al jugador.
  const hijo = spawn(process.execPath, ["--disable-warning=ExperimentalWarning", "server.js"], {
    cwd: CARPETA_BACKEND,
    stdio: "inherit",
  });

  hijo.on("error", (error) => anunciar(`No se pudo arrancar el backend: ${error.message}`));
  return hijo;
}

/** Comando del sistema que abre el navegador. */
function comandoDeNavegador(url) {
  if (process.platform === "win32") return ["cmd", ["/c", "start", "", url]];
  if (process.platform === "darwin") return ["open", [url]];
  return ["xdg-open", [url]];
}

/** Abre el juego en el navegador por defecto. */
function abrirNavegador(url) {
  const [comando, argumentos] = comandoDeNavegador(url);

  try {
    spawn(comando, argumentos, { stdio: "ignore", detached: true }).unref();
  } catch (error) {
    anunciar(`Abre tú mismo ${url} (no se pudo lanzar el navegador).`);
  }
}

/** Cierra el backend al parar el lanzador, para no dejarlo colgado. */
function prepararApagado(backend) {
  const apagar = () => {
    if (backend) backend.kill();
    process.exit(0);
  };

  ["SIGINT", "SIGTERM"].forEach((senal) => process.on(senal, apagar));
}

function arrancar() {
  const url = `http://localhost:${PUERTO_JUEGO}`;

  anunciar("=== Lanzador del juego ===\n");
  comprobarVersionDeNode();
  const backend = lanzarBackend();

  arrancarServidorEstatico(PUERTO_JUEGO);
  prepararApagado(backend);

  setTimeout(() => {
    abrirNavegador(url);
    anunciar(`\nSi no se abre solo, entra en ${url}`);
    anunciar("Para cerrar todo: pulsa Ctrl+C en esta ventana.\n");
  }, ESPERA_ANTES_DE_ABRIR_MS);
}

arrancar();
