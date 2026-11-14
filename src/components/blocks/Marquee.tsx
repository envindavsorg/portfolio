"use client";

import type { HTMLAttributes } from "react";
import { memo } from "react";
import type { MarqueeProps as FastMarqueeProps } from "react-fast-marquee";
import FastMarquee from "react-fast-marquee";

import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * `min-h-12` réserve la rangée AVANT que la bibliothèque ne monte.
 *
 * react-fast-marquee ne rend rien côté serveur : la bande faisait 0 px dans le
 * HTML servi, puis 48 px (la taille d'un `MarqueeItem`) une fois hydratée. Avec
 * deux rangées, la section « stack » grandissait de 96 px et poussait tout ce
 * qui suit — sur un lien direct vers `/#my-experiences`, la section visée
 * finissait 88 px plus bas que là où le navigateur avait défilé (CLS 0,111 sur
 * un profil de téléphone, le seul au-dessus de 0,1).
 */
export const Marquee = memo(
  ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        "relative min-h-12 w-full overflow-hidden",
        className
      )}
      {...props}
    />
  )
);

export const MarqueeContent = ({
  loop = 0,
  autoFill = true,
  pauseOnHover = true,
  pauseOnClick = true,
  play = true,
  ...props
}: FastMarqueeProps) => {
  // WCAG 2.2.2 : un mouvement automatique de plus de cinq secondes doit pouvoir
  // être arrêté. `pauseOnHover` ne sert qu'à la souris, d'où l'arrêt complet
  // quand le visiteur demande moins d'animations, et `pauseOnClick` au toucher.
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  return (
    <FastMarquee
      autoFill={autoFill}
      loop={loop}
      pauseOnClick={pauseOnClick}
      pauseOnHover={pauseOnHover}
      play={play && !prefersReducedMotion}
      {...props}
    />
  );
};

export const MarqueeFade = ({
  className,
  side,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  side: "left" | "right";
}) => (
  <div
    className={cn(
      "absolute top-0 bottom-0 z-10 h-full w-24 from-background to-transparent",
      side === "left"
        ? "left-0 bg-linear-to-r"
        : "right-0 bg-linear-to-l",
      className
    )}
    {...props}
  />
);

export const MarqueeItem = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mx-2 shrink-0 object-contain",
      "flex size-12 shrink-0 items-center justify-center",
      "rounded-lg border border-muted-foreground/15 bg-muted",
      "ring-1 ring-edge ring-offset-1 ring-offset-background",
      "[&_svg]:size-6 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
);
