# 3D Extruded PURDYGOOD Hero Title — Design

**Date:** 2026-04-21
**Status:** Design approved via brainstorming Q&A, ready for implementation planning.
**Scope:** Replace the flat pixel-grid PURDYGOOD title with a 3D-extruded, rotation-responsive monolith that lives inside the existing pixel-grid rendering system.

## Context

The current hero title renders PURDY and GOOD as two stacked lines of 5×7 pixel glyphs inside the `GridCanvas` engine. Each lit glyph cell is a grid cell that participates in the cursor trail / activation system. It's a flat composition; the only motion comes from the user's cursor trail passing through it.

This redesign turns the title into a single 3D object. At rest it reads as a chunky orange monolith with **PURDY** painted on the front face. The twist — discovered during an intro spin on page load, and re-triggerable by mouse or scroll — is that the **back face is a different word**: **GOOD**. The surprise lands because 3D text almost always reads the same word from every side; finding a second word back there is the delight.

The object stays inside the existing grid rendering paradigm (per `feedback_grid_rendering.md`: *"the grid IS the display, not a backdrop"*). Every rendered cell snaps to an integer (col, row) position — we're software-rasterizing a 3D voxel block onto the grid, not overlaying a WebGL canvas.

## Composition

**Grid density for the hero.** `defaultGridConfig.cellSize` is reduced from 28→**20**, `gap` from 3→**2** (step = 22). This gives the 43-cell-wide block room to sit and rotate inside a 1024px+ canvas. Cursor trail / selection-box / disintegration all continue to work — they're all step-agnostic.

**Geometry.** A single rectangular voxel block. Width = max(PURDY width, GOOD width) = **43 cells**. Height = **9 cells**. Depth = **12 cells**. PURDY and GOOD are both centered horizontally within the 43-cell width (PURDY fills it edge-to-edge; GOOD sits centered with ~4 cells of body on each side).

