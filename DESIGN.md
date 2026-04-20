# purdygood.me — Portfolio Site Design Spec

## Overview

Personal portfolio site for **James Purdy**, a motion designer based in Brooklyn, NY. Clients include Google, IBM, VICE, T-Mobile, D&AD, BESE, and Propel. Skills span After Effects, Cinema 4D, motion graphics, VFX, typography, editorial animation, graphic design, and packaging.

The site channels the information architecture and presentation style of The Raw Materials (therawmaterials.com) — a single-page vertical scroll with a fixed sidebar, declarative copy, and inline case studies — adapted for a motion designer's portfolio. The site itself should demonstrate motion craft through intentional, meaningful interaction design.

**Primary goal:** Land a new motion design role.
**Secondary goals:** Attract freelance work, establish creative reputation, serve as a general-purpose portfolio.

**Inspiration reference:** The Raw Materials — specifically their numbered navigation, declarative tone, parenthetical labeling, and inline expandable case studies. Not a copy of their visual design.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Deployment:** Static export (`output: 'export'`) for GitHub Pages
- **Animation:** GSAP + ScrollTrigger (scroll-driven animations, magnetic fields, choreography)
- **Styling:** Tailwind CSS
- **Particle/Grid System:** HTML Canvas or WebGL (hero grid canvas only)
- **Repo:** `portfolio-site-26`

---

## Site Structure

Single-page vertical scroll. No separate routes — all content lives on one continuous page with defined sections.

| Section | Label | Content |
|---------|-------|---------|
| 00 | Hero | PURDYGOOD title, positioning statement, pixel grid canvas |
| 01 | Hello | Declarative introduction, capabilities, approach |
| 02 | Work | Category-based project cards with expand/contract behavior |
| 03 | About | Photo, bio, skills, tools |
| 04 | Contact | Email, social links, availability status |

---

## Navigation

### Desktop: Fixed Left Sidebar

A vertical strip fixed to the left edge of the viewport containing:

- **Numbered color-coded tiles** (00-04), each with a distinct accent color:
  - 00 Hero — Neon Orange `#FF5F1F`
  - 01 Hello — Purple `#8B5CF6`
  - 02 Work — Green `#22C55E`
  - 03 About — Pink `#EC4899`
  - 04 Contact — Blue `#3B82F6`
- Clicking a tile smooth-scrolls to that section
- Active tile is visually distinct (filled accent color, others are dormant/outlined)
- Tiles respond to cursor proximity with magnetic physics (expand toward cursor, compress away — macOS dock behavior)
- Numbered label inside each tile rotates slightly to face the pointer on hover

### Desktop: Fixed Bottom Status Bar

A persistent horizontal bar at the bottom showing:

- Current section number + name: `02a — Explainer Videos`
- Updates on scroll as the user crosses section boundaries
- Rendered in Söhne Mono (or fallback mono), small, quiet

### Mobile: Top Navigation

- Numbered tiles become a compact horizontal strip at the top
- Still color-coded, tappable
- Or: minimal hamburger opening full-screen overlay with tiles stacked vertically, large and tappable, each with accent color and section name
- Bottom status bar persists on mobile — works well at any viewport width

---

## Color System

### Base

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#F2EDE8` | Warm off-white page background |
| `--bg-surface` | `#EAE4DE` | Card backgrounds, tonal layering (slightly darker than base) |
| `--bg-surface-raised` | `#E2DCD6` | Hover states, elevated surfaces |
| `--text-primary` | `#1A1A1A` | Headings, primary text |
| `--text-secondary` | `#6B6560` | Metadata, labels, secondary info |

### Accent Colors

Three global accents used throughout the site:

| Name | Value | Usage |
|------|-------|-------|
| Neon Orange | `#FF5F1F` | Primary accent, CTAs, active states |
| Purple | `#8B5CF6` | Secondary accent, section highlights |
| Green | `#22C55E` | Tertiary accent, status indicators |

Two additional colors used only in navigation tiles:

| Name | Value | Usage |
|------|-------|-------|
| Pink | `#EC4899` | Tile-only accent |
| Blue | `#3B82F6` | Tile-only accent |

### Design Principles

- **No visible borders.** Surfaces are defined by tonal layering — cards are slightly darker than the background, hover states slightly darker again.
- **Accent colors are used sparingly** for maximum impact — section markers, active navigation, interactive affordances, phosphorescent particles.
- **Light background throughout.** No dark mode. The warmth of `#F2EDE8` is the site's personality.

