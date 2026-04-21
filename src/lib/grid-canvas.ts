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
    delay: number;        // frames before this cell starts moving
    phase: number;        // random phase for shimmer oscillation
    turbulenceAngle: number; // slowly drifting angle for flow-field wander
    age: number;          // frames since spawn
  }[] = [];

  // Letter cell state
  private letterCells: Map<string, TitleCell> = new Map();
  private _mouseLocal: { x: number; y: number } | null = null;

  // Idle breathing state
  private lastMouseMoveTime = 0;
  private lastMouseCol = -1;
  private lastMouseRow = -1;

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

    // Track idle state: update timestamp only when cursor moves to a new cell
    if (col !== this.lastMouseCol || row !== this.lastMouseRow) {
      this.lastMouseMoveTime = now;
      this.lastMouseCol = col;
      this.lastMouseRow = row;
    }

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

    // Trigger disintegration — staggered ripple from center
    const centerCol = (minCol + maxCol) / 2;
    const centerRow = (minRow + maxRow) / 2;

    // Find max distance for normalizing delay
    let maxDist = 0;
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const d = Math.sqrt((c - centerCol) ** 2 + (r - centerRow) ** 2);
        if (d > maxDist) maxDist = d;
      }
    }

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

        // Stagger onset: inner cells dissolve first, outer cells wait
        const normalizedDist = maxDist > 0 ? dist / maxDist : 0;
        const delay = Math.floor(normalizedDist * 18 + Math.random() * 6);

        this.disintegratingCells.push({
          col: c,
          row: r,
          x: cell.x,
          y: cell.y,
          vx: dx * (0.8 + Math.random() * 1.2),   // much slower — fluid, not explosive
          vy: dy * (0.8 + Math.random() * 1.2),
          opacity: 1,
          delay,
          phase: Math.random() * Math.PI * 2,       // random shimmer phase
          turbulenceAngle: Math.random() * Math.PI * 2, // initial wander direction
          age: 0,
        });

        cell.activation = 1;
        cell.activatedAt = performance.now();
      }
    }

    this.selectionStart = null;
    this.selectionEnd = null;
    return true;
  }

  // Title methods — accepts a single string or array of lines
  initTitle(lines: string | string[]) {
    const charWidth = 5;
    const desiredSpacing = 2;
    const glyphHeight = 7;
    const lineGap = 2; // rows between lines
    const availableCols = this.cols - 2;

    const textLines = Array.isArray(lines) ? lines : [lines];

    // Total height of all lines stacked
    const totalHeight = textLines.length * glyphHeight + (textLines.length - 1) * lineGap;
    const baseRow = Math.floor(this.rows / 2) - Math.floor(totalHeight / 2);

    this.letterCells.clear();

    for (let i = 0; i < textLines.length; i++) {
      const text = textLines[i];
      const row = baseRow + i * (glyphHeight + lineGap);

      // Dynamic spacing per line
      let letterSpacing = desiredSpacing;
      const totalWidthDesired = text.length * charWidth + (text.length - 1) * desiredSpacing;
      if (totalWidthDesired > availableCols) {
        const gapBudget = availableCols - text.length * charWidth;
        letterSpacing = Math.max(0, Math.floor(gapBudget / Math.max(1, text.length - 1)));
      }

      const totalWidth = text.length * charWidth + (text.length - 1) * letterSpacing;
      const startCol = Math.max(0, Math.floor((this.cols - totalWidth) / 2));

      const cells = getLetterCells(text, startCol, row, letterSpacing);
      for (const cell of cells) {
        this.letterCells.set(`${cell.col},${cell.row}`, cell);
      }
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

    // Idle breathing: gentle pulse when cursor rests for 2.5s+
    const idleTime = now - this.lastMouseMoveTime;
    if (idleTime > 2500 && this.lastMouseCol >= 0) {
      const breathRadius = 2;
      for (let dr = -breathRadius; dr <= breathRadius; dr++) {
        for (let dc = -breathRadius; dc <= breathRadius; dc++) {
          const br = this.lastMouseRow + dr;
          const bc = this.lastMouseCol + dc;
          if (br < 0 || br >= this.rows || bc < 0 || bc >= this.cols) continue;
          const dist = Math.sqrt(dc * dc + dr * dr);
          if (dist > breathRadius) continue;
          const falloff = 1 - dist / (breathRadius + 1);
          const phase = bc * 0.5 + br * 0.7; // offset per cell
          const breath = 0.04 + 0.06 * Math.sin(now * 0.003 + phase) * falloff;
          const cell = this.cells[br][bc];
          ctx.beginPath();
          ctx.roundRect(cell.x, cell.y, cellSize, cellSize, cornerRadius);
          ctx.fillStyle = `rgba(255, 95, 31, ${breath})`;
          ctx.fill();
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

    // Draw and update disintegrating cells — grid-snapped fluid dissolve
    const step = this.config.cellSize + this.config.gap;
    for (let i = this.disintegratingCells.length - 1; i >= 0; i--) {
      const dc = this.disintegratingCells[i];

      // Staggered onset: cell stays put and shimmers until delay expires
      if (dc.age < dc.delay) {
        // Pre-dissolve shimmer — cell pulses in place
        const shimmer = 0.4 + 0.6 * Math.abs(Math.sin(dc.age * 0.3 + dc.phase));
        ctx.globalAlpha = shimmer * 0.6;
        ctx.fillStyle = "#FF5F1F";
        ctx.beginPath();
        ctx.roundRect(dc.x, dc.y, cellSize, cellSize, cornerRadius);
        ctx.fill();
        ctx.globalAlpha = 1;
        dc.age++;
        continue;
      }

      // Turbulence: slowly rotate wander angle, apply small perpendicular drift
      dc.turbulenceAngle += (Math.random() - 0.5) * 0.6;
      const turbStrength = 0.4;
      dc.vx += Math.cos(dc.turbulenceAngle) * turbStrength;
      dc.vy += Math.sin(dc.turbulenceAngle) * turbStrength;

      // Physics: move with heavy drag (viscous fluid)
      dc.x += dc.vx;
      dc.y += dc.vy;
      dc.vx *= 0.92;
      dc.vy *= 0.92;

      // Shimmer opacity: oscillate while fading out
      const activeAge = dc.age - dc.delay;
      const baseFade = Math.max(0, 1 - activeAge * 0.008);
      const shimmer = 0.5 + 0.5 * Math.sin(activeAge * 0.15 + dc.phase);
      dc.opacity = baseFade * (0.4 + shimmer * 0.6);

      if (baseFade <= 0) {
        this.disintegratingCells.splice(i, 1);
        continue;
      }

      // Snap render position to nearest grid cell
      const snapX = Math.round(dc.x / step) * step;
      const snapY = Math.round(dc.y / step) * step;

      ctx.globalAlpha = dc.opacity * 0.7;
      ctx.fillStyle = "#FF5F1F";
      ctx.beginPath();
      ctx.roundRect(snapX, snapY, cellSize, cellSize, cornerRadius);
      ctx.fill();
      ctx.globalAlpha = 1;

      dc.age++;
    }
  }

  destroy() {
    this.stop();
  }
}
