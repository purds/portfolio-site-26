export interface GridConfig {
  cellSize: number;
  gap: number;
  cornerRadius: number;
  fadeTime: number; // ms for activated cell to fade back
  trailWidth: number; // cells radius around cursor
  fastTrailWidth: number; // cells radius at high velocity
  velocityThreshold: number; // px/sec to switch to fast trail
}

export const defaultGridConfig: GridConfig = {
  cellSize: 28,
  gap: 3,
  cornerRadius: 6,
  fadeTime: 1800,
  trailWidth: 2,
  fastTrailWidth: 5,
  velocityThreshold: 600,
};

interface Cell {
  col: number;
  row: number;
  x: number;
  y: number;
  activation: number; // 0 = dormant, 1 = fully active
  activatedAt: number; // timestamp
}

export class GridCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cells: Cell[][] = [];
  private config: GridConfig;
  private cols = 0;
  private rows = 0;
  private hiddenImage: HTMLImageElement | null = null;
  private raf = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: Partial<GridConfig> = {},
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.config = { ...defaultGridConfig, ...config };
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);

    const { cellSize, gap } = this.config;
    const step = cellSize + gap;
    this.cols = Math.ceil(w / step) + 1;
    this.rows = Math.ceil(h / step) + 1;

    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          col: c,
          row: r,
          x: c * step,
          y: r * step,
          activation: 0,
          activatedAt: 0,
        });
      }
      this.cells.push(row);
    }
  }

  setHiddenImage(img: HTMLImageElement) {
    this.hiddenImage = img;
  }

  activateAt(mouseX: number, mouseY: number, velocity: number) {
    const { cellSize, gap, trailWidth, fastTrailWidth, velocityThreshold } =
      this.config;
    const step = cellSize + gap;
    const col = Math.floor(mouseX / step);
    const row = Math.floor(mouseY / step);
    const radius =
      velocity > velocityThreshold ? fastTrailWidth : trailWidth;
    const now = performance.now();

    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;
        // Circle mask
        if (dc * dc + dr * dr > radius * radius) continue;

        this.cells[r][c].activation = 1;
        this.cells[r][c].activatedAt = now;
      }
    }
  }

  start() {
    const tick = () => {
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  private draw() {
    const { cellSize, cornerRadius, fadeTime } = this.config;
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const now = performance.now();

    ctx.clearRect(0, 0, w, h);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];

        // Fade decay
        if (cell.activation > 0) {
          const elapsed = now - cell.activatedAt;
          cell.activation = Math.max(0, 1 - elapsed / fadeTime);
        }

        // Draw cell
        const alpha = 0.02 + cell.activation * 0.6;
        ctx.beginPath();
        ctx.roundRect(cell.x, cell.y, cellSize, cellSize, cornerRadius);

        if (cell.activation > 0.01 && this.hiddenImage) {
          // Reveal hidden image through this cell
          ctx.save();
          ctx.clip();
          ctx.globalAlpha = cell.activation * 0.8;
          ctx.drawImage(this.hiddenImage, 0, 0, w, h);
          ctx.restore();
        } else {
          // Dormant cell — faint texture hint
          ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.04})`;
          ctx.fill();
        }
      }
    }
  }

  destroy() {
    this.stop();
  }
}
