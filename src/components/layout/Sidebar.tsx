"use client";

import { useEffect, useRef } from "react";
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
      className="fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col items-center justify-center gap-3 lg:flex"
      aria-label="Section navigation"
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <MagneticTarget
            key={section.id}
            config={{ strength: 0.4, radius: 100, tiltDeg: 0 }}
          >
            <button
              onClick={() => onNavigate(section.id)}
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? "true" : undefined}
              className="group relative flex h-12 w-12 items-center justify-center rounded-[0.5rem] transition-transform"
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
          </MagneticTarget>
        );
      })}
    </nav>
  );
}
