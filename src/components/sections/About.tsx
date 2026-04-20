"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/base-path";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const skillCategories = [
  {
    label: "Motion",
    skills: ["After Effects", "Cinema 4D", "Premiere Pro", "DaVinci Resolve"],
  },
  {
    label: "Design",
    skills: ["Figma", "Illustrator", "Photoshop"],
  },
];

export function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const selector = gsap.utils.selector(containerRef);
      gsap.from(selector("[data-animate]"), {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="mx-auto max-w-6xl px-6 py-24 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Photo */}
        <div
          data-animate
          className="relative aspect-[4/5] overflow-hidden rounded-card bg-bg-surface"
        >
          <img
            src={assetPath("/images/james-purdy.webp")}
            alt="James Purdy"
            width={800}
            height={1000}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <h2
            data-animate
            className="font-display text-display font-bold leading-tight"
          >
            A motion designer who builds things that move and things that think.
          </h2>

          <div
            data-animate
            className="prose-width mt-8 space-y-5 text-body text-text-secondary"
          >
            <p>
              I've spent the last decade making things move for brands,
              agencies, and studios (Google, IBM, VICE, D&AD, among others).
              My work lives at the intersection of motion design, editorial
              animation, and interactive experiences.
            </p>
            <p>
              I care about craft, concept, and the space between design and
              code. Based in Brooklyn (currently open to opportunities).
            </p>
          </div>

          {/* Skills */}
          <div data-animate className="mt-10 space-y-4">
            {skillCategories.map((cat) => (
              <div key={cat.label}>
                <span className="font-mono text-mono uppercase tracking-wider text-text-secondary">
                  ({cat.label})
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-bg-surface px-4 py-1.5 text-sm text-text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Resume download */}
          <div data-animate className="mt-10">
            <a
              href={assetPath("/james-purdy-resume.pdf")}
              download
              className="inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-2.5 text-sm font-medium text-bg-base transition-opacity hover:opacity-80"
            >
              Download Resume
              <span aria-hidden="true">&darr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
