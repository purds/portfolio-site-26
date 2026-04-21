"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Project } from "@/data/projects";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { useParticles } from "@/lib/particle-context";

gsap.registerPlugin(useGSAP);

interface ProjectCardProps {
  project: Project;
  accentColor: string;
  expanded: boolean;
  onToggle: () => void;
}

export function ProjectCard({ project, accentColor, expanded, onToggle }: ProjectCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const particlesRef = useParticles();
  const isAnimatingRef = useRef(false);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const isDesktop = useIsDesktop();
  const { contextSafe } = useGSAP({ scope: cardRef });
  const panelId = `project-panel-${project.id}`;

  const prevExpandedRef = useRef(false);

  useEffect(() => {
    return () => {
      animationRef.current?.kill();
      animationRef.current = null;
      isAnimatingRef.current = false;
    };
  }, []);

  // Handle external collapse (accordion)
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (prevExpandedRef.current && !expanded) {
      animationRef.current?.kill();
      isAnimatingRef.current = true;
      animationRef.current = gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "expo.out",
        onComplete: () => {
          gsap.set(content, { display: "none" });
          animationRef.current = null;
          isAnimatingRef.current = false;
        },
        onInterrupt: () => {
          animationRef.current = null;
          isAnimatingRef.current = false;
        },
      });
    }
    prevExpandedRef.current = expanded;
  }, [expanded]);

  const toggleExpand = contextSafe(() => {
    const content = contentRef.current;
    if (!content) return;
    if (isAnimatingRef.current) return;

    if (!expanded) {
      isAnimatingRef.current = true;
      gsap.set(content, { display: "block", height: "auto" });
      const fullHeight = content.offsetHeight;
      animationRef.current = gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: fullHeight,
          opacity: 1,
          duration: 0.5,
          ease: "expo.out",
          onComplete: () => {
            gsap.set(content, { height: "auto" });
            animationRef.current = null;
            isAnimatingRef.current = false;
          },
          onInterrupt: () => {
            animationRef.current = null;
            isAnimatingRef.current = false;
          },
        }
      );
      onToggle();

      // Particle burst on expand
      if (particlesRef?.current && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const color = accentColor;
        const emitter = particlesRef.current;
        emitter.emit(rect.left + rect.width / 2, rect.top, 6, {
          color, speed: 4, direction: -Math.PI / 2, spread: Math.PI * 0.6, decay: 0.025,
        });
        emitter.emit(rect.left + rect.width / 2, rect.bottom, 6, {
          color, speed: 4, direction: Math.PI / 2, spread: Math.PI * 0.6, decay: 0.025,
        });
        emitter.emit(rect.left, rect.top + rect.height / 2, 4, {
          color, speed: 3, direction: Math.PI, spread: Math.PI * 0.4, decay: 0.025,
        });
        emitter.emit(rect.right, rect.top + rect.height / 2, 4, {
          color, speed: 3, direction: 0, spread: Math.PI * 0.4, decay: 0.025,
        });
      }
    } else {
      isAnimatingRef.current = true;
      animationRef.current = gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "expo.out",
        onComplete: () => {
          gsap.set(content, { display: "none" });
          animationRef.current = null;
          isAnimatingRef.current = false;
        },
        onInterrupt: () => {
          animationRef.current = null;
          isAnimatingRef.current = false;
        },
      });
      onToggle();
    }
  });

  // Hover: tinted thumbnail fades in behind text (desktop only, not when expanded)
  const handleMouseEnter = () => {
    if (!isDesktop || !project.thumbnail || expanded) return;
    const thumb = thumbRef.current;
    if (!thumb) return;
    gsap.to(thumb, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" });
  };

  const handleMouseLeave = () => {
    if (!isDesktop || !project.thumbnail) return;
    const thumb = thumbRef.current;
    if (!thumb) return;
    gsap.to(thumb, { opacity: 0, y: 8, duration: 0.3, ease: "power2.in" });
  };

  return (
    <article
      ref={cardRef}
      className="relative overflow-hidden rounded-card"
      style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 8%, var(--color-bg-surface))` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Title / metadata bar — always visible */}
      <button
        onClick={toggleExpand}
        className="relative z-20 flex w-full items-center justify-between px-6 py-5 text-left"
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <div>
          <h3 className="font-display text-heading font-bold">
            {project.title}
          </h3>
          <span className="mt-1 block text-small text-text-secondary">
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

      {/* Thumbnail overlay — fades in behind text on hover, hidden when expanded */}
      {project.thumbnail && !expanded && (
        <div
          ref={thumbRef}
          className="pointer-events-none absolute inset-0 z-10"
          style={{ opacity: 0, transform: "translateY(8px)" }}
        >
          <img
            src={project.thumbnail}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Accent color tint */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: accentColor, opacity: 0.6, mixBlendMode: "multiply" }}
          />
        </div>
      )}

      {/* Expandable content */}
      <div
        id={panelId}
        role="region"
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
                className="rounded-card px-3 py-1 text-xs"
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
            <div className="aspect-video overflow-hidden rounded-[0.5rem] bg-bg-surface-raised">
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
}
