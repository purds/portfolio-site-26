export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number; // 0-1, decays to 0
  decay: number; // decay rate per frame
}

export class ParticleEngine {
  particles: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles = 50) {
    this.maxParticles = maxParticles;
  }

  emit(
    x: number,
    y: number,
    count: number,
    config: {
      color: string;
      speed?: number;
      size?: number;
      decay?: number;
      spread?: number;
      direction?: number;
    }
  ) {
    const {
      color,
      speed = 3,
      size = 6,
      decay = 0.02,
      spread = Math.PI * 2,
      direction = 0,
    } = config;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = direction + (Math.random() - 0.5) * spread;
      const v = speed * (0.5 + Math.random() * 0.5);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        size: size * (0.7 + Math.random() * 0.6),
        opacity: 0.8 + Math.random() * 0.2,
        color,
        life: 1,
        decay: decay * (0.8 + Math.random() * 0.4),
      });
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97; // friction
      p.vy *= 0.97;
      p.life -= p.decay;
      p.opacity = p.life * 0.8;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, cornerRadius = 3) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(
        p.x - p.size / 2,
        p.y - p.size / 2,
        p.size,
        p.size,
        cornerRadius
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  get count() {
    return this.particles.length;
  }
}
