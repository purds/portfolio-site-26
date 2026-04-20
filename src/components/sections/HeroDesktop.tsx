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

    // Initialize grid-integrated title
    grid.initTitle("PURDYGOOD");

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
        grid.setMousePosition(localX, localY);
      }

      raf = requestAnimationFrame(trackMouse);
    }
    raf = requestAnimationFrame(trackMouse);

    // Selection event handlers
    let isDragging = false;

    function onMouseDown(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      isDragging = true;
      grid.startSelection(e.clientX - rect.left, e.clientY - rect.top);
    }

    function onMouseMoveSelection(e: MouseEvent) {
      if (isDragging) {
        const rect = canvas!.getBoundingClientRect();
        grid.updateSelection(e.clientX - rect.left, e.clientY - rect.top);
      }
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        grid.endSelection();
      }
    }

    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      grid.clickSelection(e.clientX - rect.left, e.clientY - rect.top);
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMoveSelection);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("click", onClick);

    // Handle resize
    function onResize() {
      grid.resize();
      grid.initTitle("PURDYGOOD");
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      grid.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMoveSelection);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("click", onClick);
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
        <h1 className="sr-only">PURDYGOOD</h1>
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
