"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { GridCanvas } from "@/lib/grid-canvas";
import { useMouse } from "@/lib/use-mouse";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { assetPath } from "@/lib/base-path";

function clamp(n: number, lo: number, hi: number) {
  return n < lo ? lo : n > hi ? hi : n;
}

export function HeroDesktop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const fpsOverlayRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridCanvas | null>(null);
  const mouse = useMouse();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const heroContainer = heroContainerRef.current;
    if (!canvas || !heroContainer) return;

    const grid = new GridCanvas(canvas);
    gridRef.current = grid;

    const img = new Image();
    img.src = assetPath("/images/hidden-layer.webp");
    img.onload = () => grid.setHiddenImage(img);

    grid.initTitle(["PURDY", "GOOD"]);
    grid.start();

    const introObj = { yaw: reducedMotion ? 0 : Math.PI * 4 };
    let introTween: gsap.core.Tween | null = null;
    if (!reducedMotion) {
      introTween = gsap.to(introObj, {
        yaw: 0,
        duration: 1.5,
        ease: "power3.out",
      });
    }

    const showFps =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("fps") === "1");
    let fpsEma = 60;
    let lastFrameTime = performance.now();

    let raf: number;
    function tick() {
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;
      if (dt > 0) {
        const instantFps = 1000 / dt;
        fpsEma = fpsEma * (29 / 30) + instantFps * (1 / 30);
      }

      const rect = canvas!.getBoundingClientRect();
      const localX = mouse.current.x - rect.left;
      const localY = mouse.current.y - rect.top;
      const inside =
        localX >= 0 &&
        localY >= 0 &&
        localX <= rect.width &&
        localY <= rect.height;

      if (inside) {
        grid.activateAt(localX, localY, mouse.current.velocity);
        grid.setMousePosition(localX, localY);
      }

      const heroRect = heroContainer!.getBoundingClientRect();
      const scrollProgress = clamp(
        -heroRect.top / Math.max(heroRect.height, 1),
        0,
        1
      );

      grid.setTitleInputs({
        mouseX: inside ? localX : null,
        mouseY: inside ? localY : null,
        scrollProgress,
        introYaw: introObj.yaw,
      });

      if (showFps && fpsOverlayRef.current) {
        fpsOverlayRef.current.textContent = `${fpsEma.toFixed(1)} fps`;
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) grid.resumeLoop();
        else grid.pauseLoop();
      },
      { threshold: 0 }
    );
    observer.observe(heroContainer);

    const DRAG_THRESHOLD_PX = 4;
    let isDragging = false;
    let dragStart: { x: number; y: number } | null = null;
    let dragCurrent: { x: number; y: number } | null = null;
    let suppressNextClick = false;

    function onMouseDown(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      isDragging = true;
      dragStart = { x: localX, y: localY };
      dragCurrent = { x: localX, y: localY };
      grid.startSelection(localX, localY);
    }

    function onMouseMoveSelection(e: MouseEvent) {
      if (isDragging) {
        const rect = canvas!.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        dragCurrent = { x: localX, y: localY };
        grid.updateSelection(localX, localY);
      }
    }

    function onMouseUp() {
      if (!isDragging) return;
      const didDrag =
        dragStart !== null &&
        dragCurrent !== null &&
        (Math.abs(dragCurrent.x - dragStart.x) > DRAG_THRESHOLD_PX ||
          Math.abs(dragCurrent.y - dragStart.y) > DRAG_THRESHOLD_PX);
      isDragging = false;
      dragStart = null;
      dragCurrent = null;
      grid.endSelection(didDrag);
      if (didDrag) suppressNextClick = true;
    }

    function onClick(e: MouseEvent) {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      const rect = canvas!.getBoundingClientRect();
      grid.clickSelection(e.clientX - rect.left, e.clientY - rect.top);
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMoveSelection);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("click", onClick);

    function onResize() {
      grid.resize();
      grid.initTitle(["PURDY", "GOOD"]);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      introTween?.kill();
      observer.disconnect();
      grid.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMoveSelection);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("click", onClick);
    };
  }, [mouse, reducedMotion]);

  const showFpsOverlay =
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("fps") === "1");

  return (
    <div
      ref={heroContainerRef}
      className="relative w-full min-h-screen overflow-hidden lg:-ml-[clamp(10rem,12vw,18rem)] lg:w-[calc(100%+clamp(10rem,12vw,18rem))]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none" }}
      />
      <h1 className="sr-only">PURDYGOOD</h1>
      <div className="absolute bottom-16 left-24 z-10">
        <p className="text-body text-text-secondary prose-width">
          Motion designer who thinks in systems and moves in stories.
        </p>
      </div>
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-small text-text-secondary">
        (scroll)
      </div>
      {showFpsOverlay && (
        <div
          ref={fpsOverlayRef}
          className="absolute top-2 right-2 z-20 rounded bg-black/60 px-2 py-1 text-xs font-mono text-white"
        >
          -- fps
        </div>
      )}
    </div>
  );
}
