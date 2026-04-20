"use client";

import { useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Hero } from "@/components/sections/Hero";
import { Hello } from "@/components/sections/Hello";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { useActiveSection } from "@/lib/use-active-section";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { sections } from "@/data/sections";
import { CustomCursor } from "@/components/cursor/CustomCursor";

const sectionIds = sections.map((s) => s.id);

const sectionComponents: Record<string, React.ComponentType> = {
  hero: Hero,
  hello: Hello,
  work: Work,
  about: About,
  contact: Contact,
};

export default function Home() {
  const activeSection = useActiveSection(sectionIds);
  const isDesktop = useIsDesktop();

  const handleNavigate = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {isDesktop && <CustomCursor />}
      {isDesktop && (
        <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
      )}
      <StatusBar activeSection={activeSection} />

      <main className="lg:pl-20">
        {sections.map((section) => {
          const Component = sectionComponents[section.id];
          return (
            <section
              key={section.id}
              id={section.id}
              className="flex min-h-screen items-center justify-center"
            >
              {Component ? <Component /> : null}
            </section>
          );
        })}
      </main>
    </>
  );
}
