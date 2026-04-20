"use client";

import { createContext, useContext } from "react";
import type { ParticleCanvasHandle } from "@/components/particles/ParticleCanvas";

export const ParticleContext = createContext<React.RefObject<ParticleCanvasHandle | null> | null>(null);

export function useParticles() {
  return useContext(ParticleContext);
}
