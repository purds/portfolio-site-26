"use client";

import { sections } from "@/data/sections";
import { MagneticTarget } from "@/components/cursor/MagneticTarget";

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
          <MagneticTarget
            key={section.id}
            config={{ strength: 0.4, radius: 100, tiltDeg: 0 }}
          >
            <button
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
          </MagneticTarget>
        );
      })}
    </nav>
  );
}
