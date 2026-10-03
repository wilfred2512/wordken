/**
 * Verificador de las normas del enunciado (sección 4, "normas contra el
 * código espagueti").
 *
 * Comprueba de forma automática lo que el profesor va a comprobar a mano:
 *   · ningún archivo pasa de 300 líneas
 *   · ninguna función pasa de 40 líneas
 *   · como mucho 3 niveles de anidación
 *   · ni un console.log de depuración
 *   · ni onclick, ni <style>, ni style="" en el HTML
 *   · nombres de archivos y carpetas en kebab-case
 *
 * Uso:  node herramientas/verificar-normas.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, extname, relative } from "node:path";

const RAIZ = process.cwd();
const MAXIMO_LINEAS_ARCHIVO = 300;
const MAXIMO_LINEAS_FUNCION = 40;
const MAXIMO_ANIDACION = 3;

const CARPETAS_IGNORADAS = new Set(["node_modules", ".git", "datos", "assets"]);
const EXTENSIONES = new Set([".js", ".mjs", ".css", ".html"]);
const PATRON_KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)*$/;

const incidencias = [];

/** Apunta un incumplimiento. */
function anotar(archivo, regla, detalle) {
  incidencias.push({ archivo: relative(RAIZ, archivo), regla, detalle });
}

/** Recorre el proyecto devolviendo los archivos que hay que revisar. */
function recorrer(carpeta, encontrados = []) {
  readdirSync(carpeta).forEach((nombre) => {
    if (CARPETAS_IGNORADAS.has(nombre)) return;

    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) recorrer(ruta, encontrados);
    else if (EXTENSIONES.has(extname(nombre))) encontrados.push(ruta);
  });

  return encontrados;
}

/**
 * Quita comentarios, cadenas y caracteres escapados para que no falseen el
 * conteo de llaves. Lo de los escapes es por las expresiones regulares: en
 * `/\{/g` la llave no abre ningún bloque, pero al contar caracteres sí lo
 * parecería.
 */
function limpiar(linea) {
  return linea
    .replace(/\\./g, "")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``")
    .replace(/\/\/.*$/, "");
}

