"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { sections } from "@/data/sections";

interface MobileNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const sectionRectsRef = useRef<{ top: number; height: number }[]>([]);
  const confirmedColorRef = useRef(sections[0]?.accent ?? "#FF5F1F");
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const settledIdxRef = useRef(0);

  // Which section the pill is fully resting on (drives label visibility)
  const [settledIdx, setSettledIdx] = useState(0);

  const measureSections = useCallback(() => {
    sectionRectsRef.current = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (!el) return { top: 0, height: 0 };
      return { top: el.offsetTop, height: el.offsetHeight };
    });
  }, []);

  // Scroll-driven horizontal pill positioning
  const updatePill = useCallback(() => {
    const pill = pillRef.current;
    if (!pill) return;

    const rects = sectionRectsRef.current;
    if (rects.length === 0) return;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const scrollCenter = scrollY + vh * 0.45;

    // Find current section — same logic as Sidebar
    let currentIdx = 0;
    for (let i = 1; i < rects.length; i++) {
      const transitionInEnd = rects[i].top + rects[i].height * 0.4;
      if (scrollCenter >= transitionInEnd) {
        currentIdx = i;
      }
    }

    const current = rects[currentIdx];
    const nextIdx = Math.min(currentIdx + 1, rects.length - 1);
    const next = rects[nextIdx];

    let t = 0;
    if (currentIdx !== nextIdx && next.top > current.top) {
      const transitionStart = current.top + current.height * 0.6;
      const transitionEnd = next.top + next.height * 0.4;

      if (scrollCenter >= transitionStart && scrollCenter <= transitionEnd) {
        t = (scrollCenter - transitionStart) / (transitionEnd - transitionStart);
        t = clamp(t, 0, 1);
      } else if (scrollCenter > transitionEnd) {
        t = 1;
      }
    }

    // Update settled index only when pill is fully resting
    if (t === 0 && currentIdx !== settledIdxRef.current) {
      settledIdxRef.current = currentIdx;
      setSettledIdx(currentIdx);
    }

    // Get nav item positions (horizontal)
    const fromItem = itemRefs.current[currentIdx];
    const toItem = itemRefs.current[nextIdx];
    if (!fromItem || !toItem) return;

    const fromLeft = fromItem.offsetLeft;
    const fromRight = fromItem.offsetLeft + fromItem.offsetWidth;
    const toLeft = toItem.offsetLeft;
    const toRight = toItem.offsetLeft + toItem.offsetWidth;

    if (t === 0 || currentIdx === nextIdx) {
      pill.style.left = `${fromLeft}px`;
      pill.style.width = `${fromRight - fromLeft}px`;
    } else {
      const leadingT = easeOutCubic(t);
      const trailingRaw = clamp((t - 0.15) / 0.85, 0, 1);
      const trailingT = easeInOutQuad(trailingRaw);

      const movingRight = toLeft > fromLeft;

      let pillLeftVal: number;
      let pillRightVal: number;

      if (movingRight) {
        pillLeftVal = lerp(fromLeft, toLeft, trailingT);
        pillRightVal = lerp(fromRight, toRight, leadingT);
      } else {
        pillLeftVal = lerp(fromLeft, toLeft, leadingT);
        pillRightVal = lerp(fromRight, toRight, trailingT);
      }

      pill.style.left = `${pillLeftVal}px`;
      const minWidth = Math.min(fromRight - fromLeft, toRight - toLeft);
      pill.style.width = `${Math.max(pillRightVal - pillLeftVal, minWidth)}px`;
    }

    rafRef.current = requestAnimationFrame(updatePill);
  }, []);

  // Color transition — driven by settled scroll position, not IntersectionObserver
  useEffect(() => {
    const accent = sections[settledIdx]?.accent ?? "#FF5F1F";

    if (accent !== confirmedColorRef.current) {
      colorTweenRef.current?.kill();
      colorTweenRef.current = gsap.to(pillRef.current, {
        backgroundColor: accent,
        duration: 0.3,
        ease: "power2.inOut",
      });
      confirmedColorRef.current = accent;
    }
  }, [settledIdx]);

  // Start scroll listener (once on mount + resize only)
  useEffect(() => {
    measureSections();

    const accent = sections[0]?.accent ?? "#FF5F1F";
    if (pillRef.current) {
      pillRef.current.style.backgroundColor = accent;
    }
    confirmedColorRef.current = accent;

    rafRef.current = requestAnimationFrame(updatePill);

    const handleResize = () => measureSections();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [measureSections, updatePill]);

  return (
    <nav
      className="fixed left-0 top-0 z-50 flex h-14 w-full items-center bg-bg-base/80 px-4 backdrop-blur-sm lg:hidden"
      aria-label="Section navigation"
    >
      <ul className="relative flex items-center gap-1.5">
        {/* Scroll-driven pill indicator */}
        <div
          ref={pillRef}
          className="pointer-events-none absolute top-0 h-full rounded-[0.5rem]"
        />

        {sections.map((section, index) => {
          const isSettled = settledIdx === index;

          return (
            <li
              key={section.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              className="relative z-10"
            >
              <button
                onClick={() => onNavigate(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={isSettled ? "true" : undefined}
                className="flex h-9 items-center gap-1.5 rounded-[0.5rem] px-2.5"
                style={{
                  border: isSettled ? "none" : `1.5px solid ${section.accent}40`,
                }}
              >
                <span
                  className="font-display text-xs font-bold"
                  style={{
                    color: isSettled ? "#fff" : section.accent,
                    transition: "color 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {section.number}
                </span>
                <span
                  className="overflow-hidden whitespace-nowrap text-xs font-medium"
                  style={{
                    color: "#fff",
                    maxWidth: isSettled ? "5rem" : "0px",
                    opacity: isSettled ? 1 : 0,
                    transition:
                      "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {section.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
