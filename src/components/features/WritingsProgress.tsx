"use client";

import { useEffect, useState } from "react";

import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Barre de progression de lecture, collée sous la navbar.
 *
 * La position est lue dans un `requestAnimationFrame` (le handler de scroll ne
 * fait que poser un drapeau) pour ne pas provoquer de reflow synchrone à chaque
 * événement.
 */
export const WritingsProgress = () => {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  useEffect(() => {
    let frame = 0;
    let queued = false;

    const measure = () => {
      queued = false;
      const { scrollHeight, clientHeight } = document.documentElement;
      const scrollable = scrollHeight - clientHeight;

      // page trop courte pour défiler : la barre resterait bloquée à 0
      if (scrollable <= 0) {
        setProgress(100);
        return;
      }

      const ratio = (window.scrollY / scrollable) * 100;
      setProgress(Math.min(100, Math.max(0, ratio)));
    };

    const onScroll = () => {
      if (queued) {
        return;
      }
      queued = true;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    // purement décoratif : annoncer « 12 %… 13 %… » dans une live region
    // noierait un lecteur d'écran sans rien lui apprendre d'utile.
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-12 z-40 h-0.5"
      // aucune prise accessible sur un élément décoratif : ce `data-slot` est
      // le seul point d'accroche des tests de bout en bout
      data-slot="reading-progress"
    >
      <div
        className="h-full bg-theme"
        style={{
          transition: prefersReducedMotion
            ? undefined
            : "width 120ms linear",
          width: `${progress}%`,
        }}
      />
    </div>
  );
};
