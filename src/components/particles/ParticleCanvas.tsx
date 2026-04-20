"use client";

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ParticleEngine } from "@/lib/particles";

export interface ParticleCanvasHandle {
  emit: ParticleEngine["emit"];
}

export const ParticleCanvas = forwardRef<ParticleCanvasHandle>(
  function ParticleCanvas(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef(new ParticleEngine(50));

    useImperativeHandle(ref, () => ({
      emit: (...args) => engineRef.current.emit(...args),
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      let raf: number;

      function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas!.width = window.innerWidth * dpr;
        canvas!.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
      }

      resize();
      window.addEventListener("resize", resize);

      function tick() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        engineRef.current.update();
        engineRef.current.draw(ctx);
        raf = requestAnimationFrame(tick);
      }

      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[90] hidden lg:block"
        style={{ width: "100vw", height: "100vh" }}
      />
    );
  }
);
