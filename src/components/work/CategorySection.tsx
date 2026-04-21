"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/data/projects";
import type { WorkCategory } from "@/data/sections";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface CategorySectionProps {
  category: WorkCategory;
  projects: Project[];
}

export function CategorySection({ category, projects }: CategorySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<Element>("[data-card]");
      if (cards.length === 0) return;

      cards.forEach((card) => {
        gsap.from(card, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    },
    { scope: containerRef }
  );

  if (projects.length === 0) return null;

  return (
    <div ref={containerRef} className="py-16" id={`category-${category.id}`}>
      <div
        className="rounded-card px-6 py-4"
        style={{ backgroundColor: category.accent }}
      >
        <span className="font-display text-heading font-bold text-white">
          {category.number} — {category.label}
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {projects.map((project) => (
          <div key={project.id} data-card>
            <ProjectCard
              project={project}
              accentColor={category.accent}
              expanded={expandedId === project.id}
              onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
