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
          ratiosRef.current[entry.target.id] = entry.isIntersecting
            ? entry.intersectionRatio
            : 0;
        }

        let nextActiveId = activeIdRef.current;
        let nextRatio = 0;

        for (const id of sectionIds) {
          const ratio = ratiosRef.current[id] ?? 0;
          if (ratio > nextRatio) {
            nextRatio = ratio;
            nextActiveId = id;
          }
        }

        if (nextRatio > 0) {
          setActiveId(nextActiveId);
        }
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
