# 3D Hero Title — Module API Contract (lock)

**Context.** Two agents ("engine" and "wiring") are implementing this feature in parallel. This file is the **locked interface contract** between their modules. Do not deviate without coordinating via `SendMessage` first.

See the design spec for what we're building:
`docs/superpowers/specs/2026-04-21-hero-title-3d-design.md`

---

## Module ownership

| File | Owner | Action |
|---|---|---|
| `src/lib/grid-title-3d-glyphs.ts` | pre-existing | already committed — do not modify |
| `src/lib/grid-title-3d.ts` | **engine** | create new |
| `src/lib/grid-canvas.ts` | **engine** | modify existing |
| `src/components/sections/HeroDesktop.tsx` | **wiring** | modify existing |
| `src/lib/use-mouse.ts` / `use-reduced-motion.ts` | shared | read only |

---

## 1. `Title3D` (engine owns; wiring does not call directly)

```ts
// src/lib/grid-title-3d.ts

export class Title3D {
  constructor(opts: {
    frontText: string;
    backText: string;
    depth?: number; // default 12
  });

  // Sets the total rotation that will be applied on the next computeCellOpacities().
  // Both angles are in RADIANS. yaw = rotation around Y axis; pitch = rotation around X axis.
  setRotation(yaw: number, pitch: number): void;

  // Compute which grid cells the block occupies right now, and at what opacity.
  // centerCol / centerRow are the grid-cell coordinates where the block's 3D center
  // should be placed on screen. Returns a Map keyed by "col,row" strings. Caller
  // iterates and draws; zero-alpha cells are NOT included in the map.
  computeCellOpacities(centerCol: number, centerRow: number): Map<string, number>;
}
```

**Perf rules** (engine must honor):
1. Surface voxels pre-computed in constructor into a `Float32Array`. No per-frame allocation of the voxel list.
2. No object creation inside `computeCellOpacities()` beyond the returned `Map`.
3. Edge-on faces taper via `|n·v̂|` so faces don't pop in/out.

---

## 2. `GridCanvas` (engine owns; wiring calls)

The only new public surface on `GridCanvas` is `setTitleInputs` + `pauseLoop` + `resumeLoop`. Everything else keeps its current shape.

```ts
// src/lib/grid-canvas.ts

export interface TitleInputs {
  // Mouse position in CANVAS-LOCAL pixels, or null if cursor is not over the hero.
  mouseX: number | null;
  mouseY: number | null;
  // 0 when hero is fully in view, 1 when hero is fully scrolled away.
  // Wiring computes this from the hero element's bounding rect.
  scrollProgress: number;
  // Delta yaw from the intro timeline, in RADIANS. 0 once the intro completes.
  introYaw: number;
}

export class GridCanvas {
  // ... existing members unchanged (startSelection, updateSelection, endSelection,
  // clickSelection, activateAt, setMousePosition, setHiddenImage, initTitle, start,
  // stop, resize, destroy) ...

  setTitleInputs(inputs: TitleInputs): void;
  pauseLoop(): void;
  resumeLoop(): void;
}
```

**Important:**
- `initTitle(lines)` stays callable for backward compat but its implementation is replaced internally to construct a `Title3D` instance from `lines[0]` (front) and `lines[1]` (back). Wiring continues to call `grid.initTitle(["PURDY", "GOOD"])` exactly as today.
- `setTitleInputs` is safe to call before `initTitle` (no-op if title not yet built).
- `pauseLoop` must cancel the RAF without losing internal state. `resumeLoop` re-arms it.

**Engine also must:**
- Change `defaultGridConfig.cellSize` from `28 → 20` and `gap` from `3 → 2`.
- Remove the directional-ASCII letter rendering (`getDirectionalAscii` usage) — Title3D replaces it entirely.
- Inside `draw()`, batch the title's cell fills by opacity bucket (~10 buckets). One `ctx.beginPath()` + many `ctx.roundRect()` + one `ctx.fill()` per bucket. Cursor trail, selection box, disintegration render as they do today.
- Clamp the canvas `devicePixelRatio` to `Math.min(window.devicePixelRatio, 2)` in the resize path.

---

## 3. `HeroDesktop.tsx` (wiring owns)

Wiring is responsible for assembling all four input channels and handing them to `grid.setTitleInputs` every RAF tick:

**a. Mouse.** Already partially wired via `useMouse`. Convert to canvas-local coordinates each frame. `null` when the cursor is outside the canvas rect.

**b. Scroll.** On `window` scroll (or inside the existing RAF), compute `scrollProgress = clamp(−heroRect.top / heroRect.height, 0, 1)` — 0 at page top, 1 by the time the hero bottom crosses the top of the viewport.

**c. Intro yaw.** On mount, start a GSAP tween:
```ts
const introObj = { yaw: Math.PI * 4 }; // +720° in radians
gsap.to(introObj, {
  yaw: 0,
  duration: 1.5,
  ease: "power3.out",
});
// read introObj.yaw each RAF; sign convention: positive yaw = right edge toward viewer first
```
Reduced motion: skip the tween, set `introObj.yaw = 0` at once.

**d. Offscreen pause.** `IntersectionObserver` on the hero container:
- `threshold: 0` — fires when the hero leaves / re-enters the viewport
- On `isIntersecting === false` → `grid.pauseLoop()`
- On `isIntersecting === true` → `grid.resumeLoop()`

**e. Dev FPS overlay.** Behind `process.env.NODE_ENV === "development"` OR a `?fps=1` query flag. Small fixed-position `<div>` in the top-right of the hero, white text on rgba-black, shows current RAF fps (exponential moving average over ~30 frames). Do not ship in production.

**What wiring must NOT do:**
- Do not touch `grid-canvas.ts` or `grid-title-3d.ts` (engine's files).
- Do not import `Title3D` directly. Only talk through `grid.setTitleInputs` + `grid.initTitle` + `grid.pauseLoop` + `grid.resumeLoop`.

---

## 4. Coordination rules

- Both agents read this contract + the design spec before writing any code.
- If a contract change is needed, the agent proposing it sends a `SendMessage` to the other with the proposed change and waits for agreement BEFORE editing code. Do not unilaterally diverge.
- Commit messages: prefix with `feat(3d-title):` so the lead can see what shipped.
- Don't commit one giant blob — commit after each cohesive milestone (Title3D class, GridCanvas integration, HeroDesktop wiring, FPS overlay) so the history reads cleanly.

## 5. Done criteria (for handoff to lead)

Each agent is done when:
- `npx tsc --noEmit` is clean.
- `npx eslint <their files>` has no errors.
- Their commit(s) are in `main`.
- They send a message to `team-lead` summarizing what changed and any follow-ups.

The lead then runs Task 4 (dev server, browser verification, Safari vs Chrome check, visual tuning) with the feature running end-to-end.
