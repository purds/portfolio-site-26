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
    <div ref={containerRef} className="mx-auto w-full max-w-6xl px-6 py-32 lg:px-16">
      <div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr] lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Photo */}
        <div
          data-animate
          className="relative h-80 overflow-hidden rounded-card bg-bg-surface md:h-auto md:aspect-[4/5]"
        >
          <img
            src={assetPath("/images/james-purdy.webp")}
            alt="James Purdy"
            width={800}
            height={1000}
            className="h-full w-full object-cover object-[center_25%]"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <h2
            data-animate
            className="font-display text-display leading-none tracking-tight" style={{ fontWeight: 900 }}
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

          {/* Skills — single accent block with columns */}
          <div
            data-animate
            className="mt-10 grid grid-cols-2 gap-8 rounded-card bg-accent-purple px-6 py-6"
          >
            {skillCategories.map((cat) => (
              <div key={cat.label}>
                <span className="text-small font-medium uppercase tracking-wider text-white/70">
                  {cat.label}
                </span>
                <ul className="mt-3 space-y-1.5">
                  {cat.skills.map((skill) => (
                    <li key={skill} className="text-sm font-medium text-white">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Resume download */}
          <div data-animate className="mt-10">
            <a
              href={assetPath("/james-purdy-resume.pdf")}
              download
              className="inline-flex items-center gap-2 rounded-card border-2 border-accent-orange px-6 py-2.5 text-sm font-medium text-accent-orange transition-colors hover:bg-accent-orange hover:text-white"
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
