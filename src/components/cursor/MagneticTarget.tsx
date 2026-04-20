"use client";

import { useRef, useEffect } from "react";
import { getMagneticOffset, type MagneticConfig } from "@/lib/magnetic";
import { useMouse } from "@/lib/use-mouse";

interface MagneticTargetProps {
  children: React.ReactNode;
  config?: Partial<MagneticConfig>;
  className?: string;
}

const defaultConfig: MagneticConfig = {
  strength: 0.3,
  radius: 200,
  tiltDeg: 8,
};

export function MagneticTarget({
  children,
  config: configOverrides,
  className,
}: MagneticTargetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useMouse();
  const config = { ...defaultConfig, ...configOverrides };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;

    function tick() {
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const { x, y, tiltX, tiltY } = getMagneticOffset(
        mouse.current.x,
        mouse.current.y,
        rect,
        config
      );

      el.style.transform = `translate3d(${x}px, ${y}px, 0) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouse, config]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