Voxels are classified by position:
- **Front face** (`z = 0`): `letter` if the voxel coincides with a lit PURDY glyph cell; otherwise `body`.
- **Back face** (`z = 11`): `letter` if it coincides with a lit GOOD glyph cell (using GOOD's centered offset); otherwise `body`.
- **Side faces** (`x = 0` or `x = 42`): `body`. No letter content on sides.
- **Top / bottom** (`y = 0` or `y = 8`): `body`.
- **Interior** (`1 ≤ z ≤ 10`, not on a side/top/bottom edge): `body` but never visible after z-buffer — these never face camera.

Conceptually this is the "chunky blocks, nearly flush" look from the brainstorm: PURDY and GOOD are extruded into two ~6-cell slabs that meet seamlessly at `z = 5 / z = 6`, sharing the same outer rectangular silhouette.

**Glyphs.** Redesigned at 7 columns × 9 rows, with a 2-cell stroke weight. Letters needed: P, U, R, D, Y, G, O. Hand-designed bitmap, same schema as the current `GLYPHS` map in `grid-title.ts`.
- PURDY: 5 letters × 7 + 4 × 2 letter-spacing = **43 cells wide, 9 rows tall**
- GOOD: 4 letters × 7 + 3 × 2 letter-spacing = **34 cells wide, 9 rows tall**
- GOOD is horizontally centered against PURDY.

**Projection.** Orthographic. Parallel lines stay parallel, no foreshortening. Reads natively on the discrete grid without fractional-scale jitter.

**Rest pose.** Fixed offset of **+15° yaw, +8° pitch** from dead head-on. One side face and the top edge are always faintly visible, so the object reads as 3D even when idle — Bauhaus monolith silhouette.

**Face tones (monochrome orange, opacity-only).** The only color in play is the site accent `#FF5F1F`. Side and top faces carry no letters, so they have a single tone.
| Face | Letter voxels | Body voxels |
|---|---|---|
| Front (`z = 0`) | 100% alpha | 40% alpha |
| Back (`z = 11`) | 100% alpha | 40% alpha |
| Side (`x = 0` or `42`) | — | 65% alpha |
| Top / bottom (`y = 0` or `8`) | — | 80% alpha |

Letter voxels always render brighter than body voxels on the same face, so the word never loses its read as the block rotates. At nearly-edge-on angles (e.g., a side face approaching 90° to the camera), opacity tapers toward 0 via `|cos(angle)|` so faces don't pop in and out hard.

**Idle behaviour.** A slow breathing oscillation continues whenever no input is active: ±2° yaw, ±1° pitch, 6-second sine cycle. Enough to signal "3D object, not a static image"; not enough to distract.

## Interaction model

Four independent inputs compose into a single `(yaw, pitch)` state each frame:

| Input | Drives | Range | Shape |
|---|---|---|---|
| Page load (one-shot) | `introYaw(t)` | 0° → +720° | GSAP `power3.out` over 1.5s; sign chosen so **right edge rotates toward viewer first**. End state (720° added to rest) is visually identical to rest pose since 720° = 2 full turns. |
| Mouse X over hero | `mouseYaw` | −180° … +180° | Linear map across hero width; spring-damped to target |
| Mouse Y over hero | `mousePitch` | −15° … +15° | Linear map across hero height; spring-damped |
| Scroll Y (page) | `scrollPitch` | 0° … +180° | Linear map from `hero.top = 0vh` (rest) to `hero.bottom = 0vh` (flipped); "farewell tumble" as hero scrolls out |
| Time (ambient) | `breathYaw`, `breathPitch` | ±2° / ±1° | `sin(t · 2π/6)`; suppressed whenever any input is active |

**Final rotation per frame:**
```
yaw   = restYaw + introYaw(t) + mouseYaw + breathYaw(t)
pitch = restPitch + mousePitch + scrollPitch + breathPitch(t)
```
(No `introPitch` — the intro is a pure yaw spin.)

**Spring tuning.** Stiffness and damping tuned to feel like "pushing a ~1 kg block through honey" — noticeable lag, no overshoot ringing. Specific values to dial in during implementation.

**Offscreen pause.** An `IntersectionObserver` on the hero element pauses the rotation/render loop once the hero is fully out of view. Resumes when it re-enters. No state is lost — the loop just stops ticking.

**Reduced motion (`prefers-reduced-motion: reduce`).** Skip the intro spin. Disable breathing. Block renders statically at rest pose. Mouse/scroll still yaw and pitch it (the interaction itself is intentional, not motion-sickness-hostile), but without spring lag — the block snaps directly to each frame's target.

## Rendering pipeline

Each frame, for the current `(yaw, pitch)`:

1. **Iterate the pre-computed surface voxel list.** Built once on mount, not per-frame. Only surface voxels are stored (front face, back face, 4 side faces) — interior voxels are never visible after z-buffer so we never add them. Each voxel carries: `{ x, y, z, faceOrigin: "front" | "back" | "sideX" | "sideY", isLetter: boolean }`. `isLetter` is true only for front/back face voxels that coincide with a lit glyph cell.
2. **Rotate** each voxel around the block center via `R_pitch · R_yaw · (v − center) + center`.
3. **Orthographic project**: `(screenX, screenY) = (rotated.x + offset.x, rotated.y + offset.y)`. Depth = `rotated.z`. Offset positions the block within the hero.
4. **Snap** `(screenX, screenY)` to the nearest grid cell `(col, row)`.
5. **Z-buffer** per cell: for each grid cell, keep only the voxel with the smallest `rotated.z` (nearest camera).
6. **Emit opacity** from the face-tones table (keyed on `faceOrigin` + `isLetter`), scaled by `|n · v̂|` where `n` is the voxel's original face normal rotated to camera space and `v̂` is the camera-forward axis. This `|cos(θ)|` factor dims faces as they become edge-on, preventing pop-in.
7. **Render**: `GridCanvas.draw()` iterates the resulting `Map<"col,row", opacity>` and `roundRect`s each lit cell at its opacity, using the existing cell-size / gap / corner-radius.

The existing cursor trail, selection box, and disintegration systems run in the same draw pass on top of the title.

**Napkin perf.** Surface voxels only:
- Front + back: 2 × (43 × 9) = **774**
- Left + right sides: 2 × (12 × 9) = **216**
- Top + bottom: 2 × (43 × 12) = **1032**
- Total: **~2 000** surface voxels.

At 60fps: ~120k rotation-matrix-muls/sec. Trivial in plain JS; no WebGL needed. (A bounding-volume early-reject on each axis-rotation test could cut this further, but isn't needed for perf.)

## Module layout

**New files:**
- `src/lib/grid-title-3d.ts` — the `Title3D` class. API:
  - `constructor({ frontText: "PURDY", backText: "GOOD" })`
  - `setRotation(yaw: number, pitch: number): void`
  - `computeCellOpacities(): Map<"col,row", { opacity: number; face: FaceKind }>`
  - Internal: voxel list, rotation + projection, z-buffer, face classification.
- `src/lib/grid-title-3d-glyphs.ts` — the 7×9 glyph bitmaps. Export:
  - `GLYPHS_3D: Record<string, number[][]>` for P, U, R, D, Y, G, O.
  - `GLYPH_WIDTH = 7`, `GLYPH_HEIGHT = 9`, `LETTER_SPACING = 2`, `STROKE = 2`.

**Changed files:**
- `src/lib/grid-canvas.ts` — replace the current `initTitle` / `letterCells` / `getDirectionalAscii` rendering block with a `Title3D` instance. Call `title3D.setRotation(...)` and `title3D.computeCellOpacities()` in `draw()`. The directional-ASCII-per-letter-cell behavior is **removed** (it's incompatible with a rotating 3D block where "letter cells" change each frame).
- `src/components/sections/HeroDesktop.tsx`:
  - Track mouse X/Y relative to the hero bounds (already partly wired via `useMouse`).
  - Track `window.scrollY` and the hero element's position via `getBoundingClientRect()` in a `scroll` listener (or on RAF, whichever is cleaner).
  - Call `grid.setTitleInputs({ mouseX, mouseY, scrollY })` each RAF tick.
  - Kick off a GSAP timeline on mount: `introYaw: +720° → 0°` with `power3.out` over 1.5s, then null out the intro channel.
  - Wire an `IntersectionObserver` on the hero container to pause/resume the grid's RAF loop.

**Untouched:** cursor trail, selection box (solid-box / disintegration lifecycle — the recent redesign stays as-is), breathing for cell-activation fade, letter-cell styling. All the interactions currently running in `GridCanvas` keep working on top of the 3D title.

## Performance (non-negotiable)

WebGL is deliberately rejected for this feature. Math-per-pixel is near zero — we're drawing ~400–600 flat rounded fills per frame, not doing per-pixel shading. WebGL's setup overhead (shader compile, VAO/VBO, separate context or full engine port) costs complexity without meaningful speedup, and Canvas 2D is the more portable target across Safari in particular.

To stay inside a 60fps budget on Safari at retina DPR, the implementation **must**:

1. **Voxel storage in typed arrays.** The pre-computed surface voxel list is a `Float32Array` of `[x0, y0, z0, x1, y1, z1, ...]` (9 slots per voxel: position, face-origin enum, letter flag, face-normal xyz). No per-frame allocation. No per-voxel object creation.
2. **Group fills by opacity bucket.** Quantize per-cell opacity into ~10 buckets (e.g., 10%, 20%, …, 100%). For each bucket, issue one `beginPath()`, `roundRect()` every cell in that bucket, then one `ctx.fill()`. Batching collapses ~500 paths/fills into ~10 fills per frame. This is 5–10× on Safari and worth the small refactor.
3. **Skip zero-alpha cells.** Never `beginPath()`/`fill()` a cell at <1% alpha.
4. **Offscreen pause.** `IntersectionObserver` on the hero element pauses the RAF loop when the hero is fully out of view. Safari is aggressive about offscreen throttling; explicit pause prevents jump-on-return artifacts.
5. **DPR cap at 2.** `canvas.width = clientWidth * Math.min(devicePixelRatio, 2)`. Retina 2× is worth it visually; 3× isn't, and desktop hardware rarely needs it. Explicit clamp.

**Dev-only FPS overlay.** During implementation, add a small FPS counter gated behind `process.env.NODE_ENV === "development"` (or a query-string flag). Target: sustained 60fps on a 2× retina MacBook Pro in Safari, Chrome, Firefox. If we miss it, tighten the opacity bucketing or drop voxel density before any fallback — WebGL is reconsidered only if we identify a specific, measured bottleneck that CPU can't solve.

**What we're *not* doing** (to keep scope honest): no Web Worker / OffscreenCanvas. At ~0.5ms of math per frame, moving to a worker adds postMessage overhead larger than the savings.

## Dependencies

- **GSAP** is already in the project (per `CLAUDE.md` / `DESIGN.md`). Use its core `gsap.to` for the intro tween. No new dependency.
- No WebGL, no Three.js, no matrix libs — the rotation math is small enough to hand-write.

## Removed behavior

- The **directional-ASCII character** rendered inside each letter cell (pointing toward the mouse) — this was a 2D-only trick that doesn't compose with a rotating 3D block. It's dropped.
- The **idle breathing highlight on the title** (the existing `breath` on letter cells around the cursor) — replaced by the new block-level breathing oscillation.

## Verification

This is canvas / rendering work with no useful automated tests. Verification is manual browser check:

1. `npm run dev`, open on desktop viewport (≥1024px).
2. On page load: block spins two full yaw revolutions toward viewer over ~1.5s, then settles at `(yaw 15°, pitch 8°)` rest pose.
3. Idle: observe the ±2° / 6-sec breathing — visible but barely.
4. Hover mouse at far right of hero: block rotates to show **GOOD** on the back face, letters bright orange.
5. Hover mouse at far left: block rotates the opposite way, also reaching GOOD.
6. Hover mouse top/bottom: subtle pitch of ±15°, side and top-or-bottom faces peek.
7. Scroll down the page: block pitches forward, tumbling as the hero scrolls out.
8. Scroll past hero fully: CPU drops — RAF loop paused.
9. Scroll back up: RAF resumes, block is still in position with current rotation state.
10. System-level **Reduce Motion** enabled: intro is skipped, breathing off, block snaps to rest pose. Mouse/scroll still respond but without spring lag.
11. Resize window: block stays correctly sized against the hero's new grid dimensions.
12. Confirm all existing hero interactions still work: cursor trail under/through the block, drawing solid-box selections on empty grid area, clicking a solid box to disintegrate. None regress.
13. TypeScript: `npx tsc --noEmit` stays clean.
14. Mobile viewport: no change — `HeroMobile` is still used on mobile.

## Open decisions deferred to implementation plan

Minor tuning values that are cheap to iterate on and don't change the shape of the design:
- Exact spring stiffness/damping for mouse follow.
- Exact `power3.out` vs. `power2.inOut` for intro easing.
- Whether `scrollPitch` should ease via `ScrollTrigger` or via a plain `scroll` listener with manual lerp.
- Whether the offscreen pause should be tied to `IntersectionObserver` or to the hero's own `ScrollTrigger` (since GSAP is already loaded).
