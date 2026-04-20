"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProjectCard } from "./ProjectCard";
import { useIsDesktop } from "@/lib/use-is-desktop";
import type { Project } from "@/data/projects";
import type { WorkCategory } from "@/data/sections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface CategorySectionProps {
  category: WorkCategory;
  projects: Project[];
}

export function CategorySection({ category, projects }: CategorySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<Element>("[data-card]");
      if (cards.length === 0) return;

      cards.forEach((card, i) => {
        const fromLeft = i % 2 === 0;

        gsap.from(card, {
          x: isDesktop ? (fromLeft ? -60 : 60) : 0,
          y: 40,
          opacity: 0,
          rotation: isDesktop ? (fromLeft ? -3 : 3) : 0,
          duration: 0.7,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    },
    { scope: containerRef, dependencies: [isDesktop] }
  );

  if (projects.length === 0) return null;

  return (
    <div ref={containerRef} className="py-16" id={`category-${category.id}`}>
      <span
        className="font-mono text-mono uppercase tracking-wider"
        style={{ color: category.accent }}
      >
        ({category.number} — {category.label})
      </span>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {projects.map((project, i) => (
          <div
            key={project.id}
            data-card
            className={i % 2 === 1 ? "lg:mt-12" : ""}
          >
            <ProjectCard project={project} accentColor={category.accent} />
          </div>
        ))}
      </div>
    </div>
  );
}
