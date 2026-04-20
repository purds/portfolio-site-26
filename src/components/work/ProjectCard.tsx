"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Project } from "@/data/projects";
import { MagneticTarget } from "@/components/cursor/MagneticTarget";
import { useIsDesktop } from "@/lib/use-is-desktop";

gsap.registerPlugin(useGSAP);

interface ProjectCardProps {
  project: Project;
  accentColor: string;
}

export function ProjectCard({ project, accentColor }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();

  const { contextSafe } = useGSAP({ scope: cardRef });

  const toggleExpand = contextSafe(() => {
    const content = contentRef.current;
    if (!content) return;

    if (!expanded) {
      // Expand: set to auto height with GSAP
      gsap.set(content, { display: "block", height: "auto" });
      const fullHeight = content.offsetHeight;
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: fullHeight,
          opacity: 1,
          duration: 0.5,
          ease: "expo.out",
          onComplete: () => gsap.set(content, { height: "auto" }),
        }
      );
      setExpanded(true);
    } else {
      // Contract
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "expo.out",
        onComplete: () => {
          gsap.set(content, { display: "none" });
          setExpanded(false);
        },
      });
    }
  });

  const card = (
    <article ref={cardRef} className="overflow-hidden rounded-card bg-bg-surface">
      <button
        onClick={toggleExpand}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        aria-expanded={expanded}
      >
        <div>
          <h3 className="font-display text-heading font-bold">
            {project.title}
          </h3>
          <span className="mt-1 block font-mono text-mono text-text-secondary">
            {project.client} — {project.year}
          </span>
        </div>
        <span
          className="text-lg transition-transform"
          style={{
            color: accentColor,
            transform: expanded ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>

      <div className="relative aspect-video bg-bg-surface-raised">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={`${project.title} — ${project.client}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-secondary">
            <span className="font-mono text-mono">{project.client}</span>
          </div>
        )}
      </div>

      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ display: "none", height: 0 }}
      >
        <div className="space-y-4 px-6 py-6">
          <p className="text-body text-text-secondary">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span>
              <strong className="text-text-primary">Role:</strong>{" "}
              {project.role}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {tool}
              </span>
            ))}
          </div>
          {project.video && (
            <div className="aspect-video overflow-hidden rounded-radius-cell bg-bg-surface-raised">
              <video
                src={project.video}
                controls
                preload="none"
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );

  return isDesktop ? (
    <MagneticTarget config={{ strength: 0.15, radius: 250, tiltDeg: 5 }}>
      {card}
    </MagneticTarget>
  ) : (
    card
  );
}
