"use client";

import { useIsDesktop } from "@/lib/use-is-desktop";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { HeroDesktop } from "./HeroDesktop";
import { HeroMobile } from "./HeroMobile";

export function Hero() {
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotion();

  // Even on desktop, use static hero if reduced motion
  if (reducedMotion) return <HeroMobile />;
  return isDesktop ? <HeroDesktop /> : <HeroMobile />;
}