const INICIO_DE_FUNCION = /(function\s|=>\s*\{|^\s*(async\s+)?[\w$]+\s*\([^)]*\)\s*\{)/;

/** Cierra las funciones que terminan en esta línea y mide su longitud. */
function cerrarFunciones(ruta, pila, profundidad, numeroDeLinea) {
  while (pila.length > 0 && profundidad <= pila.at(-1).nivel) {
    const funcion = pila.pop();
    const largo = numeroDeLinea - funcion.linea + 1;

    if (largo > MAXIMO_LINEAS_FUNCION) {
      anotar(ruta, "función > 40 líneas", `línea ${funcion.linea}, ${largo} líneas`);
    }
  }
}

/** Longitud de cada función y profundidad máxima de anidación. */
function revisarFunciones(ruta, lineas) {
  const pila = [];
  let profundidad = 0;
  let profundidadMaxima = 0;

  lineas.forEach((cruda, indice) => {
    const linea = limpiar(cruda);
    const abre = (linea.match(/\{/g) ?? []).length;
    const cierra = (linea.match(/\}/g) ?? []).length;

    if (INICIO_DE_FUNCION.test(linea) && abre > 0) pila.push({ linea: indice + 1, nivel: profundidad });

    profundidad += abre - cierra;
    profundidadMaxima = Math.max(profundidadMaxima, profundidad);
    cerrarFunciones(ruta, pila, profundidad, indice + 1);
  });

  // La anidación se mide desde dentro de la función: el primer nivel de
  // llaves es el cuerpo, así que se descuenta.
  const anidacion = Math.max(0, profundidadMaxima - 1);
  if (anidacion > MAXIMO_ANIDACION) {
    anotar(ruta, "anidación > 3 niveles", `profundidad ${anidacion}`);
  }
}

/** Reglas que aplican a cualquier archivo de texto. */
function revisarArchivo(ruta) {
  const contenido = readFileSync(ruta, "utf8");
  const lineas = contenido.split("\n");
  const extension = extname(ruta);

  if (!PATRON_KEBAB.test(basename(ruta))) {
    anotar(ruta, "nombre no kebab-case", basename(ruta));
  }

  if (lineas.length > MAXIMO_LINEAS_ARCHIVO) {
    anotar(ruta, "archivo > 300 líneas", `${lineas.length} líneas`);
  }

  lineas.forEach((linea, indice) => {
    if (/\bconsole\.(log|debug|info)\s*\(/.test(linea)) {
      anotar(ruta, "console.log de depuración", `línea ${indice + 1}`);
    }
  });

  if (extension === ".html") revisarHtml(ruta, contenido);
  if (extension === ".css") hojasDeEstilo.push({ ruta, contenido });
  if (extension === ".js" || extension === ".mjs") revisarFunciones(ruta, lineas);
}

/** Las hojas se guardan para revisarlas juntas: una animación puede estar
    definida en un archivo y usarse desde otro. */
const hojasDeEstilo = [];

/** Reglas propias del HTML. */
function revisarHtml(ruta, contenido) {
  if (/\son[a-z]+\s*=/.test(contenido)) anotar(ruta, "manejador de eventos en el HTML", "on...=");
  if (/<style[\s>]/.test(contenido)) anotar(ruta, "etiqueta <style> en el HTML", "<style>");
  if (/\sstyle\s*=/.test(contenido)) anotar(ruta, "atributo style= en el HTML", 'style="..."');
}

/**
 * Propiedades que una animación INFINITA puede mover sin que cueste.
 *
 * Son las que el navegador resuelve en la tarjeta gráfica. Cualquier otra
 * obliga a repintar o a recalcular el diseño en CADA fotograma, y eso, en
 * una animación que no termina nunca, es lo que hacía que el juego se
 * arrastrara según avanzaba la partida. Está contado en relevo.md, regla 13.
 */
const PROPIEDADES_BARATAS = new Set([
  "transform", "translate", "rotate", "scale", "opacity", "filter",
  "visibility", "animation-timing-function", "offset-distance",
]);

/** Nombres de animación que alguna regla usa con `infinite`. */
function nombresInfinitos(css) {
  const nombres = new Set();

  for (const trozo of css.matchAll(/animation(?:-name)?:\s*([^;]+);/g)) {
    if (trozo[1].includes("infinite")) {
      trozo[1].split(",").forEach((parte) => nombres.add(parte.trim().split(/\s+/)[0]));
    }
  }

  return nombres;
}

/** Comprueba que ninguna animación infinita mueva algo caro de pintar. */
function revisarAnimaciones(hojas) {
  const infinitas = new Set();
  hojas.forEach(({ contenido }) => nombresInfinitos(contenido).forEach((n) => infinitas.add(n)));

  for (const { ruta, contenido } of hojas) {
    for (const bloque of contenido.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
      if (!infinitas.has(bloque[1])) continue;

      const caras = [...bloque[2].matchAll(/([a-z-]+)\s*:/g)]
        .map((p) => p[1])
        .filter((p) => !PROPIEDADES_BARATAS.has(p));

      if (caras.length > 0) {
        anotar(ruta, "animación infinita que repinta", `@${bloque[1]} mueve ${[...new Set(caras)].join(", ")}`);
      }
    }
  }
}

/** Imprime el informe y decide el código de salida. */
function informar(archivos) {
  const escribir = (texto) => process.stdout.write(`${texto}\n`);

  escribir(`Archivos revisados: ${archivos.length}`);

  if (incidencias.length === 0) {
    escribir("\nTODAS LAS NORMAS DEL ENUNCIADO SE CUMPLEN.");
    return 0;
  }

  escribir(`\n${incidencias.length} incumplimientos:\n`);
  incidencias.forEach((i) => escribir(`  [${i.regla}] ${i.archivo} — ${i.detalle}`));
  return 1;
}

const archivos = recorrer(RAIZ);
archivos.forEach(revisarArchivo);
revisarAnimaciones(hojasDeEstilo);
process.exit(informar(archivos));
