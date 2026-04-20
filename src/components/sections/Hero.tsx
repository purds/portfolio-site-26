"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { HeroDesktop } from "./HeroDesktop";
import { HeroMobile } from "./HeroMobile";

export function Hero() {
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Even on desktop, use static hero if reduced motion
  if (reducedMotion) return <HeroMobile />;
  return isDesktop ? <HeroDesktop /> : <HeroMobile />;
}
