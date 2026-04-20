# purdygood.me Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page portfolio site for motion designer James Purdy, with an interactive hero grid canvas, magnetic cursor effects, phosphorescent particle trails, and scroll-driven choreography — deployed as a static export to GitHub Pages.

**Architecture:** Next.js App Router with static export (`output: 'export'`). Single page with five sections (00-04) rendered as a vertical scroll. Desktop gets a rich cursor-driven interaction layer (magnetic field, grid canvas, custom cursor, particles); mobile gets the same visual identity with simplified scroll-based animations. GSAP + ScrollTrigger handles all animation. Tailwind CSS v4 with `@theme` directive for design tokens.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, GSAP + ScrollTrigger + @gsap/react, HTML Canvas (hero grid), TypeScript

**Design Spec:** See `DESIGN.md` in repo root for full design decisions, color system, typography, interaction system, and mobile strategy.

---

## File Structure

```
src/
  app/
    layout.tsx              — Root layout, font loading, metadata, global providers
    page.tsx                — Single page composing all sections
    globals.css             — Tailwind v4 import, @theme tokens, @font-face, CSS vars
  components/
    layout/
      Sidebar.tsx           — Fixed left sidebar with nav tiles (desktop only)
      MobileNav.tsx         — Mobile top navigation strip
      StatusBar.tsx         — Fixed bottom status bar showing current section
    sections/
      Hero.tsx              — Hero wrapper (renders HeroDesktop or HeroMobile)
      HeroDesktop.tsx       — Grid canvas + PURDYGOOD title + positioning statement
      HeroMobile.tsx        — Static hero for mobile
      Hello.tsx             — Section 01: declarative intro
      Work.tsx              — Section 02: categories + project cards
      About.tsx             — Section 03: photo, bio, skills
      Contact.tsx           — Section 04: email, social links
    work/
      CategorySection.tsx   — Single category sub-section with label + card grid
      ProjectCard.tsx       — Project card: collapsed, hover, expanded states
    cursor/
      CustomCursor.tsx      — Custom cursor element with lerped follow
      MagneticTarget.tsx    — Wrapper that applies magnetic tilt to children
    particles/
      ParticleCanvas.tsx    — Reusable canvas overlay for particle effects
      particle-engine.ts    — Particle spawn, update, render loop
  lib/
    grid-canvas.ts          — Hero grid: cell state, trail, selection, fluid sim
    grid-title.ts           — PURDYGOOD letter-cell formation + ASCII behavior
    magnetic.ts             — Magnetic field math (distance, tilt, parallax)
    scroll-animations.ts    — GSAP ScrollTrigger registration + shared timelines
    use-mouse.ts            — Mouse position + velocity hook
    use-reduced-motion.ts   — prefers-reduced-motion hook
    use-device-tilt.ts      — Accelerometer/gyroscope hook (mobile)
    use-active-section.ts   — Intersection observer for current section
    use-is-desktop.ts       — Media query hook for desktop vs mobile
  data/
    projects.ts             — Project content: title, client, year, category, description, media
    sections.ts             — Section metadata: id, label, accent color
  styles/
    fonts/                  — Self-hosted font files (woff2)
public/
  images/                   — Project thumbnails, about photo, hidden layer image
  videos/                   — Project video clips
next.config.ts              — Static export config
```

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js Project with Tailwind v4

**Files:**
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `package.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run from the repo root (`portfolio-site-26/`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --turbopack
```

When prompted, accept defaults. This creates the scaffold with Tailwind v4 and App Router.

- [ ] **Step 2: Configure static export for GitHub Pages**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 3: Install GSAP and animation dependencies**

```bash
npm install gsap @gsap/react
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000` — should see the default Next.js page.

- [ ] **Step 5: Verify static export works**

```bash
npm run build
```

Should produce an `out/` directory with static HTML files. No errors.

- [ ] **Step 6: Add out/ to .gitignore**

Append to `.gitignore`:

```
# Static export
out/
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js with Tailwind v4 and GSAP"
```

---

### Task 2: Design Tokens and Typography

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/app/layout.tsx` (replace scaffold)
- Create: `src/data/sections.ts`
- Create: `src/styles/fonts/` (directory for font files)

- [ ] **Step 1: Download fallback fonts**

Download and place in `src/styles/fonts/`:
- PP Neue Montreal Bold & Medium from Pangram Pangram (woff2 files)
- Satoshi Regular & Medium from Fontshare (woff2 files)
- Geist Mono Regular from Google Fonts (woff2 files)

If Söhne is available (watermarked test fonts from Klim), use those instead and name them `sohne-*.woff2`, `sohne-breit-*.woff2`, `sohne-mono-*.woff2`.

Place font files in `src/styles/fonts/`. The exact filenames depend on what you download — adjust `@font-face` declarations in the next step to match.

- [ ] **Step 2: Set up @font-face and Tailwind v4 @theme tokens**

Replace `src/app/globals.css`:

```css
@import "tailwindcss";

/* ---------- Font Faces ---------- */
/* Fallback stack: PP Neue Montreal (display) + Satoshi (body) + Geist Mono (mono) */
/* If Söhne is licensed, swap these @font-face blocks for Söhne/Söhne Breit/Söhne Mono */

