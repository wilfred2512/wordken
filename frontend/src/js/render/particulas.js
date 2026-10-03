/**
 * Sistema de partículas sobre un <canvas> a pantalla completa.
 *
 * Cuadraditos con gravedad y rozamiento. El bucle solo corre mientras quedan
 * partículas vivas: cuando la lista se vacía, se apaga solo y no gasta nada.
 */
import { bucleDeAnimacion } from "../core/bucle-animacion.js";

const GRAVEDAD = 0.34;
const ROZAMIENTO = 0.99;
const IMPULSO_HACIA_ARRIBA = 2;
const MAXIMO_POR_DEFECTO = 220;

export class SistemaDeParticulas {
  constructor(maximo = MAXIMO_POR_DEFECTO) {
    this.maximo = maximo;
    this.particulas = [];
    this.lienzo = null;
    this.contexto = null;
    this.activo = false;
  }

  /** Crea el canvas la primera vez y lo mantiene del tamaño de la ventana. */
  montar() {
    if (this.lienzo) return;

    this.lienzo = document.createElement("canvas");
    this.lienzo.id = "lienzo-efectos";
    this.lienzo.setAttribute("aria-hidden", "true");
    document.body.appendChild(this.lienzo);

    this.contexto = this.lienzo.getContext("2d");
    this.redimensionar();
    window.addEventListener("resize", () => this.redimensionar());
  }

  redimensionar() {
    if (!this.lienzo) return;
    this.lienzo.width = window.innerWidth;
    this.lienzo.height = window.innerHeight;
  }

  /** Crea una partícula suelta con dirección aleatoria. */
  crearParticula(x, y, color, fuerza) {
    const angulo = Math.random() * Math.PI * 2;
    const velocidad = fuerza * (0.35 + Math.random());

    return {
      x,
      y,
      velocidadX: Math.cos(angulo) * velocidad,
      velocidadY: Math.sin(angulo) * velocidad - IMPULSO_HACIA_ARRIBA,
      vida: 1,
      desgaste: 0.012 + Math.random() * 0.02,
      tamano: 2 + Math.random() * 4,
      giro: Math.random() * 6,
      color,
    };
  }

  /** Suelta un chorro de partículas desde un punto. */
  emitir(x, y, color, cantidad = 26, fuerza = 7) {
    this.montar();

    const hueco = Math.max(0, this.maximo - this.particulas.length);
    const total = Math.min(cantidad, hueco);

    for (let i = 0; i < total; i++) {
      this.particulas.push(this.crearParticula(x, y, color, fuerza));
    }

    this.arrancar();
  }

  /** Mueve una partícula un fotograma. Devuelve false si ha muerto. */
  avanzarParticula(particula) {
    particula.x += particula.velocidadX;
    particula.y += particula.velocidadY;
    particula.velocidadY += GRAVEDAD;
    particula.velocidadX *= ROZAMIENTO;
    particula.vida -= particula.desgaste;

    return particula.vida > 0;
  }

  /** Dibuja una partícula girada sobre sí misma. */
  dibujarParticula(particula) {
    const contexto = this.contexto;

    contexto.save();
    contexto.globalAlpha = Math.max(0, particula.vida);
    contexto.fillStyle = particula.color;
    contexto.translate(particula.x, particula.y);
    particula.giro += 0.15;
    contexto.rotate(particula.giro);
    contexto.fillRect(-particula.tamano, -particula.tamano, particula.tamano * 2, particula.tamano * 2);
    contexto.restore();
  }

  /** Un fotograma completo. Devuelve false cuando ya no queda nada que pintar. */
  dibujarFotograma() {
    this.contexto.clearRect(0, 0, this.lienzo.width, this.lienzo.height);
    this.particulas = this.particulas.filter((particula) => this.avanzarParticula(particula));
    this.particulas.forEach((particula) => this.dibujarParticula(particula));

    if (this.particulas.length > 0) return true;

    this.activo = false;
    return false;
  }

  /** Engancha el sistema al bucle global si no estaba ya enganchado. */
  arrancar() {
    if (this.activo) return;

    this.activo = true;
    bucleDeAnimacion.anadir(() => this.dibujarFotograma());
  }
}

export const particulas = new SistemaDeParticulas();
