"use client";

import { useCallback, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
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
import { ParticleCanvas } from "@/components/particles/ParticleCanvas";
import type { ParticleCanvasHandle } from "@/components/particles/ParticleCanvas";
import { ParticleContext } from "@/lib/particle-context";

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
  const particlesRef = useRef<ParticleCanvasHandle>(null);

  const handleNavigate = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {isDesktop && <CustomCursor />}
      {isDesktop ? (
        <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
      ) : (
        <MobileNav activeSection={activeSection} onNavigate={handleNavigate} />
      )}
      <StatusBar activeSection={activeSection} />
      {isDesktop && <ParticleCanvas ref={particlesRef} />}

      <ParticleContext.Provider value={particlesRef}>
      <main className="pt-14 lg:pl-20 lg:pt-0">
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
      </ParticleContext.Provider>
    </>
  );
}
