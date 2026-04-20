"use client";

import { useRef, useEffect } from "react";
import { GridCanvas } from "@/lib/grid-canvas";
import { useMouse } from "@/lib/use-mouse";

export function HeroDesktop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<GridCanvas | null>(null);
  const mouse = useMouse();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const grid = new GridCanvas(canvas);
    gridRef.current = grid;

    // Load hidden image
    const img = new Image();
    img.src = "/images/hidden-layer.webp";
    img.onload = () => grid.setHiddenImage(img);

    grid.start();

    // Track mouse over canvas
    let raf: number;
    function trackMouse() {
      const rect = canvas!.getBoundingClientRect();
      const localX = mouse.current.x - rect.left;
      const localY = mouse.current.y - rect.top;

      if (
        localX >= 0 &&
        localY >= 0 &&
        localX <= rect.width &&
        localY <= rect.height
      ) {
        grid.activateAt(localX, localY, mouse.current.velocity);
      }

      raf = requestAnimationFrame(trackMouse);
    }
    raf = requestAnimationFrame(trackMouse);

    // Handle resize
    function onResize() {
      grid.resize();
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      grid.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [mouse]);

  return (
    <div className="relative flex min-h-screen items-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none" }}
      />
      <div className="relative z-10 px-16">
        <h1 className="font-display text-display-xl font-bold leading-none tracking-tight">
          PURDYGOOD
        </h1>
        <p className="mt-6 text-body text-text-secondary prose-width">
          Motion designer who thinks in systems and moves in stories.
        </p>
        <div className="mt-12 font-mono text-mono text-text-secondary">
          (scroll)
        </div>
      </div>
    </div>
  );
}
