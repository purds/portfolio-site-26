"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const clients = [
  { name: "Google", accent: "orange" },
  { name: "IBM", accent: "purple" },
  { name: "VICE", accent: "orange" },
  { name: "T-Mobile", accent: "purple" },
  { name: "D&AD", accent: "orange" },
  { name: "BESE", accent: "purple" },
  { name: "Propel", accent: "orange" },
] as const;

const accentClasses = {
  orange: "bg-accent-orange text-white",
  purple: "bg-accent-purple text-white",
} as const;

export function Hello() {
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
    <div
      ref={containerRef}
      className="mx-auto grid w-full max-w-6xl gap-16 px-6 py-32 md:grid-cols-[1.15fr_0.85fr] lg:px-16"
    >
      <div>
        <h2
          data-animate
          className="font-display text-display leading-none tracking-tight" style={{ fontWeight: 900 }}
        >
          Motion design that moves people, not just pixels.
        </h2>
        <div
          data-animate
          className="prose-width mt-8 space-y-6 text-body text-text-secondary"
        >
          <p>
            Based in Brooklyn (by way of everywhere). I make things move with
            purpose — explainer videos, brand films, editorial animation,
            product demos, and the occasional VJ set.
          </p>
          <p>
            Currently seeking full-time and freelance opportunities
            (preferably with people who care about craft).
          </p>
        </div>
      </div>
      <div data-animate className="flex items-end">
        <div>
          <span className="text-small font-medium uppercase tracking-wider text-text-secondary">
            (Selected clients)
          </span>
          <ul className="mt-4 flex flex-wrap gap-2">
            {clients.map((client) => (
              <li
                key={client.name}
                className={`rounded-card px-4 py-1.5 text-sm font-medium ${accentClasses[client.accent]}`}
              >
                {client.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
