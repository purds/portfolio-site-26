"use client";

import { useIsDesktop } from "@/lib/use-is-desktop";
import { HeroDesktop } from "./HeroDesktop";
import { HeroMobile } from "./HeroMobile";

export function Hero() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <HeroDesktop /> : <HeroMobile />;
}
