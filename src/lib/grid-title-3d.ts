import {
  GLYPH_HEIGHT,
  buildWordBitmap,
  wordBitmapWidth,
} from "./grid-title-3d-glyphs";

// Face kind enum stored as a small integer in the voxel Float32Array.
const FACE_FRONT = 0;
const FACE_BACK = 1;
const FACE_LEFT = 2;
const FACE_RIGHT = 3;
const FACE_TOP = 4;
const FACE_BOTTOM = 5;

// Per-face base opacity for body voxels (non-letter).
const BODY_OPACITY = [
  0.4, // front
  0.4, // back
  0.65, // left
  0.65, // right
  0.8, // top
  0.8, // bottom
];

// Letter voxels render at 1.0 alpha (before face-visibility taper).
const LETTER_OPACITY = 1.0;

// Stride in the voxel Float32Array:
//   0: x, 1: y, 2: z  (voxel position in block-local space, pre-rotation)
//   3: face enum
//   4: isLetter (0 or 1)
//   5: nx, 6: ny, 7: nz  (face normal, pre-rotation)
const STRIDE = 8;

export class Title3D {
  private voxels: Float32Array;
  private voxelCount: number;
  private width: number;
  private height: number;
  private depth: number;
  private centerX: number;
  private centerY: number;
  private centerZ: number;

  private yaw = 0;
  private pitch = 0;

  // Per-frame z-buffer, hoisted so computeCellOpacities() allocates nothing
  // beyond the returned Map (contract perf rule #2).
  private zBuffer = new Map<string, number>();

