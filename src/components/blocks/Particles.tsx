"use client";

import type { ISourceOptions } from "@tsparticles/engine";
import { useTheme } from "next-themes";
import { memo, useEffect, useMemo, useState } from "react";

import type { ParticlesEngine } from "@/components/providers/modules/ParticlesEngine";
import useMediaQuery from "@/hooks/useMediaQuery";

let Cached: typeof ParticlesEngine | null = null;

/**
 * Le fond n'est monté que là où il se VOIT.
 *
 * Sous 768 px la colonne occupe tout l'écran : il restait une dizaine de points
 * d'un pixel, dessinés entre les lignes du texte, pour un canevas plein écran
 * repeint soixante fois par seconde — 1170 × 2532 px de mémoire sur un
 * téléphone en DPR 3. À partir de 768 px les marges existent, et le fond avec.
 * La requête est suivie, pas lue une fois : un téléphone chargé en paysage puis
 * redressé garderait sinon son canevas.
 *
 * `e2e/budget.spec.ts` (`waitForBackdrop`) recopie cette condition : les deux
 * bougent ensemble.
 */
const BACKDROP_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

const hasSpareCores = (): boolean =>
  (navigator.hardwareConcurrency ?? 2) > 2;

/**
 * Plafond des particules, en multiple de la densité demandée.
 *
 * Chaque clic en pousse deux et `outModes: "out"` les recycle : elles ne
 * disparaissaient jamais. Après 300 clics, le script du canevas coûtait cinq
 * fois plus, et pour toujours. En mode `delete`, une particule poussée
 * au-delà du plafond remplace la plus ancienne. tsParticles multiplie ce
 * plafond par le même facteur de surface que `value`, d'où un multiple : en
 * dessous de 1, il réduirait le nombre de départ.
 */
const CLICK_HEADROOM = 3;

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
      limit: { mode: "delete", value: density * CLICK_HEADROOM },
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
  const isEligible = useMediaQuery(BACKDROP_QUERY);

  useEffect(() => {
    if (Cached || !(isEligible && hasSpareCores())) {
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
  }, [isEligible]);

  const options = useMemo(
    () =>
      buildOptions(
        density,
        resolvedTheme === "dark" ? "#fff" : "#000"
      ),
    [density, resolvedTheme]
  );

  if (!(isEligible && ready && Cached)) {
    return null;
  }

  const Engine = Cached;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 size-full overflow-hidden">
      <Engine options={options} />
    </div>
  );
});
