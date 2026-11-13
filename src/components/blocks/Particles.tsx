"use client";

import type { ISourceOptions } from "@tsparticles/engine";
import { useTheme } from "next-themes";
import { memo, useEffect, useMemo, useState } from "react";

import type { ParticlesEngine } from "@/components/providers/modules/ParticlesEngine";

let Cached: typeof ParticlesEngine | null = null;

const canRender = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  return !reducedMotion && (navigator.hardwareConcurrency ?? 2) > 2;
};

const buildOptions = (
  density: number,
  color: string
): ISourceOptions => ({
  background: { color: { value: "transparent" } },
  detectRetina: true,
  fpsLimit: 60,
  fullScreen: false,
  interactivity: {
    events: { onClick: { enable: true, mode: "push" } },
    modes: { push: { quantity: 2 } },
  },
  particles: {
    move: {
      direction: "none",
      enable: true,
      outModes: { default: "out" },
      speed: { max: 1, min: 0.1 },
    },
    number: {
      density: { enable: true, height: 1080, width: 1920 },
      value: density,
    },
    opacity: {
      animation: { enable: true, speed: 2, startValue: "random" },
      value: { max: 1, min: 0.1 },
    },
    // `paint.color`, PAS `particles.color` : tsParticles 4 ne lit plus ce
    // dernier et retombe en silence sur du blanc. Le thème clair animait donc
    // un canevas plein écran de points blancs sur fond blanc — 0 pixel visible,
    // mesuré, contre 190 en sombre.
    paint: { color: { value: color } },
    shape: { type: "circle" },
    size: { value: { max: 1, min: 0.5 } },
  },
});

interface SparklesProps {
  density?: number;
}

export const Particles = memo(({ density = 50 }: SparklesProps) => {
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(!!Cached);

  useEffect(() => {
    if (Cached || !canRender()) {
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      // un seul import() : voir ParticlesEngine pour ce que coûtent plusieurs
      const engineModule = await import(
        "@/components/providers/modules/ParticlesEngine"
      );
      if (active) {
        Cached = engineModule.ParticlesEngine;
        setReady(true);
      }
    }, 1000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const options = useMemo(
    () =>
      buildOptions(
        density,
        resolvedTheme === "dark" ? "#fff" : "#000"
      ),
    [density, resolvedTheme]
  );

  if (!(ready && Cached)) {
    return null;
  }

  const Engine = Cached;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 size-full overflow-hidden">
      <Engine options={options} />
    </div>
  );
});
