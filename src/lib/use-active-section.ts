"use client";

import { useEffect, useRef, useState } from "react";

export function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const activeIdRef = useRef(activeId);
  const ratiosRef = useRef<Record<string, number>>({});

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    ratiosRef.current = {};
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Use pixel coverage instead of ratio — ratio penalizes tall sections
          ratiosRef.current[entry.target.id] = entry.isIntersecting
            ? entry.intersectionRect.height
            : 0;
        }

        let nextActiveId = activeIdRef.current;
        let nextPixels = 0;

        for (const id of sectionIds) {
          const pixels = ratiosRef.current[id] ?? 0;
          if (pixels > nextPixels) {
            nextPixels = pixels;
            nextActiveId = id;
          }
        }

        if (nextPixels > 0) {
          setActiveId(nextActiveId);
        }
      },
      { threshold: [0, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
