"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sections } from "@/data/sections";
import { MagneticTarget } from "@/components/cursor/MagneticTarget";
import { useParticles } from "@/lib/particle-context";

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const particlesRef = useParticles();
  const prevSection = useRef(activeSection);
  const timeoutIdsRef = useRef<number[]>([]);

  // Dock-style scaling state
  const navRef = useRef<HTMLElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(sections.map(() => 1));
  const isHoveringNav = useRef(false);

  // Typeout state
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [displayedChars, setDisplayedChars] = useState(0);
  const typeIntervalRef = useRef<number | null>(null);
  const isErasing = useRef(false);

  const clearTypeInterval = useCallback(() => {
    if (typeIntervalRef.current !== null) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
  }, []);

  // Handle dock-style scaling on mouse move
  const handleNavMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    isHoveringNav.current = true;
    const navRect = navRef.current?.getBoundingClientRect();
    if (!navRect) return;

    const mouseY = e.clientY;
    const newScales = tileRefs.current.map((tileEl) => {
      if (!tileEl) return 1;
      const rect = tileEl.getBoundingClientRect();
      const tileCenterY = rect.top + rect.height / 2;
      const distance = mouseY - tileCenterY;
      const scale = 1 + 0.3 * Math.exp(-(distance * distance) / (2 * 60 * 60));
      return scale;
    });
    setScales(newScales);
  }, []);

  const handleNavMouseLeave = useCallback(() => {
    isHoveringNav.current = false;
    setScales(sections.map(() => 1));
  }, []);

  // Handle typeout on tile hover
  const handleTileHover = useCallback((sectionId: string) => {
    clearTypeInterval();
    isErasing.current = false;
    setHoveredSection(sectionId);
    setDisplayedChars(0);

    const label = sections.find((s) => s.id === sectionId)?.label ?? "";
    let chars = 0;
    typeIntervalRef.current = window.setInterval(() => {
      chars++;
      setDisplayedChars(chars);
      if (chars >= label.length) {
        clearTypeInterval();
      }
    }, 40);
  }, [clearTypeInterval]);

  const handleTileLeave = useCallback(() => {
    clearTypeInterval();
    isErasing.current = true;

    typeIntervalRef.current = window.setInterval(() => {
      setDisplayedChars((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 30);
  }, [clearTypeInterval]);

  // Clean up when erase animation finishes (side effects must not live inside updater)
  useEffect(() => {
    if (isErasing.current && displayedChars === 0) {
      clearTypeInterval();
      setHoveredSection(null);
      isErasing.current = false;
    }
  }, [displayedChars, clearTypeInterval]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      clearTypeInterval();
    };
  }, [clearTypeInterval]);

  // Particle streak effect on section change
  useEffect(() => {
    if (prevSection.current === activeSection) return;
    if (!particlesRef?.current) return;

    const prevIndex = sections.findIndex((s) => s.id === prevSection.current);
    const nextIndex = sections.findIndex((s) => s.id === activeSection);
    const prevAccent = sections[prevIndex]?.accent ?? "#FF5F1F";

    const sidebarX = 40;
    const tileGap = 60;
    const startY = window.innerHeight / 2 - (sections.length * tileGap) / 2 + prevIndex * tileGap;
    const endY = window.innerHeight / 2 - (sections.length * tileGap) / 2 + nextIndex * tileGap;

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
      ref={navRef}
      className="fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col items-center justify-center gap-3 lg:flex"
      aria-label="Section navigation"
      onMouseMove={handleNavMouseMove}
      onMouseLeave={handleNavMouseLeave}
    >
      {sections.map((section, index) => {
        const isActive = activeSection === section.id;
        const scale = scales[index] ?? 1;
        const isHovered = hoveredSection === section.id;
        const label = section.label;

        return (
          <div
            key={section.id}
            ref={(el) => { tileRefs.current[index] = el; }}
            className="relative"
            onMouseEnter={() => handleTileHover(section.id)}
            onMouseLeave={handleTileLeave}
          >
            <MagneticTarget
              config={{ strength: 0.4, radius: 100, tiltDeg: 0 }}
            >
              <button
                onClick={() => onNavigate(section.id)}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
                className="group relative flex h-12 w-12 items-center justify-center rounded-[0.5rem]"
                style={{
                  backgroundColor: isActive ? section.accent : "transparent",
                  border: isActive
                    ? "none"
                    : `1.5px solid ${section.accent}40`,
                  transform: `scale(${scale})`,
                  transition: isHoveringNav.current
                    ? "transform 0.05s ease-out"
                    : "transform 0.15s ease-out",
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
            </MagneticTarget>

            {/* Typeout label */}
            {isHovered && displayedChars > 0 && (
              <span
                className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap font-mono text-xs"
                style={{ color: section.accent }}
              >
                {label.slice(0, displayedChars)}
                <span className="animate-pulse">|</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
