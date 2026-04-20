# Portfolio Site 2026

Personal portfolio site for James Purdy, a motion designer based in Brooklyn, NY.

## Design Spec

**`DESIGN.md` is the single source of truth for all design decisions.** Read it before making any design or implementation choices. It covers architecture, color, typography, interaction systems, mobile strategy, and accessibility.

## Key Decisions

- **Single-page vertical scroll** with fixed left sidebar (desktop) or top nav (mobile)
- **Light, warm aesthetic** — off-white `#F2EDE8` base, tonal layering, no borders, neon accent pops
- **Not "cinematic" or dark-themed** — previous Stitch/spec work in this repo used a dark direction that has been fully abandoned
- **Typography:** Söhne (Klim) primary, PP Neue Montreal + Satoshi + Geist Mono as free fallback
- **Interaction-heavy on desktop** — magnetic field, pixel grid canvas, phosphorescent trails, custom cursor
- **Simplified on mobile** — same identity, different interaction model. Scroll animations only, no hover/cursor effects
- **Static export** to GitHub Pages via Next.js `output: 'export'`
- **GSAP + ScrollTrigger** for all animation (no Framer Motion)

## Tech Stack

- Next.js (App Router) with static export
- Tailwind CSS
- GSAP + ScrollTrigger
- HTML Canvas or WebGL (hero section only)

## Project Content

- `projects/` — Case study reference PDFs (BESE, D&AD, IBM, VICE)
- `Main Page.pdf` — Screenshot of current purdygood.me site (reference only, being fully redesigned)

## What NOT to Reference

Any previous specs, prompts, or Stitch design system references (dark backgrounds, glassmorphism, "cinematic" language, Space Grotesk, multi-page routing) are outdated and should be ignored. `DESIGN.md` supersedes everything.
