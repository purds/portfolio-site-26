import { Title3D } from "./grid-title-3d";

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
  cellSize: 20,
  gap: 2,
  cornerRadius: 6,
  fadeTime: 1800,
  trailWidth: 2,
  fastTrailWidth: 5,
  velocityThreshold: 600,
};

export interface TitleInputs {
  mouseX: number | null;
  mouseY: number | null;
  scrollProgress: number;
  introYaw: number;
}

const SOLID_DURATION_MS = 5000;
const FADE_DURATION_MS = 5000;

// Rest rotation offsets (radians).
const REST_YAW = (15 * Math.PI) / 180;
const REST_PITCH = (8 * Math.PI) / 180;

// Mouse pitch mapping range (radians).
const MOUSE_PITCH_RANGE = (15 * Math.PI) / 180;

// Scroll drives pitch from rest to full flip (180°) over the hero's scroll range.
const SCROLL_PITCH_RANGE = Math.PI;

// Breathing amplitudes (radians) and period (ms).
const BREATH_YAW_AMP = (2 * Math.PI) / 180;
const BREATH_PITCH_AMP = (1 * Math.PI) / 180;
const BREATH_PERIOD_MS = 6000;

// Spring stiffness for mouse-follow damping. Higher = tighter.
const MOUSE_SPRING_STIFFNESS = 8;

