"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { sections } from "@/data/sections";
import { useParticles } from "@/lib/particle-context";

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

// Easing function — ease-out cubic for leading edge
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Easing function — ease-in-out quad for trailing edge (delayed feel)
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const particlesRef = useParticles();
  const prevSection = useRef(activeSection);
  const timeoutIdsRef = useRef<number[]>([]);

  // Pill refs
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Scroll-driven pill state
  const rafRef = useRef<number>(0);
  const sectionRectsRef = useRef<{ top: number; height: number }[]>([]);
  const confirmedColorRef = useRef(sections[0]?.accent ?? "#FF5F1F");
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  // Cache section element positions
  const measureSections = useCallback(() => {
    sectionRectsRef.current = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (!el) return { top: 0, height: 0 };
      return { top: el.offsetTop, height: el.offsetHeight };
    });
  }, []);

  // Scroll-driven pill positioning
  const updatePill = useCallback(() => {
    const pill = pillRef.current;
    if (!pill) return;

    const rects = sectionRectsRef.current;
    if (rects.length === 0) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const scrollCenter = scrollY + vh * 0.45;

    // Find which section the scroll center is in.
    // Use transitionInEnd (40% into each section) as the flip threshold so
    // currentIdx doesn't advance until the previous transition zone completes.
    let currentIdx = 0;
    for (let i = 1; i < rects.length; i++) {
      const transitionInEnd = rects[i].top + rects[i].height * 0.4;
      if (scrollCenter >= transitionInEnd) {
        currentIdx = i;
      }
    }

    // Calculate progress toward next section
    const current = rects[currentIdx];
    const nextIdx = Math.min(currentIdx + 1, rects.length - 1);
    const next = rects[nextIdx];

    let t = 0;
    if (currentIdx !== nextIdx && next.top > current.top) {
      // Start transitioning when we're in the last 40% of the current section
      const transitionStart = current.top + current.height * 0.6;
      // End when we're 40% into the next section
      const transitionEnd = next.top + next.height * 0.4;

      if (scrollCenter >= transitionStart && scrollCenter <= transitionEnd) {
        t = (scrollCenter - transitionStart) / (transitionEnd - transitionStart);
        t = clamp(t, 0, 1);
      } else if (scrollCenter > transitionEnd) {
        t = 1;
      }
    }

    // Get nav item positions
    const fromItem = itemRefs.current[currentIdx];
    const toItem = itemRefs.current[nextIdx];
    if (!fromItem || !toItem) return;

    const fromTop = fromItem.offsetTop;
    const fromBottom = fromItem.offsetTop + fromItem.offsetHeight;
    const toTop = toItem.offsetTop;
    const toBottom = toItem.offsetTop + toItem.offsetHeight;

    if (t === 0 || currentIdx === nextIdx) {
      // Fully on current section
      pill.style.top = `${fromTop}px`;
      pill.style.height = `${fromBottom - fromTop}px`;
    } else {
      // Leading edge moves ahead, trailing edge catches up
      // Both reach 1.0 when t=1.0 — no snap
      const leadingT = easeOutCubic(t);
      // Trailing lags behind but fully arrives at t=1
      const trailingRaw = clamp((t - 0.15) / 0.85, 0, 1);
      const trailingT = easeInOutQuad(trailingRaw);

      const movingDown = toTop > fromTop;

      let pillTopVal: number;
      let pillBottomVal: number;

      if (movingDown) {
        pillTopVal = lerp(fromTop, toTop, trailingT);
        pillBottomVal = lerp(fromBottom, toBottom, leadingT);
      } else {
        pillTopVal = lerp(fromTop, toTop, leadingT);
        pillBottomVal = lerp(fromBottom, toBottom, trailingT);
      }

      pill.style.top = `${pillTopVal}px`;
      pill.style.height = `${Math.max(pillBottomVal - pillTopVal, fromBottom - fromTop)}px`;
    }

    rafRef.current = requestAnimationFrame(updatePill);
  }, []);

  // Color transition on confirmed section change
  useEffect(() => {
    const idx = sections.findIndex((s) => s.id === activeSection);
    const accent = sections[idx]?.accent ?? "#FF5F1F";

    if (accent !== confirmedColorRef.current) {
      colorTweenRef.current?.kill();
      colorTweenRef.current = gsap.to(pillRef.current, {
        backgroundColor: accent,
        duration: 0.3,
        ease: "power2.inOut",
      });
      confirmedColorRef.current = accent;
    }
  }, [activeSection]);

  // Start scroll listener
  useEffect(() => {
    measureSections();

    // Set initial pill color
    const idx = sections.findIndex((s) => s.id === activeSection);
    const accent = sections[idx]?.accent ?? "#FF5F1F";
    if (pillRef.current) {
      pillRef.current.style.backgroundColor = accent;
    }
    confirmedColorRef.current = accent;

    rafRef.current = requestAnimationFrame(updatePill);

    const handleResize = () => {
      measureSections();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [measureSections, updatePill, activeSection]);

  // Particle streak effect on section change
  useEffect(() => {
    if (prevSection.current === activeSection) return;
    if (!particlesRef?.current) return;

    const prevIndex = sections.findIndex((s) => s.id === prevSection.current);
    const nextIndex = sections.findIndex((s) => s.id === activeSection);
    const prevAccent = sections[prevIndex]?.accent ?? "#FF5F1F";

    const sidebarX = 40;
    const tileGap = 48;
    const baseY = window.innerHeight / 2 - (sections.length * tileGap) / 2 + 80;
    const startY = baseY + prevIndex * tileGap;
    const endY = baseY + nextIndex * tileGap;

    const steps = 8;
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const y = startY + (endY - startY) * t;
      const timeoutId = window.setTimeout(() => {
        particlesRef.current?.emit(sidebarX, y, 2, {
          color: prevAccent,
          speed: 1,
          size: 5,
          decay: 0.03,
          spread: 0.5,
        });
      }, i * 50);
      timeoutIdsRef.current.push(timeoutId);
    }

    prevSection.current = activeSection;
    return () => {
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, [activeSection, particlesRef]);

  return (
    <nav
      className="fixed left-0 top-0 z-50 hidden h-screen w-[clamp(10rem,12vw,18rem)] flex-col justify-between px-6 py-8 lg:flex"
      aria-label="Section navigation"
    >
      {/* Name */}
      <div>
        <span className="font-display text-heading font-bold leading-none text-text-primary">
          James
          <br />
          Purdy
        </span>
      </div>

      {/* Section links */}
      <ul className="relative flex flex-col gap-1">
        {/* Scroll-driven pill indicator */}
        <div
          ref={pillRef}
          className="pointer-events-none absolute left-0 right-0 rounded-card"
        />

        {sections.map((section, index) => {
          const isActive = activeSection === section.id;

          return (
            <li
              key={section.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              className="relative z-10"
            >
              <button
                onClick={() => onNavigate(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
                className="flex w-full items-baseline gap-3 rounded-card px-3 py-2 text-left"
              >
                <span
                  className="font-display text-small font-bold"
                  style={{ color: isActive ? "#fff" : section.accent, transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                >
                  {section.number}
                </span>
                <span
                  className="text-small font-medium"
                  style={{
                    color: isActive ? "#fff" : "var(--color-text-secondary)",
                    transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {section.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Spacer for visual balance */}
      <div />
    </nav>
  );
}
