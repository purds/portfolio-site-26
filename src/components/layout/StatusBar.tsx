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