// Number of quantized opacity buckets for batched title rendering.
const OPACITY_BUCKETS = 10;

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
  private running = false;
  private reducedMotion = false;

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
    delay: number;
    phase: number;
    turbulenceAngle: number;
    age: number;
  }[] = [];

  private solidBox: {
    minCol: number;
    maxCol: number;
    minRow: number;
    maxRow: number;
    createdAt: number;
  } | null = null;

  // 3D title state
  private title3D: Title3D | null = null;
  private titleInputs: TitleInputs = {
    mouseX: null,
    mouseY: null,
    scrollProgress: 0,
    introYaw: 0,
  };
  // Damped mouse-yaw state, tracked independently from raw input so we can
  // spring-follow the target.
  private dampedMouseYaw = 0;
  private dampedMousePitch = 0;
  private lastFrameTime = 0;

  // Pre-allocated bucket arrays reused each frame to avoid allocation in draw().
  private bucketColX: Float32Array[] = [];
  private bucketColY: Float32Array[] = [];
  private bucketCount: Int32Array = new Int32Array(OPACITY_BUCKETS);
  private bucketCapacity = 0;

  private _mouseLocal: { x: number; y: number } | null = null;

  // Idle breathing state (cursor-rest pulse, unrelated to block breathing).
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
    if (typeof window !== "undefined" && window.matchMedia) {
      this.reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }
    this.ensureBucketCapacity(1024);
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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
        if (dc * dc + dr * dr > radius * radius) continue;

        this.cells[r][c].activation = 1;
        this.cells[r][c].activatedAt = now;
      }
    }
  }

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

  endSelection(commit: boolean) {
    this.selecting = false;
    if (!this.selectionStart || !this.selectionEnd) return;

    if (commit) {
      const minCol = Math.min(this.selectionStart.col, this.selectionEnd.col);
      const maxCol = Math.max(this.selectionStart.col, this.selectionEnd.col);
      const minRow = Math.min(this.selectionStart.row, this.selectionEnd.row);
      const maxRow = Math.max(this.selectionStart.row, this.selectionEnd.row);

      if (maxCol > minCol || maxRow > minRow) {
        this.solidBox = {
          minCol,
          maxCol,
          minRow,
          maxRow,
          createdAt: performance.now(),
        };
      }
    }

    this.selectionStart = null;
    this.selectionEnd = null;
  }

  clickSelection(mouseX: number, mouseY: number) {
    if (!this.solidBox) return false;

    const step = this.config.cellSize + this.config.gap;
    const col = Math.floor(mouseX / step);
    const row = Math.floor(mouseY / step);

    const { minCol, maxCol, minRow, maxRow } = this.solidBox;
    if (col < minCol || col > maxCol || row < minRow || row > maxRow) {
      return false;
    }

    this.spawnDisintegration(minCol, maxCol, minRow, maxRow);
    this.solidBox = null;
    return true;
  }

  private spawnDisintegration(
    minCol: number,
    maxCol: number,
    minRow: number,
    maxRow: number,
  ) {
    const centerCol = (minCol + maxCol) / 2;
    const centerRow = (minRow + maxRow) / 2;

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

        if (dist === 0) {
          const angle = Math.random() * Math.PI * 2;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
        } else {
          dx /= dist;
          dy /= dist;
        }

        const normalizedDist = maxDist > 0 ? dist / maxDist : 0;
        const delay = Math.floor(normalizedDist * 18 + Math.random() * 6);

        this.disintegratingCells.push({
          col: c,
          row: r,
          x: cell.x,
          y: cell.y,
          vx: dx * (0.8 + Math.random() * 1.2),
          vy: dy * (0.8 + Math.random() * 1.2),
          opacity: 1,
          delay,
          phase: Math.random() * Math.PI * 2,
          turbulenceAngle: Math.random() * Math.PI * 2,
          age: 0,
        });

        cell.activation = 1;
        cell.activatedAt = performance.now();
      }
    }
  }

  // Backward-compat: accepts a single line or two lines. Two lines build a
  // 3D block with lines[0] on the front face and lines[1] on the back.
  initTitle(lines: string | string[]) {
    const textLines = Array.isArray(lines) ? lines : [lines];
    const frontText = textLines[0] ?? "";
    const backText = textLines[1] ?? textLines[0] ?? "";
    this.title3D = new Title3D({ frontText, backText });
  }

  setTitleInputs(inputs: TitleInputs): void {
    this.titleInputs = inputs;
  }

  setMousePosition(x: number, y: number) {
    this._mouseLocal = { x, y };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    const tick = () => {
      if (!this.running) return;
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  pauseLoop(): void {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resumeLoop(): void {
    if (this.running) return;
    this.lastFrameTime = performance.now();
    this.start();
  }

  private ensureBucketCapacity(cellCount: number) {
    if (cellCount <= this.bucketCapacity) return;
    const cap = Math.max(cellCount, this.bucketCapacity * 2, 256);
    this.bucketColX = [];
    this.bucketColY = [];
    for (let i = 0; i < OPACITY_BUCKETS; i++) {
      this.bucketColX.push(new Float32Array(cap));
      this.bucketColY.push(new Float32Array(cap));
    }
    this.bucketCapacity = cap;
  }

  // Compute the block's total (yaw, pitch) for this frame and apply it to
  // the Title3D instance. Mouse input is spring-damped.
  private updateTitleRotation(now: number) {
    if (!this.title3D) return;

    const dt = Math.max(0, Math.min(0.1, (now - this.lastFrameTime) / 1000));
    this.lastFrameTime = now;

    const {
      mouseX,
      mouseY,
      scrollProgress,
      introYaw,
    } = this.titleInputs;

    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    // Target mouse yaw/pitch from raw cursor position.
    const targetMouseYaw =
      mouseX === null || w === 0
        ? 0
        : -Math.PI + (mouseX / w) * 2 * Math.PI;
    const targetMousePitch =
      mouseY === null || h === 0
        ? 0
        : -MOUSE_PITCH_RANGE + (mouseY / h) * 2 * MOUSE_PITCH_RANGE;

    if (this.reducedMotion) {
      this.dampedMouseYaw = targetMouseYaw;
      this.dampedMousePitch = targetMousePitch;
    } else {
      const springAlpha = 1 - Math.exp(-dt * MOUSE_SPRING_STIFFNESS);
      this.dampedMouseYaw +=
        (targetMouseYaw - this.dampedMouseYaw) * springAlpha;
      this.dampedMousePitch +=
        (targetMousePitch - this.dampedMousePitch) * springAlpha;
    }

    const scrollPitch = scrollProgress * SCROLL_PITCH_RANGE;

    let breathYaw = 0;
    let breathPitch = 0;
    if (!this.reducedMotion) {
      const t = (now * 2 * Math.PI) / BREATH_PERIOD_MS;
      breathYaw = BREATH_YAW_AMP * Math.sin(t);
      breathPitch = BREATH_PITCH_AMP * Math.sin(t + Math.PI / 2);
    }

    const yaw =
      REST_YAW + introYaw + this.dampedMouseYaw + breathYaw;
    const pitch =
      REST_PITCH + this.dampedMousePitch + scrollPitch + breathPitch;

    this.title3D.setRotation(yaw, pitch);
  }

  private draw() {
    const { cellSize, gap, cornerRadius, fadeTime } = this.config;
    const step = cellSize + gap;
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const now = performance.now();

    ctx.clearRect(0, 0, w, h);

    // --- Compute title cell opacities (done before the cell sweep so we can
    //     render the title in a single batched pass afterwards).
    let titleCells: Map<string, number> | null = null;
    if (this.title3D) {
      this.updateTitleRotation(now);
      const centerCol = Math.floor(this.cols / 2);
      const centerRow = Math.floor(this.rows / 2);
      titleCells = this.title3D.computeCellOpacities(centerCol, centerRow);
    }

    // --- Background grid: decay activation, draw dormant/activated cell fills
    //     and the hidden-image reveal where activated.
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];

        if (cell.activation > 0) {
          const elapsed = now - cell.activatedAt;
          cell.activation = Math.max(0, 1 - elapsed / fadeTime);
        }

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

    // --- 3D title: batch fills by opacity bucket.
    if (titleCells && titleCells.size > 0) {
      this.ensureBucketCapacity(titleCells.size);
      const bc = this.bucketCount;
      for (let i = 0; i < OPACITY_BUCKETS; i++) bc[i] = 0;

      for (const [key, opacity] of titleCells) {
        if (opacity < 0.01) continue;
        const commaIdx = key.indexOf(",");
        const col = +key.substring(0, commaIdx);
        const row = +key.substring(commaIdx + 1);
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) continue;

        // Bucket index 0..OPACITY_BUCKETS-1. Quantize to ceil so low opacities
        // still render (e.g. 0.03 -> bucket 0 is reserved for near-zero skip).
        let bucket = Math.ceil(opacity * OPACITY_BUCKETS) - 1;
        if (bucket < 0) bucket = 0;
        if (bucket >= OPACITY_BUCKETS) bucket = OPACITY_BUCKETS - 1;

        const idx = bc[bucket];
        this.bucketColX[bucket][idx] = col * step;
        this.bucketColY[bucket][idx] = row * step;
        bc[bucket] = idx + 1;
      }

      for (let b = 0; b < OPACITY_BUCKETS; b++) {
        const n = bc[b];
        if (n === 0) continue;
        const bucketAlpha = (b + 1) / OPACITY_BUCKETS;
        ctx.beginPath();
        const xs = this.bucketColX[b];
        const ys = this.bucketColY[b];
        for (let i = 0; i < n; i++) {
          ctx.roundRect(xs[i], ys[i], cellSize, cellSize, cornerRadius);
        }
        ctx.fillStyle = `rgba(255, 95, 31, ${bucketAlpha})`;
        ctx.fill();
      }
    }

    // --- Idle breathing pulse near the cursor (unchanged behavior).
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
          const phase = bc * 0.5 + br * 0.7;
          const breath =
            0.04 + 0.06 * Math.sin(now * 0.003 + phase) * falloff;
          const cell = this.cells[br][bc];
          ctx.beginPath();
          ctx.roundRect(cell.x, cell.y, cellSize, cellSize, cornerRadius);
          ctx.fillStyle = `rgba(255, 95, 31, ${breath})`;
          ctx.fill();
        }
      }
    }

    // --- Active-drag selection preview (dashed outline).
    if (this.selectionStart && this.selectionEnd) {
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
        (maxRow - minRow + 1) * step + 2,
      );
      ctx.setLineDash([]);
    }

    // --- Committed solid box.
    if (this.solidBox) {
      const elapsed = now - this.solidBox.createdAt;
      if (elapsed >= SOLID_DURATION_MS + FADE_DURATION_MS) {
        this.solidBox = null;
      } else {
        const alpha =
          elapsed <= SOLID_DURATION_MS
            ? 1
            : 1 - (elapsed - SOLID_DURATION_MS) / FADE_DURATION_MS;

        const { minCol, maxCol, minRow, maxRow } = this.solidBox;
        ctx.fillStyle = "#FF5F1F";
        ctx.globalAlpha = alpha;
        for (let r = minRow; r <= maxRow; r++) {
          if (r < 0 || r >= this.rows) continue;
          for (let c = minCol; c <= maxCol; c++) {
            if (c < 0 || c >= this.cols) continue;
            const cell = this.cells[r][c];
            ctx.beginPath();
            ctx.roundRect(cell.x, cell.y, cellSize, cellSize, cornerRadius);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
    }

    // --- Disintegrating cells (unchanged).
    for (let i = this.disintegratingCells.length - 1; i >= 0; i--) {
      const dc = this.disintegratingCells[i];

      if (dc.age < dc.delay) {
        const shimmer =
          0.4 + 0.6 * Math.abs(Math.sin(dc.age * 0.3 + dc.phase));
        ctx.globalAlpha = shimmer * 0.6;
        ctx.fillStyle = "#FF5F1F";
        ctx.beginPath();
        ctx.roundRect(dc.x, dc.y, cellSize, cellSize, cornerRadius);
        ctx.fill();
        ctx.globalAlpha = 1;
        dc.age++;
        continue;
      }

      dc.turbulenceAngle += (Math.random() - 0.5) * 0.6;
      const turbStrength = 0.4;
      dc.vx += Math.cos(dc.turbulenceAngle) * turbStrength;
      dc.vy += Math.sin(dc.turbulenceAngle) * turbStrength;

      dc.x += dc.vx;
      dc.y += dc.vy;
      dc.vx *= 0.92;
      dc.vy *= 0.92;

      const activeAge = dc.age - dc.delay;
      const baseFade = Math.max(0, 1 - activeAge * 0.008);
      const shimmer = 0.5 + 0.5 * Math.sin(activeAge * 0.15 + dc.phase);
      dc.opacity = baseFade * (0.4 + shimmer * 0.6);

      if (baseFade <= 0) {
        this.disintegratingCells.splice(i, 1);
        continue;
      }

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
