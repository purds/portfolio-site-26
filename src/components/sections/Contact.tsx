"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const links = [
  { label: "LinkedIn", action: "connect", href: "https://linkedin.com/in/jamespurdy" },
  { label: "Vimeo", action: "watch", href: "https://vimeo.com/purdygood" },
  { label: "GitHub", action: "build", href: "https://github.com/purdygoo" },
];

export function Contact() {
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
      className="-mx-6 bg-text-primary px-6 lg:-mx-16 lg:px-16"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-start py-32">
        <h2 data-animate className="font-display text-display-xl text-bg-base tracking-tight" style={{ fontWeight: 900 }}>
          Say hello.
        </h2>

        <a
          data-animate
          href="mailto:james@purdygood.me"
          className="mt-10 font-display text-display text-bg-base tracking-tight transition-colors hover:text-accent-orange" style={{ fontWeight: 900 }}
        >
          james@purdygood.me
        </a>

        <p data-animate className="mt-8 text-body text-bg-base/60">
          Currently available for motion design roles and select freelance
          projects.
        </p>

        <div data-animate className="mt-12 flex flex-wrap gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-white/20 px-6 py-3 text-body font-medium text-bg-base transition-colors hover:bg-bg-base hover:text-text-primary"
            >
              {link.label}{" "}
              <span className="opacity-60">({link.action})</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
