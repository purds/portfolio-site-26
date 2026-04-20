"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Hello } from "@/components/sections/Hello";
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
            {section.id === "hello" ? (
              <Hello />
            ) : (
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
            )}
          </section>
        ))}
      </main>
    </>
  );
}
