"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useMouse } from "@/lib/use-mouse";
import { sections } from "@/data/sections";
import { useActiveSection } from "@/lib/use-active-section";

const sectionIds = sections.map((s) => s.id);

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useMouse();
  const activeSection = useActiveSection(sectionIds);
  const accent =
    sections.find((s) => s.id === activeSection)?.accent ?? "#FF5F1F";

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Toggle cursor:none on body when custom cursor is active
    document.documentElement.classList.add("custom-cursor-active");

    let raf: number;
    // Initialize to current mouse so there's no jump from (0,0)
    const initX = mouse.current.x;
    const initY = mouse.current.y;
    const pos = { x: initX, y: initY };
    const dotPos = { x: initX, y: initY };
    let prevMouseX = initX;
    let prevMouseY = initY;
    let dotOpacity = 0;
    let hasReceivedMove = false;

    function tick() {
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Don't render until mouse has actually moved (avoid flash at 0,0)
      if (!hasReceivedMove) {
        if (mx !== initX || my !== initY) {
          hasReceivedMove = true;
          pos.x = mx;
          pos.y = my;
          dotPos.x = mx;
          dotPos.y = my;
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      // Lerp outline circle — slow lag
      pos.x += (mx - pos.x) * 0.15;
      pos.y += (my - pos.y) * 0.15;
      cursor!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      // Lerp dot — very slight smoothing, stays close to actual position
      dotPos.x += (mx - dotPos.x) * 0.65;
      dotPos.y += (my - dotPos.y) * 0.65;

      // Fade: appear on movement, fade on stop
      const moved = Math.abs(mx - prevMouseX) > 0.5 || Math.abs(my - prevMouseY) > 0.5;
      if (moved) {
        dotOpacity = Math.min(dotOpacity + 0.3, 1);
      } else {
        dotOpacity *= 0.88; // faster fade to avoid ghost dot lingering
      }
      prevMouseX = mx;
      prevMouseY = my;

      dot!.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
      dot!.style.opacity = String(dotOpacity < 0.02 ? 0 : dotOpacity);

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("custom-cursor-active");
    };
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
    <>
      {/* Lagging outline circle */}
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
      {/* Precise blue dot — tracks actual cursor, fades on stop */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden -translate-x-1/2 -translate-y-1/2 lg:block"
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: "#4A90D9",
          boxShadow: "0 0 4px 1px rgba(74, 144, 217, 0.6)",
          opacity: 0,
        }}
      />
    </>
  );
}
