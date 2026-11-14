"use client";

import { motion } from "motion/react";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
  [key: string]: unknown;
}

interface GlowDotsProps {
  id: string;
  width: number;
  height: number;
  cx: number;
  cy: number;
  cr: number;
}

/**
 * Un cercle Motion par point : le prix de `glow`, et de lui seul. Chaque point
 * y a son propre délai, ce qu'un motif SVG ne sait pas faire.
 */
const GlowDots = ({
  id,
  width,
  height,
  cx,
  cy,
  cr,
}: GlowDotsProps) => {
  const anchorRef = useRef<SVGDefsElement>(null);
  const [dimensions, setDimensions] = useState({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    const svg = anchorRef.current?.ownerSVGElement;
    if (!svg) {
      return;
    }

    const updateDimensions = () => {
      const rect = svg.getBoundingClientRect();
      setDimensions({ height: rect.height, width: rect.width });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () =>
      window.removeEventListener("resize", updateDimensions);
  }, []);

  const columns = Math.ceil(dimensions.width / width);
  const dots = Array.from(
    { length: columns * Math.ceil(dimensions.height / height) },
    (_, i) => ({
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
      x: (i % columns) * width + cx,
      y: Math.floor(i / columns) * height + cy,
    })
  );

  return (
    <>
      <defs ref={anchorRef}>
        <radialGradient id={`${id}-gradient`}>
          <stop
            offset="0%"
            stopColor="currentColor"
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor="currentColor"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>
      {dots.map((dot) => (
        <motion.circle
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.5, 1] }}
          cx={dot.x}
          cy={dot.y}
          fill={`url(#${id}-gradient)`}
          initial={{ opacity: 0.4, scale: 1 }}
          key={`${dot.x}-${dot.y}`}
          r={cr}
          transition={{
            delay: dot.delay,
            duration: dot.duration,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      ))}
    </>
  );
};

/**
 * Une grille de points, en TROIS nœuds.
 *
 * Elle montait un composant Motion par point, après avoir mesuré sa boîte dans
 * un effet : 922 cercles sur la page d'accueil, dont 768 pour la couverture —
 * un quart des nœuds de la page, créés après l'hydratation, la plupart cachés
 * par le masque radial. Aucun appelant ne passe `glow` : il n'y avait rien à
 * animer. Un `<pattern>` répète le même cercle au même endroit (origine,
 * pas et rayon identiques), sans mesure ni écouteur de redimensionnement, et il
 * est dans le HTML servi.
 */
export const DotPattern = ({
  width = 16,
  height = 16,
  x: _x = 0,
  y: _y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) => {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-muted-foreground/30",
        className
      )}
      {...props}
    >
      {glow ? (
        <GlowDots
          cr={cr}
          cx={cx}
          cy={cy}
          height={height}
          id={id}
          width={width}
        />
      ) : (
        <>
          <defs>
            <pattern
              height={height}
              id={id}
              patternUnits="userSpaceOnUse"
              width={width}
            >
              <circle cx={cx} cy={cy} fill="currentColor" r={cr} />
            </pattern>
          </defs>
          <rect fill={`url(#${id})`} height="100%" width="100%" />
        </>
      )}
    </svg>
  );
};
