"use client";

import { useRef, useEffect } from "react";

export interface MouseState {
  x: number;
  y: number;
  velocity: number;
}

export function useMouse(): React.RefObject<MouseState> {
  const state = useRef<MouseState>({ x: 0, y: 0, velocity: 0 });
  const prev = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const now = performance.now();
      const dt = now - prev.current.time;

      if (dt > 0) {
        const dx = e.clientX - prev.current.x;
        const dy = e.clientY - prev.current.y;
        state.current.velocity = Math.sqrt(dx * dx + dy * dy) / dt * 1000;
      }

      state.current.x = e.clientX;
      state.current.y = e.clientY;
      prev.current = { x: e.clientX, y: e.clientY, time: now };
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return state;
}