  constructor(opts: { frontText: string; backText: string; depth?: number }) {
    const frontBitmap = buildWordBitmap(opts.frontText);
    const backBitmap = buildWordBitmap(opts.backText);
    const frontWidth = wordBitmapWidth(opts.frontText);
    const backWidth = wordBitmapWidth(opts.backText);

    this.width = Math.max(frontWidth, backWidth);
    this.height = GLYPH_HEIGHT;
    this.depth = opts.depth ?? 12;

    this.centerX = (this.width - 1) / 2;
    this.centerY = (this.height - 1) / 2;
    this.centerZ = (this.depth - 1) / 2;

    const frontOffset = Math.floor((this.width - frontWidth) / 2);
    const backOffset = Math.floor((this.width - backWidth) / 2);

    // Build surface voxels. We iterate each surface face and add voxels, but
    // deduplicate by (x,y,z) so corner/edge voxels aren't counted twice.
    // Priority for face classification: front/back > sides > top/bottom.
    const seen = new Set<number>();
    const voxelData: number[] = [];

    const zFront = 0;
    const zBack = this.depth - 1;
    const xLeft = 0;
    const xRight = this.width - 1;
    const yTop = 0;
    const yBottom = this.height - 1;

    const keyOf = (x: number, y: number, z: number) =>
      (x * this.height + y) * this.depth + z;

    const addVoxel = (
      x: number,
      y: number,
      z: number,
      face: number,
      isLetter: boolean,
      nx: number,
      ny: number,
      nz: number,
    ) => {
      const k = keyOf(x, y, z);
      if (seen.has(k)) return;
      seen.add(k);
      voxelData.push(x, y, z, face, isLetter ? 1 : 0, nx, ny, nz);
    };

    // Front face (z = 0). Letter voxels lit from frontBitmap centered by frontOffset.
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const bx = x - frontOffset;
        const isLetter =
          bx >= 0 && bx < frontWidth && frontBitmap[y][bx] === 1;
        addVoxel(x, y, zFront, FACE_FRONT, isLetter, 0, 0, -1);
      }
    }

    // Back face (z = depth-1).
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const bx = x - backOffset;
        const isLetter =
          bx >= 0 && bx < backWidth && backBitmap[y][bx] === 1;
        addVoxel(x, y, zBack, FACE_BACK, isLetter, 0, 0, 1);
      }
    }

    // Left side (x = 0).
    for (let y = 0; y < this.height; y++) {
      for (let z = 0; z < this.depth; z++) {
        addVoxel(xLeft, y, z, FACE_LEFT, false, -1, 0, 0);
      }
    }

    // Right side (x = width-1).
    for (let y = 0; y < this.height; y++) {
      for (let z = 0; z < this.depth; z++) {
        addVoxel(xRight, y, z, FACE_RIGHT, false, 1, 0, 0);
      }
    }

    // Top face (y = 0).
    for (let x = 0; x < this.width; x++) {
      for (let z = 0; z < this.depth; z++) {
        addVoxel(x, yTop, z, FACE_TOP, false, 0, -1, 0);
      }
    }

    // Bottom face (y = height-1).
    for (let x = 0; x < this.width; x++) {
      for (let z = 0; z < this.depth; z++) {
        addVoxel(x, yBottom, z, FACE_BOTTOM, false, 0, 1, 0);
      }
    }

    this.voxelCount = voxelData.length / STRIDE;
    this.voxels = new Float32Array(voxelData);
  }

  setRotation(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = pitch;
  }

  /**
   * Project the voxel block to integer grid cells and return a Map
   * keyed by "col,row" of the final per-cell opacity (post z-buffer,
   * post face-visibility taper, post letter/body tone).
   *
   * centerCol/centerRow position the block's 3D center on the grid.
   */
  computeCellOpacities(
    centerCol: number,
    centerRow: number,
  ): Map<string, number> {
    const result = new Map<string, number>();

    // Z-buffer: smallest rotated.z wins per (col,row). Reused across frames.
    const zBuffer = this.zBuffer;
    zBuffer.clear();

    const cosY = Math.cos(this.yaw);
    const sinY = Math.sin(this.yaw);
    const cosX = Math.cos(this.pitch);
    const sinX = Math.sin(this.pitch);

    const cx = this.centerX;
    const cy = this.centerY;
    const cz = this.centerZ;

    const v = this.voxels;
    const count = this.voxelCount;

    for (let i = 0; i < count; i++) {
      const base = i * STRIDE;

      // Translate to center, rotate (yaw then pitch), translate back.
      const x0 = v[base] - cx;
      const y0 = v[base + 1] - cy;
      const z0 = v[base + 2] - cz;

      // Yaw around Y axis:
      //   x' = x*cosY + z*sinY
      //   y' = y
      //   z' = -x*sinY + z*cosY
      const x1 = x0 * cosY + z0 * sinY;
      const y1 = y0;
      const z1 = -x0 * sinY + z0 * cosY;

      // Pitch around X axis:
      //   x'' = x'
      //   y'' = y'*cosX - z'*sinX
      //   z'' = y'*sinX + z'*cosX
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Rotate the face normal; only the z component is needed for face-visibility
      // since the camera axis is (0,0,1). Yaw contributes via nx0*sinY terms, pitch
      // contributes via the final combine. Expand directly for speed.
      const nx0 = v[base + 5];
      const ny0 = v[base + 6];
      const nz0 = v[base + 7];
      const nz1 = -nx0 * sinY + nz0 * cosY; // yaw's z
      const nzR = ny0 * sinX + nz1 * cosX; // pitch's z
      // Camera looks along +z. Face is visible when its rotated normal has
      // negative z (pointing back toward camera).
      if (nzR >= 0) continue;

      // |n · v̂| taper. v̂ = (0,0,1) so |dot| = -nzR. How "face-on" the face is.
      const faceVisibility = -nzR; // in [0..1]
      if (faceVisibility < 0.01) continue;

      // Orthographic projection: drop z2 for screen placement, snap to grid cell.
      const col = Math.round(x2) + centerCol;
      const row = Math.round(y2) + centerRow;

      const face = v[base + 3] as number;
      const isLetter = v[base + 4] === 1;

      const baseTone = isLetter ? LETTER_OPACITY : BODY_OPACITY[face];
      const alpha = baseTone * faceVisibility;
      if (alpha < 0.01) continue;

      const key = `${col},${row}`;
      const prevZ = zBuffer.get(key);
      if (prevZ === undefined || z2 < prevZ) {
        zBuffer.set(key, z2);
        result.set(key, alpha);
      }
    }

    return result;
  }
}
