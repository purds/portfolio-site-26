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