---

## Typography

### Primary Direction: Söhne (Klim Type Foundry)

Pending licensing negotiation with Klim for a small portfolio use case (well under their 5,000 pageview/month minimum). Klim offers watermarked test fonts for comping during negotiation.

| Role | Face | Usage |
|------|------|-------|
| Display | Söhne Breit (wide cut) | Hero title, section headings, large statements |
| Body | Söhne (standard) | Running text, descriptions, UI labels |
| Mono | Söhne Mono | Status bar, technical labels, code references, metadata |

**Why Söhne:** The family is self-sufficient — three distinct voices (standard, wide, mono) from one design DNA. Concordance pairing: same designer, same skeleton, different optical roles. The cultural signal is digital pragmatism and editorial precision. The wide cut (Breit) provides expressive display contrast without needing a second family.

### Fallback Direction: Free Alternatives

If Klim licensing doesn't work out, use these free alternatives that carry similar cultural weight:

| Role | Face | Source | Cultural Signal |
|------|------|--------|-----------------|
| Display | PP Neue Montreal (Bold/Medium) | Pangram Pangram — free for personal/portfolio (https://pangrampangram.com/products/neue-montreal) | Montreal grotesque heritage, editorial confidence, not-quite-geometric warmth |
| Body | Satoshi (Regular/Medium) | Fontshare — free (https://www.fontshare.com/fonts/satoshi) | Clean humanist sans with personality, excellent x-height, pairs well with display grotesques |
| Mono | Geist Mono | Google Fonts — SIL OFL, free (https://fonts.google.com/specimen/Geist+Mono) | Developer-tool credibility, designed for digital-first contexts |

**Pairing rationale (fallback):** PP Neue Montreal and Satoshi are a contrast pair — Neue Montreal's tighter, more geometric character contrasts with Satoshi's slightly humanist openness. Both are contemporary and avoid the "AI Slop" font trap (Inter, Roboto, Open Sans). Geist Mono adds technical credibility for the status bar and metadata without introducing a fourth visual register.

### Typography Scale

Use fluid sizing with `clamp()` for seamless scaling:

| Level | Desktop | Mobile | Usage |
|-------|---------|--------|-------|
| Display XL | ~72-96px | ~36-48px | PURDYGOOD hero title |
| Display | ~48-64px | ~28-36px | Section headings |
| Heading | ~24-32px | ~20-24px | Category labels, card titles |
| Body | ~18-20px | ~16-18px | Running text |
| Small | ~14px | ~14px | Metadata, labels |
| Mono | ~12-14px | ~12px | Status bar, technical text |

### Typography Rules

- Line height: 1.4-1.6x for body copy
- Line length: max `65ch` for reading comfort
- No letter-spacing adjustments on body text
- All-caps labels: +0.05-0.1em tracking
- `font-display: swap` for body text, `optional` for display/decorative

---

## Shape Language

- **Border radius:** 16-24px on cards, containers, and interactive elements
- **No visible borders:** Surfaces defined by background tonal shifts
- **Asymmetric layouts:** Content is not centered or mirrored — use 55/45 or 60/40 column splits
- **Generous white space:** Let content breathe. Space is a design element, not wasted area.

---

## Section Design

### Section 00 — Hero

The hero section is a full-viewport interactive canvas that immediately communicates "this person makes things move."

#### The Pixel Grid Canvas

A fixed grid of rounded-rectangle cells covering the hero viewport. At rest, cells are nearly invisible (1-2% opacity difference from background — a faint hint of texture). The grid is a latent structure activated by cursor interaction.

**Grid specs:**
- Cell size: 24x24px or 32x32px with 2-4px gaps
- Corner radius: 6-8px per cell (mirrors the card border-radius at micro scale)
- Cells are the same shape vocabulary as the site's cards — rounded rectangles all the way down

**Cursor trail behavior:**
- Mouse movement activates cells in the cursor's path (3x3 to 5x5 cell trail width)
- Activated cells reveal a fragment of a hidden image/texture underneath
- Each activated cell fades back to dormant over 1.5-2 seconds
- No gravity, no drift — cells activate in place and fade in place
- The cursor acts as a brush revealing a hidden composition — the full image is never visible at once

**Hidden layer options (decide during implementation):**
- **Option A:** Accent-tinted texture map — color shifts based on cursor's horizontal position across the viewport (orange zone, purple zone, green zone)
- **Option B:** Fragmented portfolio still — composite of cropped project stills, so fragments of actual work are visible through the trail

**Fast mouse movement:**
- Trail widens from 3x3 to 9x9+ cells
- Cells persist longer before fading
- Reveals larger swaths of the hidden image
- Rewards energetic interaction with more information

**Selection box interaction (hidden/discoverable):**
- Click and drag draws a selection rectangle snapped to grid cell boundaries (Photoshop marquee tool visual reference)
- Click the selection: all selected cells disintegrate using grid-locked 2D fluid dynamics — cells push away from click point along grid lines, accelerate, decelerate, fade
- After disintegration: brief full reveal of hidden image in that area, then new dormant cells regenerate from edges inward over 2-3 seconds (grid heals itself)

**Idle behavior:**
- Cursor rests on grid for 2.5s+: cells under cursor gently pulse at low opacity (breathing)

#### PURDYGOOD Title (Grid-Integrated)

The title is rendered as a formation of grid cells — the cells that form letterforms behave differently from the surrounding canvas. The text is a region of the grid with its own physics.

**Primary approach (integrated):**
- At rest: letter-cells are slightly more opaque or subtly tinted — letters emerge from the grid like a watermark
- On cursor approach: letter-cells display directional ASCII characters (/, \, |, —) mapped to cursor angle relative to each cell. Title holds shape but internal texture responds to mouse position
- On direct hover/interaction: letter-cells glitch — briefly swap positions with neighbors, shift ASCII characters rapidly, strobe between accent colors. Grid-locked shuffling, not free-floating. Cells return to formation after interaction ends

**Fallback approach (if integrated version takes too long):**
- Standalone ASCII-rendered PURDYGOOD as a section header in About or Work section
- Rendered in Söhne Mono (or Geist Mono) with ASCII-art line characters
- Reactive glitch on hover — characters scramble and resolve
- Hero reverts to pixel grid canvas with a simpler Söhne Breit title

#### Hero Content

Below or overlaid on the grid canvas:
- Positioning statement in Söhne Breit: e.g., *"Motion designer who thinks in systems and moves in stories"*
- Scroll indicator (subtle down arrow or "scroll" label)

#### Hero on Mobile

The pixel grid canvas is **removed entirely** on mobile. No touch-reveal, no selection box, no fluid sim.

Mobile hero consists of:
- PURDYGOOD title rendered large in Söhne Breit (or a static snapshot of the ASCII grid version — a frozen frame of the desktop interaction)
- Positioning statement
- Scroll indicator
- Optional: subtle device-tilt parallax using accelerometer/gyroscope (title shifts 2-3px based on phone orientation). Disabled when `prefers-reduced-motion` is set.

---

### Section 01 — Hello

Declarative introduction using the Raw Materials tone — confident, parenthetical, positioning.

**Content structure:**
- Large opening statement in Söhne Breit (or fallback display): a declarative positioning line
- Body copy in standard Söhne (or Satoshi): capabilities, approach, what makes your work distinctive
- Written in parenthetical labeling style: *"Motion design (the kind that moves people, not just pixels). Based in Brooklyn (by way of wherever). Currently seeking full-time and freelance opportunities (preferably with people who care about craft)."*
- Client list displayed as quiet inline tags or a horizontal list: Google, IBM, VICE, T-Mobile, D&AD, BESE, Propel

**Layout:**
- Asymmetric — text block offset to one side, generous whitespace on the other
- No images in this section — pure typographic statement

**Animation:**
- Text blocks stagger in with fade-up on scroll, timed to feel conversational
- Scroll-triggered, not hover-dependent — works identically on mobile

---

### Section 02 — Work

The heart of the site. Category-based project organization with expandable inline case studies.

#### Categories

| # | Category | Accent | Example Projects |
|---|----------|--------|-----------------|
| 02a | Explainer Videos | Orange `#FF5F1F` | IBM Dive Inside, BESE Xicanx |
| 02b | Creative Direction | Purple `#8B5CF6` | D&AD New Blood |
| 02c | Editorial | Green `#22C55E` | VICE Snapchat Discover |
| 02d | UI / Product Demo | Pink `#EC4899` | Google, Apple |
| 02e | Advertising | Blue `#3B82F6` | (projects TBD) |
| 02f | Entertainment & Arts | Orange `#FF5F1F` | (projects TBD) |
| 02g | Nightlife | Purple `#8B5CF6` | Posters, animations, VJ work |

**Note:** If any category has fewer than 2 projects, merge. Entertainment & Arts + Nightlife could become "Culture & Nightlife" if the project count is thin.

#### Category Sub-Sections

Each category gets a label in parenthetical style: `(02a — Explainer Videos)`

As the user scrolls through categories, the bottom status bar updates to show the current sub-category.

#### Project Cards

**Collapsed state:**
- Thumbnail/still image, project title, client name, year
- 2-column asymmetric grid (55/45 or 60/40), staggered vertically
- Cards have tonal background (`--bg-surface`), no borders, rounded corners (16-24px)

**Hover state (desktop only):**
- Card tilts in 3D toward cursor (perspective transform via magnetic field system)
- Text elements inside shift at different parallax rates (title moves faster than metadata)
- Soft light gradient follows cursor position across card surface
- Thumbnail crossfades to looping video clip
- Additional metadata (role, tools) fades in with staggered timing
- Three properties animating simultaneously (tilt, light, content reveal) per Rule of 3

**Expanded state (click to open):**
- Card expands inline to reveal: full-width video embed or image sequence, project description, role/credits, tools used
- Expansion driven by GSAP height + opacity transition
- On expansion: phosphorescent burst from card edges (particles shoot outward 20-40px in category accent color, ease-out over 400ms). Desktop only.
- Only one card expanded per category at a time (accordion behavior)

**Contract:** Click the title bar area to collapse back. Matching reverse animation, no particle burst on close.

**Idle-to-active dream state:** See Phosphorescent Trail #2 in the Interaction & Motion System section — cards that have been hovered for 2.5s+ enter a desaturated "dream state" with a grain texture and dampened tilt, then produce a phosphorescent trail on cursor reactivation. This behavior layers on top of the hover state described above.

#### Cards on Mobile

- Single column, full-width cards
- No magnetic tilt, no parallax within cards, no phosphorescent burst
- Tap to expand works naturally (native mobile interaction pattern)
- Clean height animation + content fade-in with short stagger
- Cards enter viewport with a simple fade-up stagger on scroll

#### Card Entry Animation

**Desktop:** Cards cascade in from alternating sides with rotational easing — each card enters like a dealt playing card, slight rotation that settles to zero.

**Mobile:** Cards fade-up in sequence with staggered timing. No rotation, no alternating sides (doesn't work on narrow viewports).

---

### Section 03 — About

**Content structure:**
- Photo — not a formal headshot, something with personality. Asymmetrically placed, large, with generous border-radius
- Declarative statement in Söhne Breit (display): a positioning line about who you are as a creative
- Body copy in Söhne (body): background, approach, what you care about. Written in the parenthetical style.
- Skills/tools list presented as inline tags or a quiet grid. Categories: Motion (After Effects, Cinema 4D, etc.), Design (Figma, Illustrator), Code (if relevant)
- Resume/CV download button — small, confident, prominent but not screaming

**Animation:**
- Photo reveals with a soft clip-path wipe or mask animation on scroll
- Text blocks stagger in with fade-up, paced conversationally
- Desktop: photo has subtle magnetic tilt response to cursor
- Mobile: optional device-tilt parallax on photo (same as hero, subtle)

---

### Section 04 — Contact

The simplest section. Calm landing after the energy of the Work section.

**Content:**
- Large heading in Söhne Breit: *"Let's talk"* or *"Say hello"*
- Email displayed large and clickable as the primary CTA
- Social links: LinkedIn, Vimeo/YouTube (for reels), Instagram (if relevant), GitHub
- Links presented with parenthetical labels: *"LinkedIn (connect)"*, *"Vimeo (watch)"*, *"Email (talk)"*
- Single-line availability note: *"Currently available for motion design roles and select freelance projects"*

**Animation:**
- Minimal. Gentle fade-in on scroll. Contrast through restraint — the calm after the Work section's energy.

---

## Interaction & Motion System

### Layer 1: Magnetic Field (Ambient)

The cursor has gravitational influence on nearby elements. This is the constant, subtle aliveness of the page. Desktop only.

- **Project cards:** Tilt in 3D toward cursor (perspective transform), internal elements shift at different parallax rates, soft light gradient follows cursor position
- **Sidebar nav tiles:** Magnetically expand toward cursor and compress away (macOS dock physics), numbered label rotates slightly to face pointer
- **Body text:** Subtle 1-2px shift away from cursor as it passes — almost subliminal

### Layer 2: Progressive Disclosure (Hover)

Hovering reveals hidden information through choreographed animations. Desktop only.

- **Project cards:** Thumbnail → video crossfade + metadata fade-in + light gradient (three simultaneous properties)
- **Section numbers (sidebar):** Number expands and section name types out character by character, erases in reverse on mouse-leave (kinetic typography)
- **Name/logo (sidebar):** Letterforms decompose into constituent strokes, drift apart slightly, reassemble on mouse-leave

### Layer 3: Scroll Choreography (Macro Rhythm)

Scroll-driven animations that make the page feel like a composed sequence. Works on both desktop and mobile (simplified on mobile).

**Desktop:**
- Multi-speed parallax depth layers (3-4 scroll speeds)
- Section transitions: elements morph between sections, color washes across background, sidebar tile accent transitions
- Card cascade with rotational easing
- Section headings assemble from displaced letterforms pulled into alignment by scroll position

**Mobile:**
- Single-speed scroll reveals (no parallax — janky on mobile, eats battery)
- Clean fade-up entry for all elements
- Cards stack in single column with staggered fade-up
- Section transitions: simple crossfade/fade between sections

### Layer 4: Custom Cursor

A persistent custom cursor element that adapts to context. Desktop only.

- Default: circular cursor with smooth follow delay (lerping to mouse position)
- Size changes based on context: grows larger over interactive elements
- Color shifts to match the current section's accent color
- Over hero section: becomes part of the grid canvas interaction (trail brush)

### Layer 5: Phosphorescent Trails (Earned Spectacle)

Particle effects placed at five intentional moments. The trails are the site's most expressive gesture — scarce enough to feel like gifts, not noise. Desktop only.

| # | Trigger | Behavior | Timing |
|---|---------|----------|--------|
| 1 | **Hero grid canvas** | Cursor trail activates grid cells revealing hidden image (see Section 00 spec) | Continuous while in hero viewport |
| 2 | **Idle-to-active reawaken** | Cursor rests on card for 2.5s (card enters dream state: desaturates, grain fades in, tilt dampens). On reactivation, first 1-2s of movement leave phosphorescent trail in project accent color across card surface | 2.5s idle threshold, 800ms dream state crossfade, 1.2s trail on reactivation, 600ms particle lifespan |
| 3 | **Card expansion burst** | On project card expand (click), brief burst of particles from card edges. Accent color of project category. Happens once per expansion, not on contraction | Burst at 100ms after click (anticipation), particles radiate ease-out over 400ms, total 500ms |
| 4 | **Sidebar section streak** | On section boundary scroll, old tile's accent color leaves phosphorescent streak downward to new tile. Only fires 4 times across entire site | 600ms streak with fast-start/slow-fade curve, particles staggered 50ms apart for fluid stroke |
| 5 | **Velocity easter egg** | Cursor exceeds ~800px/sec for 500ms+. In hero: trail widens to maximum, accent color strobe. Outside hero: full-viewport burst, multiple accent colors, 2-3s duration | 200ms ramp-up, 2s full effect, 800ms fade-out. 10s cooldown to prevent spam |

#### Particle Visual Consistency

All five placements share: same particle shape (soft rounded rectangle matching grid cell aesthetic), same physics model (grid-aware movement where applicable, ease-out fade), same opacity behavior. What changes between contexts: count, size, opacity, color, and trigger condition.

#### Mobile Equivalents

| Desktop Moment | Mobile Equivalent |
|---|---|
| Hero grid canvas trails | Static grid texture or accent-tinted hero image |
| Idle-to-active reawaken | None (no hover state) |
| Card expansion burst | Spring animation on expand (overshoot easing curve) |
| Sidebar section streak | Top nav tile transition with accent color crossfade |
| Velocity easter egg | None (or shake-to-reveal if it feels natural — test) |

---

## Accessibility

### `prefers-reduced-motion`

When enabled:
- All scroll-triggered animations: instant reveal (no fade, no stagger)
- Magnetic field: disabled
- Phosphorescent trails: disabled
- Custom cursor: disabled (use system cursor)
- Hero grid canvas: visible as static decorative texture with hidden image partially shown
- Card expand/contract: instant height change, no easing
- Device-tilt parallax on mobile: disabled

The concept degrades to a well-designed static page, not a blank space.

### Color & Text

- WCAG contrast: 4.5:1 minimum for body text, 3:1 for large text
- Minimum body size: 16px / 1rem
- Line length: max 65ch
- Focus states: visible focus rings on all interactive elements (keyboard navigation)

---

## Mobile Strategy

Desktop and mobile are **two distinct expressions of the same design identity**. Same content, color, typography, shape language, personality. Different interaction model.

### What Carries Over

- Color system: identical
- Typography: same families, fluid scaling with `clamp()`
- Shape language: same border-radius, no borders, tonal layering
- Content and copy: same declarative tone, same parenthetical labeling
- Section structure: 00-04 in same order
- Bottom status bar: works at any viewport width

### What Changes

- **Navigation:** Sidebar → horizontal top strip or hamburger overlay
- **Hero:** Pixel grid canvas → bold typographic hero with optional device-tilt
- **Hover interactions:** Removed entirely (no hover on touch)
- **Magnetic field:** Removed
- **Parallax:** Removed (performance/jank concerns on mobile)
- **Scroll animations:** Simplified to fade-up reveals with stagger
- **Card layout:** 2-column asymmetric → single column full-width
- **Card entry:** Rotational cascade → simple stagger
- **Phosphorescent trails:** Replaced with simpler animated equivalents or removed
- **Custom cursor:** Removed (no cursor on touch)

### Mobile-Only Feature: Device Tilt

Subtle accelerometer/gyroscope-driven parallax on hero title and About photo. Elements shift 2-3px based on device orientation. Ambient, doesn't interfere with scrolling. Disabled when `prefers-reduced-motion` is set.

### The Decision Filter

For every interaction:
- **Cursor-driven?** → Desktop only. Find mobile equivalent or skip.
- **Scroll-driven?** → Simplify for mobile, keep the concept.
- **Tap/click-driven?** → Works on both. Test on both.

### Build Implication

The hero section is two components: `<HeroDesktop />` and `<HeroMobile />`. Everything else shares a single component tree with responsive behavior and conditional animation complexity.

---

## Content Notes

- James has a demo reel video ready
- All project content (descriptions, media) exists on the current site at purdygood.me
- Case study PDFs in `projects/` directory for reference: BESE Xicanx, D&AD New Blood, IBM Dive Inside, VICE Snapchat Discover
- Current site screenshot in `Main Page.pdf` for reference (being fully redesigned)
- Project descriptions should emphasize process and creative problem-solving, not just final output
- Tone: confident, creative, approachable, parenthetical — not corporate

---

## Stitch Design Context

Previous Stitch projects exist with a different design direction ("The Kinetic Gallery" — dark background, glassmorphism, "cinematic" aesthetic). That direction has been abandoned. The current spec supersedes all prior Stitch work. Key differences:

| Previous Direction | Current Direction |
|---|---|
| Dark background (#121416) | Warm off-white (#F2EDE8) |
| Glassmorphism / frosted glass | Tonal layering, no borders |
| Space Grotesk + Manrope | Söhne family (or PP Neue Montreal + Satoshi fallback) |
| Multi-page with routes | Single-page vertical scroll |
| "Cinematic" / on-the-nose tech | Refined, playful, contemporary editorial |
| Generic hover animations | Intentional interaction system (magnetic field, progressive disclosure, phosphorescent trails) |

---

## Performance Budget

- **Font loading:** `font-display: swap` for body, `optional` for display. Preload 1-2 critical weights. Self-host when possible.
- **Variable fonts** over multiple static weights where available (Söhne offers variable).
- **Hero grid canvas:** Use HTML Canvas or WebGL — keep to hero viewport only, destroy on scroll past hero to free resources.
- **GSAP:** Tree-shake to only imported modules (ScrollTrigger, core).
- **Images:** Lazy-load everything below the fold. Project thumbnails as optimized WebP.
- **Video:** Lazy-load project video clips. Don't autoplay until hover (desktop) or tap (mobile).
- **Particle system:** Cap particle count. Hero grid canvas has natural cap (grid cell count). Other trail placements: max 50 particles per effect instance.
