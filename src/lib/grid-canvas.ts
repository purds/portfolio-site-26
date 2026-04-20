import { getLetterCells, getDirectionalAscii, type TitleCell } from "./grid-title";

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

  // Selection state
  private selecting = false;
  private selectionStart: { col: number; row: number } | null = null;
  private selectionEnd: { col: number; row: number } | null = null;
  private disintegratingCells: {
    col: number;
    row: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    opacity: number;
  }[] = [];

  // Letter cell state
  private letterCells: Map<string, TitleCell> = new Map();
  private _mouseLocal: { x: number; y: number } | null = null;

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

  // Selection methods
  startSelection(mouseX: number, mouseY: number) {
    const step = this.config.cellSize + this.config.gap;
    this.selectionStart = {
      col: Math.floor(mouseX / step),
      row: Math.floor(mouseY / step),
    };
    this.selectionEnd = { ...this.selectionStart };
    this.selecting = true;
  }

  updateSelection(mouseX: number, mouseY: number) {
    if (!this.selecting) return;
    const step = this.config.cellSize + this.config.gap;
    this.selectionEnd = {
      col: Math.floor(mouseX / step),
      row: Math.floor(mouseY / step),
    };
  }

  endSelection() {
    this.selecting = false;
  }

  clickSelection(mouseX: number, mouseY: number) {
    if (!this.selectionStart || !this.selectionEnd) return false;

    const step = this.config.cellSize + this.config.gap;
    const col = Math.floor(mouseX / step);
    const row = Math.floor(mouseY / step);

    const minCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
    const maxCol = Math.max(this.selectionStart.col, this.selectionEnd.col);
    const minRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
    const maxRow = Math.max(this.selectionStart.row, this.selectionEnd.row);

    if (col < minCol || col > maxCol || row < minRow || row > maxRow) {
      this.selectionStart = null;
      this.selectionEnd = null;
      return false;
    }

    // Trigger disintegration
    const centerCol = (minCol + maxCol) / 2;
    const centerRow = (minRow + maxRow) / 2;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) continue;
        const cell = this.cells[r][c];
        let dx = c - centerCol;
        let dy = r - centerRow;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Single-cell selection: give random outward direction
        if (dist === 0) {
          const angle = Math.random() * Math.PI * 2;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
        } else {
          dx /= dist;
          dy /= dist;
        }

        this.disintegratingCells.push({
          col: c,
          row: r,
          x: cell.x,
          y: cell.y,
          vx: dx * (3 + Math.random() * 4),
          vy: dy * (3 + Math.random() * 4),
          opacity: 1,
        });

        cell.activation = 1;
        cell.activatedAt = performance.now();
      }
    }

    this.selectionStart = null;
    this.selectionEnd = null;
    return true;
  }

  // Title methods
  initTitle(text: string) {
    const charWidth = 5;
    const letterSpacing = 2;
    const totalWidth = text.length * (charWidth + letterSpacing) - letterSpacing;
    const startCol = Math.floor((this.cols - totalWidth) / 2);
    const startRow = Math.floor(this.rows / 2) - 3;

    const cells = getLetterCells(text, startCol, startRow, letterSpacing);
    this.letterCells.clear();
    for (const cell of cells) {
      this.letterCells.set(`${cell.col},${cell.row}`, cell);
    }
  }

  setMousePosition(x: number, y: number) {
    this._mouseLocal = { x, y };
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
        const key = `${cell.col},${cell.row}`;
        const letterCell = this.letterCells.get(key);

        if (letterCell) {
          // Letter cell: slightly more visible at rest
          const baseAlpha = 0.08;
          const alpha = baseAlpha + cell.activation * 0.7;

          ctx.beginPath();
          ctx.roundRect(cell.x, cell.y, cellSize, cellSize, cornerRadius);
          ctx.fillStyle = `rgba(26, 26, 26, ${alpha})`;
          ctx.fill();

          // Draw directional ASCII character when mouse position is known
          if (this._mouseLocal) {
            const ascii = getDirectionalAscii(
              this._mouseLocal.x,
              this._mouseLocal.y,
              cell.x + cellSize / 2,
              cell.y + cellSize / 2
            );
            ctx.fillStyle = `rgba(26, 26, 26, ${0.3 + cell.activation * 0.5})`;
            ctx.font = `${cellSize * 0.6}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(ascii, cell.x + cellSize / 2, cell.y + cellSize / 2);
          }
        } else {
          // Non-letter cell: original rendering
          const alpha = 0.02 + cell.activation * 0.6;
          ctx.beginPath();
          ctx.roundRect(cell.x, cell.y, cellSize, cellSize, cornerRadius);

          if (cell.activation > 0.01 && this.hiddenImage) {
            ctx.save();
            ctx.clip();
            ctx.globalAlpha = cell.activation * 0.8;
            ctx.drawImage(this.hiddenImage, 0, 0, w, h);
            ctx.restore();
          } else {
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.04})`;
            ctx.fill();
          }
        }
      }
    }

    // Draw selection box
    if (this.selectionStart && this.selectionEnd) {
      const step = this.config.cellSize + this.config.gap;
      const minCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
      const maxCol = Math.max(this.selectionStart.col, this.selectionEnd.col);
      const minRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
      const maxRow = Math.max(this.selectionStart.row, this.selectionEnd.row);

      ctx.strokeStyle = "rgba(255, 95, 31, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        minCol * step - 1,
        minRow * step - 1,
        (maxCol - minCol + 1) * step + 2,
        (maxRow - minRow + 1) * step + 2
      );
      ctx.setLineDash([]);
    }

    // Draw and update disintegrating cells
    for (let i = this.disintegratingCells.length - 1; i >= 0; i--) {
      const dc = this.disintegratingCells[i];
      dc.x += dc.vx;
      dc.y += dc.vy;
      dc.vx *= 0.96;
      dc.vy *= 0.96;
      dc.opacity -= 0.015;

      if (dc.opacity <= 0) {
        this.disintegratingCells.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = dc.opacity * 0.6;
      ctx.fillStyle = "#FF5F1F";
      ctx.beginPath();
      ctx.roundRect(dc.x, dc.y, this.config.cellSize, this.config.cellSize, this.config.cornerRadius);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  destroy() {
    this.stop();
  }
}
