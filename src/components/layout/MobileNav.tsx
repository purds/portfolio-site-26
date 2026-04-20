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
            className="flex h-9 w-9 items-center justify-center rounded-[0.5rem]"
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