@font-face {
  font-family: "Display";
  src: url("../styles/fonts/PPNeueMontreal-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: optional;
}

@font-face {
  font-family: "Display";
  src: url("../styles/fonts/PPNeueMontreal-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: optional;
}

@font-face {
  font-family: "Body";
  src: url("../styles/fonts/Satoshi-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Body";
  src: url("../styles/fonts/Satoshi-Medium.woff2") format("woff2");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Mono";
  src: url("../styles/fonts/GeistMono-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* ---------- Tailwind v4 Theme Tokens ---------- */

@theme {
  /* Typography */
  --font-display: "Display", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Body", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Mono", ui-monospace, monospace;

  /* Fluid type scale — use clamp() for seamless scaling */
  --text-display-xl: clamp(2.25rem, 1.5rem + 4vw, 6rem);
  --text-display: clamp(1.75rem, 1rem + 3vw, 4rem);
  --text-heading: clamp(1.25rem, 1rem + 1vw, 2rem);
  --text-body: clamp(1rem, 0.9rem + 0.25vw, 1.25rem);
  --text-small: 0.875rem;
  --text-mono: clamp(0.75rem, 0.7rem + 0.15vw, 0.875rem);

  /* Base colors */
  --color-bg-base: #F2EDE8;
  --color-bg-surface: #EAE4DE;
  --color-bg-surface-raised: #E2DCD6;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B6560;

  /* Accent colors */
  --color-accent-orange: #FF5F1F;
  --color-accent-purple: #8B5CF6;
  --color-accent-green: #22C55E;
  --color-accent-pink: #EC4899;
  --color-accent-blue: #3B82F6;

  /* Shape */
  --radius-card: 1.25rem;
  --radius-cell: 0.5rem;

  /* Easing */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.22, 1.36, 0.36, 1);

  /* Timing */
  --duration-fast: 200ms;
  --duration-normal: 400ms;
  --duration-slow: 800ms;
}

/* ---------- Base Styles ---------- */

body {
  font-family: var(--font-body);
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Reduced motion: disable all transitions and animations */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Max line length for readability */
.prose-width {
  max-width: 65ch;
}
```

- [ ] **Step 3: Create section metadata**

Create `src/data/sections.ts`:

```typescript
export interface Section {
  id: string;
  number: string;
  label: string;
  accent: string;
}

export const sections: Section[] = [
  { id: "hero", number: "00", label: "Hero", accent: "#FF5F1F" },
  { id: "hello", number: "01", label: "Hello", accent: "#8B5CF6" },
  { id: "work", number: "02", label: "Work", accent: "#22C55E" },
  { id: "about", number: "03", label: "About", accent: "#EC4899" },
  { id: "contact", number: "04", label: "Contact", accent: "#3B82F6" },
];

export interface WorkCategory {
  id: string;
  number: string;
  label: string;
  accent: string;
}

export const workCategories: WorkCategory[] = [
  { id: "explainer", number: "02a", label: "Explainer Videos", accent: "#FF5F1F" },
  { id: "creative-direction", number: "02b", label: "Creative Direction", accent: "#8B5CF6" },
  { id: "editorial", number: "02c", label: "Editorial", accent: "#22C55E" },
  { id: "ui-product", number: "02d", label: "UI / Product Demo", accent: "#EC4899" },
  { id: "advertising", number: "02e", label: "Advertising", accent: "#3B82F6" },
  { id: "entertainment", number: "02f", label: "Entertainment & Arts", accent: "#FF5F1F" },
  { id: "nightlife", number: "02g", label: "Nightlife", accent: "#8B5CF6" },
];
```

- [ ] **Step 4: Update root layout with fonts and metadata**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PURDYGOOD — James Purdy, Motion Designer",
  description:
    "Portfolio of James Purdy, a motion designer based in Brooklyn, NY. Clients include Google, IBM, VICE, T-Mobile, D&AD, BESE, and Propel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Verify fonts load and tokens work**

Replace `src/app/page.tsx` with a temporary test page:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-bg-base p-12">
      <h1
        className="font-display text-display-xl font-bold text-text-primary"
      >
        PURDYGOOD
      </h1>
      <p className="mt-4 font-body text-body text-text-secondary prose-width">
        Motion design (the kind that moves people, not just pixels). Based in
        Brooklyn (by way of wherever).
      </p>
      <p className="mt-4 font-mono text-mono text-text-secondary">
        02a — Explainer Videos
      </p>
      <div className="mt-8 rounded-card bg-bg-surface p-8">
        <p className="text-text-primary">Card surface</p>
      </div>
      <div className="mt-4 flex gap-3">
        <span className="rounded-full bg-accent-orange px-3 py-1 text-sm text-white">Orange</span>
        <span className="rounded-full bg-accent-purple px-3 py-1 text-sm text-white">Purple</span>
        <span className="rounded-full bg-accent-green px-3 py-1 text-sm text-white">Green</span>
        <span className="rounded-full bg-accent-pink px-3 py-1 text-sm text-white">Pink</span>
        <span className="rounded-full bg-accent-blue px-3 py-1 text-sm text-white">Blue</span>
      </div>
    </main>
  );
}
```

Run `npm run dev`, open browser. Verify:
- Background is warm off-white (#F2EDE8)
- Display font loads for "PURDYGOOD" heading
- Body font loads for paragraph text
- Mono font loads for status bar text
- Card has tonal surface background
- All 5 accent color chips render correctly
- Type scales are fluid (resize window to verify clamp behavior)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: design tokens, typography, and color system"
```

---

### Task 3: Layout Shell — Sidebar, Status Bar, Section Containers

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/StatusBar.tsx`
- Create: `src/lib/use-active-section.ts`
- Create: `src/lib/use-is-desktop.ts`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create desktop detection hook**

Create `src/lib/use-is-desktop.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";

const DESKTOP_BREAKPOINT = 1024;

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    setIsDesktop(mql.matches);

    function onChange(e: MediaQueryListEvent) {
      setIsDesktop(e.matches);
    }

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
```

- [ ] **Step 2: Create active section observer hook**

Create `src/lib/use-active-section.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";

export function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return activeId;
}
```

- [ ] **Step 3: Create Sidebar component**

Create `src/components/layout/Sidebar.tsx`:

```tsx
"use client";

import { sections } from "@/data/sections";

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <nav
      className="fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col items-center justify-center gap-3 lg:flex"
      aria-label="Section navigation"
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            aria-label={`Go to ${section.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex h-12 w-12 items-center justify-center rounded-radius-cell transition-transform"
            style={{
              backgroundColor: isActive ? section.accent : "transparent",
              border: isActive
                ? "none"
                : `1.5px solid ${section.accent}40`,
            }}
          >
            <span
              className="font-mono text-xs font-medium transition-colors"
              style={{
                color: isActive ? "#fff" : section.accent,
              }}
            >
              {section.number}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Create StatusBar component**

Create `src/components/layout/StatusBar.tsx`:

```tsx
"use client";

import { sections, workCategories } from "@/data/sections";

interface StatusBarProps {
  activeSection: string;
  activeSubSection?: string;
}

export function StatusBar({ activeSection, activeSubSection }: StatusBarProps) {
  const section = sections.find((s) => s.id === activeSection);
  if (!section) return null;

  const subCategory = activeSubSection
    ? workCategories.find((c) => c.id === activeSubSection)
    : null;

  const displayLabel = subCategory
    ? `${subCategory.number} — ${subCategory.label}`
    : `${section.number} — ${section.label}`;

  return (
    <div className="fixed bottom-0 left-0 z-50 flex h-10 w-full items-center bg-bg-base/80 px-6 backdrop-blur-sm lg:pl-24">
      <span className="font-mono text-mono text-text-secondary">
        {displayLabel}
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Wire layout into page**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { useActiveSection } from "@/lib/use-active-section";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { sections } from "@/data/sections";

const sectionIds = sections.map((s) => s.id);

export default function Home() {
  const activeSection = useActiveSection(sectionIds);
  const isDesktop = useIsDesktop();

  const handleNavigate = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {isDesktop && (
        <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
      )}
      <StatusBar activeSection={activeSection} />

      <main className="lg:pl-20">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="flex min-h-screen items-center justify-center"
          >
            <div className="px-6 py-20 lg:px-16">
              <span
                className="font-mono text-mono"
                style={{ color: section.accent }}
              >
                ({section.number})
              </span>
              <h2 className="mt-2 font-display text-display font-bold">
                {section.label}
              </h2>
              <p className="mt-4 text-text-secondary">
                Section content goes here
              </p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
```

- [ ] **Step 6: Verify in browser**

Run `npm run dev`. Verify:
- Left sidebar visible on desktop (≥1024px) with 5 numbered tiles
- Active tile fills with accent color as you scroll between sections
- Clicking a tile smooth-scrolls to that section
- Bottom status bar shows current section number + label
- Sidebar hidden on mobile-width viewports
- Content is offset by sidebar width (`pl-20`) on desktop
- Each section takes full viewport height

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: layout shell with sidebar nav, status bar, and section containers"
```

---

## Phase 2: Content Sections

### Task 4: Section 01 — Hello

**Files:**
- Create: `src/components/sections/Hello.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Hello section component**

Create `src/components/sections/Hello.tsx`:

```tsx
const clients = [
  "Google",
  "IBM",
  "VICE",
  "T-Mobile",
  "D&AD",
  "BESE",
  "Propel",
];

export function Hello() {
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-16">
      <div>
        <h2 className="font-display text-display font-bold leading-tight">
          Motion design that moves people, not just pixels.
        </h2>
        <div className="prose-width mt-8 space-y-6 text-body text-text-secondary">
          <p>
            Based in Brooklyn (by way of everywhere). I make things move with
            purpose — explainer videos, brand films, editorial animation,
            product demos, and the occasional VJ set.
          </p>
          <p>
            Currently seeking full-time and freelance opportunities
            (preferably with people who care about craft).
          </p>
        </div>
      </div>
      <div className="flex items-end">
        <div>
          <span className="font-mono text-mono uppercase tracking-wider text-text-secondary">
            (Selected clients)
          </span>
          <ul className="mt-4 flex flex-wrap gap-2">
            {clients.map((client) => (
              <li
                key={client}
                className="rounded-full bg-bg-surface px-4 py-1.5 text-sm text-text-primary"
              >
                {client}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into page**

In `src/app/page.tsx`, import and render `Hello` inside the section with `id="hello"`. Replace the placeholder content for that section:

```tsx
import { Hello } from "@/components/sections/Hello";
```

In the sections map, replace the placeholder for `hello`:

```tsx
{section.id === "hello" ? (
  <Hello />
) : (
  <div className="px-6 py-20 lg:px-16">
    <span className="font-mono text-mono" style={{ color: section.accent }}>
      ({section.number})
    </span>
    <h2 className="mt-2 font-display text-display font-bold">{section.label}</h2>
    <p className="mt-4 text-text-secondary">Section content goes here</p>
  </div>
)}
```

- [ ] **Step 3: Verify and commit**

Check browser — Hello section should show asymmetric layout with headline, body copy, and client tags. Commit:

```bash
git add -A
git commit -m "feat: section 01 Hello with declarative copy and client list"
```

---

### Task 5: Project Data and Work Section Structure

**Files:**
- Create: `src/data/projects.ts`
- Create: `src/components/work/CategorySection.tsx`
- Create: `src/components/sections/Work.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create project data**

Create `src/data/projects.ts`:

```typescript
export interface Project {
  id: string;
  title: string;
  client: string;
  year: string;
  category: string;
  role: string;
  tools: string[];
  description: string;
  thumbnail: string;
  video?: string;
}

export const projects: Project[] = [
  {
    id: "ibm-dive-inside",
    title: "Dive Inside",
    client: "IBM",
    year: "2017",
    category: "explainer",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D", "Illustrator"],
    description:
      "App demo videos for the IBM MobileFirst partnership with Apple — translating complex enterprise software into clear, engaging visual narratives.",
    thumbnail: "/images/ibm-dive-inside.webp",
    video: "/videos/ibm-dive-inside.mp4",
  },
  {
    id: "bese-xicanx",
    title: "Gimme the Word: Xicanx",
    client: "BESE",
    year: "2019",
    category: "explainer",
    role: "Creative Director / Motion Designer",
    tools: ["After Effects", "Illustrator", "Photoshop"],
    description:
      "Full creative control on an explainer video exploring the etymology and identity of Xicanx — bold typographic animation with cultural depth.",
    thumbnail: "/images/bese-xicanx.webp",
    video: "/videos/bese-xicanx.mp4",
  },
  {
    id: "dad-new-blood",
    title: "New Blood 2018 Invite",
    client: "D&AD",
    year: "2018",
    category: "creative-direction",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D"],
    description:
      "2-day turnaround promo video for the D&AD New Blood festival — integrated student work with recreated 3D gradient branding.",
    thumbnail: "/images/dad-new-blood.webp",
    video: "/videos/dad-new-blood.mp4",
  },
  {
    id: "vice-snapchat",
    title: "Snapchat Discover",
    client: "VICE",
    year: "2018",
    category: "editorial",
    role: "Motion Designer",
    tools: ["After Effects", "Cinema 4D", "Illustrator"],
    description:
      "6-8 daily looping editorial illustrations for VICE's Snapchat Discover channel — high-volume creative production under tight deadlines.",
    thumbnail: "/images/vice-snapchat.webp",
    video: "/videos/vice-snapchat.mp4",
  },
  // Add more projects as content becomes available.
  // Each project must have a category matching a workCategories id from sections.ts.
];

export function getProjectsByCategory(categoryId: string): Project[] {
  return projects.filter((p) => p.category === categoryId);
}
```

- [ ] **Step 2: Create CategorySection component**

Create `src/components/work/CategorySection.tsx`:

```tsx
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/data/projects";
import type { WorkCategory } from "@/data/sections";

interface CategorySectionProps {
  category: WorkCategory;
  projects: Project[];
}

export function CategorySection({ category, projects }: CategorySectionProps) {
  if (projects.length === 0) return null;

  return (
    <div className="py-16" id={`category-${category.id}`}>
      <span
        className="font-mono text-mono uppercase tracking-wider"
        style={{ color: category.accent }}
      >
        ({category.number} — {category.label})
      </span>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {projects.map((project, i) => (
          <div key={project.id} className={i % 2 === 1 ? "lg:mt-12" : ""}>
            <ProjectCard project={project} accentColor={category.accent} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ProjectCard component (collapsed state only for now)**

Create `src/components/work/ProjectCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  accentColor: string;
}

export function ProjectCard({ project, accentColor }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="overflow-hidden rounded-card bg-bg-surface">
      {/* Title bar — click to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={expanded}
      >
        <div>
          <h3 className="font-display text-heading font-bold">
            {project.title}
          </h3>
          <span className="mt-1 block font-mono text-mono text-text-secondary">
            {project.client} — {project.year}
          </span>
        </div>
        <span
          className="text-lg transition-transform"
          style={{
            color: accentColor,
            transform: expanded ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>

      {/* Thumbnail */}
      <div className="relative aspect-video bg-bg-surface-raised">
        {project.thumbnail && (
          <img
            src={project.thumbnail}
            alt={`${project.title} — ${project.client}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {/* Placeholder when no image */}
        {!project.thumbnail && (
          <div className="flex h-full items-center justify-center text-text-secondary">
            <span className="font-mono text-mono">{project.client}</span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="space-y-4 px-6 py-6">
          <p className="text-body text-text-secondary">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span>
              <strong className="text-text-primary">Role:</strong>{" "}
              {project.role}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {tool}
              </span>
            ))}
          </div>
          {project.video && (
            <div className="aspect-video overflow-hidden rounded-radius-cell bg-bg-surface-raised">
              <video
                src={project.video}
                controls
                preload="none"
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Create Work section wrapper**

Create `src/components/sections/Work.tsx`:

```tsx
import { CategorySection } from "@/components/work/CategorySection";
import { workCategories } from "@/data/sections";
import { getProjectsByCategory } from "@/data/projects";

export function Work() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:px-16">
      {workCategories.map((category) => {
        const categoryProjects = getProjectsByCategory(category.id);
        return (
          <CategorySection
            key={category.id}
            category={category}
            projects={categoryProjects}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Wire Work section into page**

In `src/app/page.tsx`, import `Work` and render it for the `work` section, same pattern as Hello.

- [ ] **Step 6: Verify and commit**

Check browser — Work section shows categories with project cards. Click a card to expand/contract. Categories with no projects are hidden. Commit:

```bash
git add -A
git commit -m "feat: section 02 Work with categories, project data, and expandable cards"
```

---

### Task 6: Animate Card Expand/Contract with GSAP

**Files:**
- Modify: `src/components/work/ProjectCard.tsx`

- [ ] **Step 1: Replace boolean toggle with GSAP-animated expand/contract**

Replace `src/components/work/ProjectCard.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Project } from "@/data/projects";

gsap.registerPlugin(useGSAP);

interface ProjectCardProps {
  project: Project;
  accentColor: string;
}

export function ProjectCard({ project, accentColor }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  const { contextSafe } = useGSAP({ scope: cardRef });

  const toggleExpand = contextSafe(() => {
    const content = contentRef.current;
    if (!content) return;

    if (!expanded) {
      // Expand: set to auto height with GSAP
      gsap.set(content, { display: "block", height: "auto" });
      const fullHeight = content.offsetHeight;
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: fullHeight,
          opacity: 1,
          duration: 0.5,
          ease: "expo.out",
          onComplete: () => gsap.set(content, { height: "auto" }),
        }
      );
      setExpanded(true);
    } else {
      // Contract
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "expo.out",
        onComplete: () => {
          gsap.set(content, { display: "none" });
          setExpanded(false);
        },
      });
    }
  });

  return (
    <article ref={cardRef} className="overflow-hidden rounded-card bg-bg-surface">
      <button
        onClick={toggleExpand}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={expanded}
      >
        <div>
          <h3 className="font-display text-heading font-bold">
            {project.title}
          </h3>
          <span className="mt-1 block font-mono text-mono text-text-secondary">
            {project.client} — {project.year}
          </span>
        </div>
        <span
          className="text-lg transition-transform"
          style={{
            color: accentColor,
            transform: expanded ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>

      <div className="relative aspect-video bg-bg-surface-raised">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={`${project.title} — ${project.client}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-secondary">
            <span className="font-mono text-mono">{project.client}</span>
          </div>
        )}
      </div>

      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ display: "none", height: 0 }}
      >
        <div className="space-y-4 px-6 py-6">
          <p className="text-body text-text-secondary">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span>
              <strong className="text-text-primary">Role:</strong>{" "}
              {project.role}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {tool}
              </span>
            ))}
          </div>
          {project.video && (
            <div className="aspect-video overflow-hidden rounded-radius-cell bg-bg-surface-raised">
              <video
                src={project.video}
                controls
                preload="none"
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify and commit**

Check browser — clicking a card title animates the content open (height + opacity). Clicking again animates it closed. The `+` rotates to `×`. Commit:

```bash
git add -A
git commit -m "feat: GSAP-animated card expand/contract"
```

---

### Task 7: Section 03 — About

**Files:**
- Create: `src/components/sections/About.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create About section**

Create `src/components/sections/About.tsx`:

```tsx
const skillCategories = [
  {
    label: "Motion",
    skills: ["After Effects", "Cinema 4D", "Premiere Pro", "DaVinci Resolve"],
  },
  {
    label: "Design",
    skills: ["Figma", "Illustrator", "Photoshop"],
  },
];

export function About() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Photo */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-bg-surface">
          <img
            src="/images/james-purdy.webp"
            alt="James Purdy"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <h2 className="font-display text-display font-bold leading-tight">
            A motion designer who builds things that move and things that think.
          </h2>

          <div className="prose-width mt-8 space-y-5 text-body text-text-secondary">
            <p>
              I've spent the last decade making things move for brands,
              agencies, and studios (Google, IBM, VICE, D&AD, among others).
              My work lives at the intersection of motion design, editorial
              animation, and interactive experiences.
            </p>
            <p>
              I care about craft, concept, and the space between design and
              code. Based in Brooklyn (currently open to opportunities).
            </p>
          </div>

          {/* Skills */}
          <div className="mt-10 space-y-4">
            {skillCategories.map((cat) => (
              <div key={cat.label}>
                <span className="font-mono text-mono uppercase tracking-wider text-text-secondary">
                  ({cat.label})
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-bg-surface px-4 py-1.5 text-sm text-text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Resume download */}
          <div className="mt-10">
            <a
              href="/james-purdy-resume.pdf"
              download
              className="inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-2.5 text-sm font-medium text-bg-base transition-opacity hover:opacity-80"
            >
              Download Resume
              <span aria-hidden="true">&darr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into page and commit**

Import `About`, render for `about` section in `page.tsx`. Verify layout in browser. Commit:

```bash
git add -A
git commit -m "feat: section 03 About with photo, bio, skills, and resume download"
```

---

### Task 8: Section 04 — Contact

**Files:**
- Create: `src/components/sections/Contact.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Contact section**

Create `src/components/sections/Contact.tsx`:

```tsx
const links = [
  { label: "Email", action: "talk", href: "mailto:james@purdygood.me" },
  { label: "LinkedIn", action: "connect", href: "https://linkedin.com/in/jamespurdy" },
  { label: "Vimeo", action: "watch", href: "https://vimeo.com/purdygood" },
  { label: "GitHub", action: "build", href: "https://github.com/purdygoo" },
];

export function Contact() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-start px-6 py-24 lg:px-16">
      <h2 className="font-display text-display font-bold">Say hello.</h2>

      <p className="mt-6 text-body text-text-secondary">
        Currently available for motion design roles and select freelance
        projects.
      </p>

      <div className="mt-12 flex flex-wrap gap-4">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
            className="rounded-full bg-bg-surface px-6 py-3 text-body font-medium text-text-primary transition-colors hover:bg-bg-surface-raised"
          >
            {link.label}{" "}
            <span className="text-text-secondary">({link.action})</span>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire into page and commit**

Import `Contact`, render for `contact` section. Verify. Commit:

```bash
git add -A
git commit -m "feat: section 04 Contact with parenthetical link labels"
```

---

### Task 9: Hero Section — Static Layout (Before Canvas)

**Files:**
- Create: `src/components/sections/Hero.tsx`
- Create: `src/components/sections/HeroDesktop.tsx`
- Create: `src/components/sections/HeroMobile.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create HeroMobile component**

Create `src/components/sections/HeroMobile.tsx`:

```tsx
export function HeroMobile() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-center px-6 py-24">
      <h1 className="font-display text-display-xl font-bold leading-none tracking-tight">
        PURDYGOOD
      </h1>
      <p className="mt-6 text-body text-text-secondary prose-width">
        Motion designer who thinks in systems and moves in stories.
      </p>
      <div className="mt-12 font-mono text-mono text-text-secondary">
        (scroll)
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create HeroDesktop component (static placeholder — canvas comes later)**

Create `src/components/sections/HeroDesktop.tsx`:

```tsx
export function HeroDesktop() {
  return (
    <div className="relative flex min-h-screen flex-col items-start justify-center px-16">
      {/* Grid canvas will be layered here in Task 15 */}
      <h1 className="relative z-10 font-display text-display-xl font-bold leading-none tracking-tight">
        PURDYGOOD
      </h1>
      <p className="relative z-10 mt-6 text-body text-text-secondary prose-width">
        Motion designer who thinks in systems and moves in stories.
      </p>
      <div className="relative z-10 mt-12 font-mono text-mono text-text-secondary">
        (scroll)
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Hero wrapper that switches on viewport**

Create `src/components/sections/Hero.tsx`:

```tsx
"use client";

import { useIsDesktop } from "@/lib/use-is-desktop";
import { HeroDesktop } from "./HeroDesktop";
import { HeroMobile } from "./HeroMobile";

export function Hero() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <HeroDesktop /> : <HeroMobile />;
}
```

- [ ] **Step 4: Wire into page and commit**

Import `Hero`, render for `hero` section. Verify both desktop and mobile. Commit:

```bash
git add -A
git commit -m "feat: hero section with desktop/mobile split (static layout)"
```

---

## Phase 3: Scroll Choreography

### Task 10: GSAP ScrollTrigger — Fade-Up Reveals

**Files:**
- Create: `src/lib/scroll-animations.ts`
- Modify: `src/components/sections/Hello.tsx`
- Modify: `src/components/sections/About.tsx`
- Modify: `src/components/sections/Contact.tsx`
- Modify: `src/components/work/CategorySection.tsx`

- [ ] **Step 1: Create scroll animation utility**

Create `src/lib/scroll-animations.ts`:

```typescript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function fadeUpOnScroll(
  elements: string | Element | Element[],
  container: Element,
  options?: { stagger?: number; delay?: number }
) {
  return gsap.from(elements, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "expo.out",
    stagger: options?.stagger ?? 0.12,
    delay: options?.delay ?? 0,
    scrollTrigger: {
      trigger: container,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });
}
```

- [ ] **Step 2: Add scroll reveals to Hello section**

Modify `src/components/sections/Hello.tsx` — wrap in a client component with useGSAP:

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const clients = [
  "Google", "IBM", "VICE", "T-Mobile", "D&AD", "BESE", "Propel",
];

export function Hello() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-animate]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-16"
    >
      <div>
        <h2
          data-animate
          className="font-display text-display font-bold leading-tight"
        >
          Motion design that moves people, not just pixels.
        </h2>
        <div
          data-animate
          className="prose-width mt-8 space-y-6 text-body text-text-secondary"
        >
          <p>
            Based in Brooklyn (by way of everywhere). I make things move with
            purpose — explainer videos, brand films, editorial animation,
            product demos, and the occasional VJ set.
          </p>
          <p>
            Currently seeking full-time and freelance opportunities
            (preferably with people who care about craft).
          </p>
        </div>
      </div>
      <div data-animate className="flex items-end">
        <div>
          <span className="font-mono text-mono uppercase tracking-wider text-text-secondary">
            (Selected clients)
          </span>
          <ul className="mt-4 flex flex-wrap gap-2">
            {clients.map((client) => (
              <li
                key={client}
                className="rounded-full bg-bg-surface px-4 py-1.5 text-sm text-text-primary"
              >
                {client}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Apply same scroll reveal pattern to About, Contact, and CategorySection**

Apply the same `useGSAP` + `data-animate` + `ScrollTrigger` pattern to each component. Each component gets:
1. `"use client"` directive
2. A `containerRef`
3. `useGSAP` with `gsap.from("[data-animate]", { ... scrollTrigger })` scoped to the container
4. `data-animate` attribute on each major content block

The implementation is identical to Hello — same animation values (`y: 40`, `opacity: 0`, `duration: 0.8`, `ease: "expo.out"`, `stagger: 0.15`, `start: "top 75%"`) to maintain a consistent motion tempo across the site.

- [ ] **Step 4: Verify and commit**

Scroll through the site. Each section's content should fade up as it enters the viewport. Commit:

```bash
git add -A
git commit -m "feat: scroll-triggered fade-up reveals on all content sections"
```

---

### Task 11: Card Cascade Entry Animation

**Files:**
- Modify: `src/components/work/CategorySection.tsx`

- [ ] **Step 1: Add cascade entry to category cards**

Update `CategorySection.tsx` — add `useGSAP` for staggered card entry with alternating-side rotation:

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProjectCard } from "./ProjectCard";
import { useIsDesktop } from "@/lib/use-is-desktop";
import type { Project } from "@/data/projects";
import type { WorkCategory } from "@/data/sections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface CategorySectionProps {
  category: WorkCategory;
  projects: Project[];
}

export function CategorySection({ category, projects }: CategorySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<Element>("[data-card]");
      if (cards.length === 0) return;

      cards.forEach((card, i) => {
        const fromLeft = i % 2 === 0;

        gsap.from(card, {
          x: isDesktop ? (fromLeft ? -60 : 60) : 0,
          y: 40,
          opacity: 0,
          rotation: isDesktop ? (fromLeft ? -3 : 3) : 0,
          duration: 0.7,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    },
    { scope: containerRef, dependencies: [isDesktop] }
  );

  if (projects.length === 0) return null;

  return (
    <div ref={containerRef} className="py-16" id={`category-${category.id}`}>
      <span
        className="font-mono text-mono uppercase tracking-wider"
        style={{ color: category.accent }}
      >
        ({category.number} — {category.label})
      </span>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {projects.map((project, i) => (
          <div
            key={project.id}
            data-card
            className={i % 2 === 1 ? "lg:mt-12" : ""}
          >
            <ProjectCard project={project} accentColor={category.accent} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify and commit**

Scroll to Work section. Cards should enter from alternating sides with slight rotation on desktop, simple fade-up on mobile. Commit:

```bash
git add -A
git commit -m "feat: card cascade entry with alternating rotation"
```

---

## Phase 4: Custom Cursor and Magnetic Field

### Task 12: Custom Cursor

**Files:**
- Create: `src/lib/use-mouse.ts`
- Create: `src/components/cursor/CustomCursor.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create mouse position + velocity hook**

Create `src/lib/use-mouse.ts`:

```typescript
"use client";

import { useRef, useEffect, useCallback } from "react";

export interface MouseState {
  x: number;
  y: number;
  velocity: number;
}

export function useMouse(): React.RefObject<MouseState> {
  const state = useRef<MouseState>({ x: 0, y: 0, velocity: 0 });
  const prev = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const now = performance.now();
      const dt = now - prev.current.time;

      if (dt > 0) {
        const dx = e.clientX - prev.current.x;
        const dy = e.clientY - prev.current.y;
        state.current.velocity = Math.sqrt(dx * dx + dy * dy) / dt * 1000;
      }

      state.current.x = e.clientX;
      state.current.y = e.clientY;
      prev.current = { x: e.clientX, y: e.clientY, time: now };
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return state;
}
```

- [ ] **Step 2: Create CustomCursor component**

Create `src/components/cursor/CustomCursor.tsx`:

```tsx
"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useMouse } from "@/lib/use-mouse";
import { sections } from "@/data/sections";
import { useActiveSection } from "@/lib/use-active-section";

const sectionIds = sections.map((s) => s.id);

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouse = useMouse();
  const activeSection = useActiveSection(sectionIds);
  const accent =
    sections.find((s) => s.id === activeSection)?.accent ?? "#FF5F1F";

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let raf: number;
    const pos = { x: 0, y: 0 };

    function tick() {
      // Lerp cursor position for smooth follow
      pos.x += (mouse.current.x - pos.x) * 0.15;
      pos.y += (mouse.current.y - pos.y) * 0.15;

      cursor!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouse]);

  // Update cursor accent color
  useEffect(() => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        borderColor: accent,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [accent]);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden -translate-x-1/2 -translate-y-1/2 lg:block"
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: `1.5px solid ${accent}`,
        transition: "width 0.3s, height 0.3s",
      }}
    />
  );
}
```

- [ ] **Step 3: Add cursor to page and hide default cursor on desktop**

In `src/app/page.tsx`, import and render `<CustomCursor />` before `<main>`.

Add to `globals.css`:

```css
@media (min-width: 1024px) {
  * {
    cursor: none !important;
  }
}
```

- [ ] **Step 4: Verify and commit**

Move mouse — custom circle cursor follows with smooth lerp delay. Color changes per section. System cursor hidden on desktop. Commit:

```bash
git add -A
git commit -m "feat: custom cursor with lerped follow and section-aware accent color"
```

---

### Task 13: Magnetic Field System

**Files:**
- Create: `src/lib/magnetic.ts`
- Create: `src/components/cursor/MagneticTarget.tsx`
- Modify: `src/components/work/ProjectCard.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create magnetic field math utility**

Create `src/lib/magnetic.ts`:

```typescript
export interface MagneticConfig {
  strength: number;    // 0-1, how much the element moves
  radius: number;      // px, activation distance
  tiltDeg?: number;    // max tilt in degrees (for 3D perspective)
}

export function getMagneticOffset(
  mouseX: number,
  mouseY: number,
  rect: DOMRect,
  config: MagneticConfig
): { x: number; y: number; tiltX: number; tiltY: number; distance: number } {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > config.radius) {
    return { x: 0, y: 0, tiltX: 0, tiltY: 0, distance };
  }

  const factor = (1 - distance / config.radius) * config.strength;
  const maxTilt = config.tiltDeg ?? 0;

  return {
    x: dx * factor,
    y: dy * factor,
    tiltX: -(dy / config.radius) * maxTilt * factor,
    tiltY: (dx / config.radius) * maxTilt * factor,
    distance,
  };
}
```

- [ ] **Step 2: Create MagneticTarget wrapper component**

Create `src/components/cursor/MagneticTarget.tsx`:

```tsx
"use client";

import { useRef, useEffect } from "react";
import { getMagneticOffset, type MagneticConfig } from "@/lib/magnetic";
import { useMouse } from "@/lib/use-mouse";

interface MagneticTargetProps {
  children: React.ReactNode;
  config?: Partial<MagneticConfig>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const defaultConfig: MagneticConfig = {
  strength: 0.3,
  radius: 200,
  tiltDeg: 8,
};

export function MagneticTarget({
  children,
  config: configOverrides,
  className,
  as: Tag = "div",
}: MagneticTargetProps) {
  const ref = useRef<HTMLElement>(null);
  const mouse = useMouse();
  const config = { ...defaultConfig, ...configOverrides };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;

    function tick() {
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const { x, y, tiltX, tiltY } = getMagneticOffset(
        mouse.current.x,
        mouse.current.y,
        rect,
        config
      );

      el.style.transform = `translate3d(${x}px, ${y}px, 0) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouse, config]);

  return (
    // @ts-expect-error - dynamic tag
    <Tag ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 3: Wrap project cards in MagneticTarget**

In `ProjectCard.tsx`, wrap the `<article>` with `<MagneticTarget>`:

```tsx
import { MagneticTarget } from "@/components/cursor/MagneticTarget";
import { useIsDesktop } from "@/lib/use-is-desktop";

// Inside the component:
const isDesktop = useIsDesktop();

// Wrap the return:
const card = (
  <article ref={cardRef} className="overflow-hidden rounded-card bg-bg-surface">
    {/* ... existing card content ... */}
  </article>
);

return isDesktop ? (
  <MagneticTarget config={{ strength: 0.15, radius: 250, tiltDeg: 5 }}>
    {card}
  </MagneticTarget>
) : (
  card
);
```

- [ ] **Step 4: Apply magnetic effect to sidebar tiles**

In `Sidebar.tsx`, wrap each tile button with `<MagneticTarget>`:

```tsx
import { MagneticTarget } from "@/components/cursor/MagneticTarget";

// Wrap each button:
<MagneticTarget
  key={section.id}
  config={{ strength: 0.4, radius: 100, tiltDeg: 0 }}
>
  <button ...>
    {/* existing tile content */}
  </button>
</MagneticTarget>
```

- [ ] **Step 5: Verify and commit**

Move cursor near cards — they tilt toward cursor in 3D. Sidebar tiles attract toward cursor. Commit:

```bash
git add -A
git commit -m "feat: magnetic field system on cards and sidebar tiles"
```

---

## Phase 5: Hero Grid Canvas

### Task 14: Create the Pixel Grid Canvas (Core)

**Files:**
- Create: `src/lib/grid-canvas.ts`
- Modify: `src/components/sections/HeroDesktop.tsx`

- [ ] **Step 1: Create grid canvas engine**

Create `src/lib/grid-canvas.ts`:

```typescript
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
  private bgColor: string;
  private raf = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: Partial<GridConfig> = {},
    bgColor = "#F2EDE8"
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.config = { ...defaultGridConfig, ...config };
    this.bgColor = bgColor;
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
```

- [ ] **Step 2: Integrate grid canvas into HeroDesktop**

Replace `src/components/sections/HeroDesktop.tsx`:

```tsx
"use client";

import { useRef, useEffect } from "react";
import { GridCanvas } from "@/lib/grid-canvas";
import { useMouse } from "@/lib/use-mouse";

export function HeroDesktop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<GridCanvas | null>(null);
  const mouse = useMouse();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const grid = new GridCanvas(canvas);
    gridRef.current = grid;

    // Load hidden image
    const img = new Image();
    img.src = "/images/hidden-layer.webp";
    img.onload = () => grid.setHiddenImage(img);

    grid.start();

    // Track mouse over canvas
    let raf: number;
    function trackMouse() {
      const rect = canvas!.getBoundingClientRect();
      const localX = mouse.current.x - rect.left;
      const localY = mouse.current.y - rect.top;

      if (
        localX >= 0 &&
        localY >= 0 &&
        localX <= rect.width &&
        localY <= rect.height
      ) {
        grid.activateAt(localX, localY, mouse.current.velocity);
      }

      raf = requestAnimationFrame(trackMouse);
    }
    raf = requestAnimationFrame(trackMouse);

    // Handle resize
    function onResize() {
      grid.resize();
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      grid.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [mouse]);

  return (
    <div className="relative flex min-h-screen items-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none" }}
      />
      <div className="relative z-10 px-16">
        <h1 className="font-display text-display-xl font-bold leading-none tracking-tight">
          PURDYGOOD
        </h1>
        <p className="mt-6 text-body text-text-secondary prose-width">
          Motion designer who thinks in systems and moves in stories.
        </p>
        <div className="mt-12 font-mono text-mono text-text-secondary">
          (scroll)
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create placeholder hidden layer image**

Create a placeholder image at `public/images/hidden-layer.webp` — this can be a gradient, a texture, or a composite of project stills. For now, create a solid color placeholder:

```bash
# Use ImageMagick or create manually — any 1920x1080 image works
# The hidden image will be revealed through the grid cells
```

If no ImageMagick available, the canvas will gracefully show cell-colored fills when no image is loaded.

- [ ] **Step 4: Verify and commit**

Open dev server on desktop. Move cursor over hero section — grid cells should activate along the cursor path, revealing the hidden image, then fade back. Fast mouse movement creates wider trails. Commit:

```bash
git add -A
git commit -m "feat: hero pixel grid canvas with cursor trail and hidden image reveal"
```

---

### Task 15: Grid Canvas — Selection Box and Fluid Disintegration

**Files:**
- Modify: `src/lib/grid-canvas.ts`
- Modify: `src/components/sections/HeroDesktop.tsx`

- [ ] **Step 1: Add selection box state and disintegration to GridCanvas**

Add to `src/lib/grid-canvas.ts`, inside the `GridCanvas` class:

```typescript
// Add these fields to the class:
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
      const dx = c - centerCol;
      const dy = r - centerRow;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      this.disintegratingCells.push({
        col: c,
        row: r,
        x: cell.x,
        y: cell.y,
        vx: (dx / dist) * (3 + Math.random() * 4),
        vy: (dy / dist) * (3 + Math.random() * 4),
        opacity: 1,
      });

      // Mark cell as revealed
      cell.activation = 1;
      cell.activatedAt = performance.now();
    }
  }

  this.selectionStart = null;
  this.selectionEnd = null;
  return true;
}
```

Update the `draw()` method to include selection box rendering and disintegrating cells:

```typescript
// At the end of the draw() method, after the cell loop:

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

// Draw disintegrating cells
const step = this.config.cellSize + this.config.gap;
for (let i = this.disintegratingCells.length - 1; i >= 0; i--) {
  const dc = this.disintegratingCells[i];
  dc.x += dc.vx;
  dc.y += dc.vy;
  dc.vx *= 0.96; // friction
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
```

- [ ] **Step 2: Wire mouse events in HeroDesktop**

Add to `HeroDesktop.tsx`, inside the `useEffect`:

```typescript
let isDragging = false;

function onMouseDown(e: MouseEvent) {
  const rect = canvas!.getBoundingClientRect();
  const localX = e.clientX - rect.left;
  const localY = e.clientY - rect.top;
  isDragging = true;
  grid.startSelection(localX, localY);
}

function onMouseMove(e: MouseEvent) {
  if (isDragging) {
    const rect = canvas!.getBoundingClientRect();
    grid.updateSelection(e.clientX - rect.left, e.clientY - rect.top);
  }
}

function onMouseUp(e: MouseEvent) {
  if (isDragging) {
    isDragging = false;
    grid.endSelection();
  }
}

function onClick(e: MouseEvent) {
  const rect = canvas!.getBoundingClientRect();
  grid.clickSelection(e.clientX - rect.left, e.clientY - rect.top);
}

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("click", onClick);

// Add to cleanup:
return () => {
  canvas.removeEventListener("mousedown", onMouseDown);
  canvas.removeEventListener("mousemove", onMouseMove);
  canvas.removeEventListener("mouseup", onMouseUp);
  canvas.removeEventListener("click", onClick);
  // ... existing cleanup
};
```

- [ ] **Step 3: Verify and commit**

Click and drag on hero grid — dashed selection box should appear snapped to grid cells. Click inside the selection — cells disintegrate outward with fluid-like motion and fade. Commit:

```bash
git add -A
git commit -m "feat: grid canvas selection box and fluid disintegration"
```

---

### Task 16: PURDYGOOD Grid-Integrated Title

**Files:**
- Create: `src/lib/grid-title.ts`
- Modify: `src/lib/grid-canvas.ts`
- Modify: `src/components/sections/HeroDesktop.tsx`

- [ ] **Step 1: Create bitmap font data for PURDYGOOD**

Create `src/lib/grid-title.ts`:

```typescript
// Each letter is a grid of 1s and 0s — 1 means the cell is part of the letter.
// These are 5-wide × 7-tall bitmap representations.
// Adjust for visual quality during implementation.

const GLYPHS: Record<string, number[][]> = {
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  U: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  G: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
};

const ASCII_DIRECTIONAL = ["|", "/", "—", "\\", "|", "/", "—", "\\"];

export interface TitleCell {
  col: number;
  row: number;
  isLetter: boolean;
  char: string;
}

export function getLetterCells(
  text: string,
  startCol: number,
  startRow: number,
  letterSpacing: number
): TitleCell[] {
  const cells: TitleCell[] = [];
  let offsetCol = startCol;

  for (const char of text) {
    const glyph = GLYPHS[char];
    if (!glyph) {
      offsetCol += 2; // space
      continue;
    }

    for (let r = 0; r < glyph.length; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] === 1) {
          cells.push({
            col: offsetCol + c,
            row: startRow + r,
            isLetter: true,
            char,
          });
        }
      }
    }

    offsetCol += glyph[0].length + letterSpacing;
  }

  return cells;
}

export function getDirectionalAscii(
  mouseX: number,
  mouseY: number,
  cellX: number,
  cellY: number
): string {
  const dx = mouseX - cellX;
  const dy = mouseY - cellY;
  const angle = Math.atan2(dy, dx);
  // Map angle to 8 directions
  const index = Math.round(((angle + Math.PI) / (2 * Math.PI)) * 8) % 8;
  return ASCII_DIRECTIONAL[index];
}
```

- [ ] **Step 2: Integrate letter cells into GridCanvas**

Add to `GridCanvas` class in `grid-canvas.ts`:

```typescript
import { getLetterCells, getDirectionalAscii, type TitleCell } from "./grid-title";

// Add field:
private letterCells: Map<string, TitleCell> = new Map();

initTitle(text: string) {
  // Center the title in the grid
  const charWidth = 5;
  const letterSpacing = 2;
  const totalWidth = text.length * (charWidth + letterSpacing) - letterSpacing;
  const startCol = Math.floor((this.cols - totalWidth) / 2);
  const startRow = Math.floor(this.rows / 2) - 3; // vertically center 7-row glyphs

  const cells = getLetterCells(text, startCol, startRow, letterSpacing);
  this.letterCells.clear();
  for (const cell of cells) {
    this.letterCells.set(`${cell.col},${cell.row}`, cell);
  }
}

// Update the draw() method's inner cell loop to handle letter cells.
// Replace the cell-drawing block inside the for(r)/for(c) loop with:

const key = `${cell.col},${cell.row}`;
const letterCell = this.letterCells.get(key);

if (letterCell) {
  // Letter cell: slightly more visible at rest, different rendering
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
  // Non-letter cell: original rendering from Task 14
  // (fade decay + dormant/hidden-image reveal logic stays as-is)
}

// Add mouse tracking for ASCII direction:
private _mouseLocal: { x: number; y: number } | null = null;

setMousePosition(x: number, y: number) {
  this._mouseLocal = { x, y };
}
```

- [ ] **Step 3: Initialize title in HeroDesktop and pass mouse position**

In `HeroDesktop.tsx`, after creating the grid:

```typescript
grid.initTitle("PURDYGOOD");
```

In the mouse tracking loop, add:

```typescript
grid.setMousePosition(localX, localY);
```

Remove the HTML `<h1>PURDYGOOD</h1>` element — the title is now rendered by the canvas.

- [ ] **Step 4: Verify and commit**

"PURDYGOOD" should appear as a subtle formation in the grid. Moving the cursor near the letters shows directional ASCII characters. Commit:

```bash
git add -A
git commit -m "feat: grid-integrated PURDYGOOD title with directional ASCII"
```

---

## Phase 6: Mobile and Navigation Polish

### Task 17: Mobile Navigation

**Files:**
- Create: `src/components/layout/MobileNav.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create MobileNav component**

Create `src/components/layout/MobileNav.tsx`:

```tsx
"use client";

import { sections } from "@/data/sections";

interface MobileNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export function MobileNav({ activeSection, onNavigate }: MobileNavProps) {
  return (
    <nav
      className="fixed left-0 top-0 z-50 flex h-14 w-full items-center gap-2 bg-bg-base/80 px-4 backdrop-blur-sm lg:hidden"
      aria-label="Section navigation"
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            aria-label={`Go to ${section.label}`}
            aria-current={isActive ? "true" : undefined}
            className="flex h-9 w-9 items-center justify-center rounded-radius-cell"
            style={{
              backgroundColor: isActive ? section.accent : "transparent",
              border: isActive ? "none" : `1.5px solid ${section.accent}40`,
            }}
          >
            <span
              className="font-mono text-xs"
              style={{ color: isActive ? "#fff" : section.accent }}
            >
              {section.number}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Add to page layout**

In `src/app/page.tsx`, import `MobileNav` and render alongside Sidebar:

```tsx
import { MobileNav } from "@/components/layout/MobileNav";

// In the JSX:
{isDesktop ? (
  <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
) : (
  <MobileNav activeSection={activeSection} onNavigate={handleNavigate} />
)}
```

Add top padding on mobile for the fixed nav:

```tsx
<main className="pt-14 lg:pl-20 lg:pt-0">
```

- [ ] **Step 3: Verify and commit**

Resize to mobile — horizontal tile strip at top, tappable, active tile filled. Desktop still shows sidebar. Commit:

```bash
git add -A
git commit -m "feat: mobile top navigation with color-coded tiles"
```

---

## Phase 7: Particle System and Phosphorescent Trails

### Task 18: Particle Engine

**Files:**
- Create: `src/lib/particles.ts`
- Create: `src/components/particles/ParticleCanvas.tsx`

- [ ] **Step 1: Create particle engine**

Create `src/lib/particles.ts`:

```typescript
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
```

- [ ] **Step 2: Create ParticleCanvas overlay component**

Create `src/components/particles/ParticleCanvas.tsx`:

```tsx
"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ParticleEngine } from "@/lib/particles";

export interface ParticleCanvasHandle {
  emit: ParticleEngine["emit"];
}

export const ParticleCanvas = forwardRef<ParticleCanvasHandle>(
  function ParticleCanvas(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef(new ParticleEngine(50));

    useImperativeHandle(ref, () => ({
      emit: (...args) => engineRef.current.emit(...args),
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      let raf: number;

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas!.width = window.innerWidth * dpr;
        canvas!.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
      }

      resize();
      window.addEventListener("resize", resize);

      function tick() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        engineRef.current.update();
        engineRef.current.draw(ctx);
        raf = requestAnimationFrame(tick);
      }

      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[90] hidden lg:block"
        style={{ width: "100vw", height: "100vh" }}
      />
    );
  }
);
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: particle engine and canvas overlay component"
```

---

### Task 19: Wire Phosphorescent Trail Triggers

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/work/ProjectCard.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add ParticleCanvas to page and create global ref**

In `src/app/page.tsx`:

```tsx
import { useRef } from "react";
import { ParticleCanvas, type ParticleCanvasHandle } from "@/components/particles/ParticleCanvas";

// Inside Home():
const particlesRef = useRef<ParticleCanvasHandle>(null);

// In JSX, before <main>:
{isDesktop && <ParticleCanvas ref={particlesRef} />}
```

Pass `particlesRef` down to components that need to emit particles (via context or props). Create a simple context:

Create `src/lib/particle-context.ts`:

```typescript
"use client";

import { createContext, useContext } from "react";
import type { ParticleCanvasHandle } from "@/components/particles/ParticleCanvas";

export const ParticleContext = createContext<React.RefObject<ParticleCanvasHandle | null> | null>(null);

export function useParticles() {
  return useContext(ParticleContext);
}
```

Wrap `<main>` in `<ParticleContext.Provider value={particlesRef}>`.

- [ ] **Step 2: Add expansion burst to ProjectCard**

In `ProjectCard.tsx`, on expand:

```typescript
import { useParticles } from "@/lib/particle-context";

// Inside component:
const particlesRef = useParticles();

// In toggleExpand, after the expand animation starts:
if (!expanded && particlesRef?.current) {
  const rect = cardRef.current!.getBoundingClientRect();
  // Emit from all 4 edges
  const color = accentColor;
  const emitter = particlesRef.current;

  // Top edge
  emitter.emit(rect.left + rect.width / 2, rect.top, 6, {
    color, speed: 4, direction: -Math.PI / 2, spread: Math.PI * 0.6, decay: 0.025,
  });
  // Bottom edge
  emitter.emit(rect.left + rect.width / 2, rect.bottom, 6, {
    color, speed: 4, direction: Math.PI / 2, spread: Math.PI * 0.6, decay: 0.025,
  });
  // Left edge
  emitter.emit(rect.left, rect.top + rect.height / 2, 4, {
    color, speed: 3, direction: Math.PI, spread: Math.PI * 0.4, decay: 0.025,
  });
  // Right edge
  emitter.emit(rect.right, rect.top + rect.height / 2, 4, {
    color, speed: 3, direction: 0, spread: Math.PI * 0.4, decay: 0.025,
  });
}
```

- [ ] **Step 3: Add section transition streak to Sidebar**

In `Sidebar.tsx`, detect when active section changes and emit a streak:

```typescript
import { useEffect, useRef } from "react";
import { useParticles } from "@/lib/particle-context";

// Inside Sidebar:
const particlesRef = useParticles();
const prevSection = useRef(activeSection);

useEffect(() => {
  if (prevSection.current === activeSection) return;
  if (!particlesRef?.current) return;

  const prevIndex = sections.findIndex((s) => s.id === prevSection.current);
  const nextIndex = sections.findIndex((s) => s.id === activeSection);
  const prevAccent = sections[prevIndex]?.accent ?? "#FF5F1F";

  // Emit streak from old tile position to new tile position
  // Sidebar tiles are vertically centered — approximate positions
  const sidebarX = 40; // center of 80px sidebar
  const tileGap = 60; // approximate gap between tile centers
  const startY = window.innerHeight / 2 - (sections.length * tileGap) / 2 + prevIndex * tileGap;
  const endY = window.innerHeight / 2 - (sections.length * tileGap) / 2 + nextIndex * tileGap;

  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const y = startY + (endY - startY) * t;
    setTimeout(() => {
      particlesRef.current?.emit(sidebarX, y, 2, {
        color: prevAccent,
        speed: 1,
        size: 5,
        decay: 0.03,
        spread: 0.5,
      });
    }, i * 50);
  }

  prevSection.current = activeSection;
}, [activeSection, particlesRef]);
```

- [ ] **Step 4: Verify and commit**

- Click a project card to expand — particles burst from edges in the category accent color
- Scroll between sections — phosphorescent streak flows between sidebar tiles

Commit:

```bash
git add -A
git commit -m "feat: phosphorescent trails — card expansion burst and sidebar section streak"
```

---

## Phase 8: Accessibility and Deployment

### Task 20: prefers-reduced-motion Support

**Files:**
- Create: `src/lib/use-reduced-motion.ts`
- Modify: `src/components/sections/Hero.tsx`
- Modify: `src/components/cursor/CustomCursor.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create reduced motion hook**

Create `src/lib/use-reduced-motion.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);

    function onChange(e: MediaQueryListEvent) {
      setReduced(e.matches);
    }

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 2: Gate all animation systems on reduced motion**

In `src/app/page.tsx`:

```typescript
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Inside Home():
const reducedMotion = useReducedMotion();

// Conditionally render animation-dependent components:
{isDesktop && !reducedMotion && <CustomCursor />}
{isDesktop && !reducedMotion && <ParticleCanvas ref={particlesRef} />}
```

The CSS-level `prefers-reduced-motion: reduce` rule in `globals.css` (from Task 2) already disables CSS transitions and animations globally. The GSAP ScrollTrigger animations will still fire, but they'll appear instant due to the CSS override.

For GSAP specifically, add at the top of any component using `useGSAP`:

```typescript
import { useReducedMotion } from "@/lib/use-reduced-motion";

const reducedMotion = useReducedMotion();

useGSAP(() => {
  if (reducedMotion) return; // Skip all GSAP animations
  // ... existing animation code
}, { scope: containerRef, dependencies: [reducedMotion] });
```

- [ ] **Step 3: Ensure hero degrades gracefully**

In `Hero.tsx`:

```tsx
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function Hero() {
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotion();

  // Even on desktop, use static hero if reduced motion
  if (reducedMotion) return <HeroMobile />;
  return isDesktop ? <HeroDesktop /> : <HeroMobile />;
}
```

- [ ] **Step 4: Add visible focus states**

Add to `globals.css`:

```css
/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-accent-orange);
  outline-offset: 2px;
  border-radius: var(--radius-cell);
}
```

- [ ] **Step 5: Verify and commit**

In macOS System Preferences → Accessibility → Display, enable "Reduce motion". Reload site:
- No scroll animations, no custom cursor, no particles
- Hero shows static layout
- All content still accessible and properly laid out
- Focus rings visible when tabbing through interactive elements

Commit:

```bash
git add -A
git commit -m "feat: prefers-reduced-motion support and keyboard focus states"
```

---

### Task 21: Static Export and GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Verify: `next.config.ts`

- [ ] **Step 1: Verify static export builds cleanly**

```bash
npm run build
```

Should produce `out/` directory with `index.html` and all static assets. No errors.

- [ ] **Step 2: Create GitHub Actions workflow for GitHub Pages**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: If using a custom domain or repo subpath, update next.config.ts**

If deploying to `https://username.github.io/portfolio-site-26/`:

```typescript
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/portfolio-site-26",
  images: {
    unoptimized: true,
  },
};
```

If deploying to a custom domain (e.g., `purdygood.me`), no `basePath` needed.

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "feat: GitHub Pages deployment workflow"
git push origin main
```

- [ ] **Step 5: Enable GitHub Pages in repo settings**

Go to repo Settings → Pages → Source: "GitHub Actions". The workflow will deploy on the next push to `main`.

- [ ] **Step 6: Verify deployment**

After the workflow completes, visit the GitHub Pages URL. Verify the site loads, fonts render, interactions work.

---

## Post-Launch Tasks (Future Iterations)

These are documented for completeness but are **not part of the initial build**:

- **Title glitch interaction** — letter-cells swap positions, strobe accent colors on direct hover (DESIGN.md Section 00, "On direct hover/interaction")
- **Idle-to-active dream state** — card desaturation after 2.5s hover, phosphorescent trail on reawaken (DESIGN.md Phosphorescent Trail #2)
- **Velocity easter egg** — full-viewport particle burst when cursor exceeds 800px/sec (DESIGN.md Phosphorescent Trail #5)
- **Device tilt parallax on mobile** — accelerometer-driven subtle shift on hero title and About photo (DESIGN.md Mobile Strategy)
- **Sidebar progressive disclosure** — section name typewriter on hover, name/logo decomposition on hover (DESIGN.md Layer 2)
- **Card hover video crossfade** — thumbnail → looping video on hover with light gradient (DESIGN.md Layer 2)
- **Cursor size scaling** — cursor grows over interactive elements, shrinks over text (DESIGN.md Layer 4)
- **Body text magnetic repulsion** — text blocks shift 1-2px away from cursor (DESIGN.md Layer 1)
- **Grid canvas idle breathing** — cells under resting cursor pulse gently (DESIGN.md Section 00)
- **Söhne font swap** — if Klim licensing succeeds, swap @font-face declarations
