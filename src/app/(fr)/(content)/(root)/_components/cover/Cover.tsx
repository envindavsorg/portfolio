"use client";

import type { KeyboardEvent } from "react";
import { useRef } from "react";

import { DotPattern } from "@/components/blocks/DotPattern";
import { ArrowLeft } from "@/components/motion/ArrowLeft";
import { ArrowRight } from "@/components/motion/ArrowRight";
import { Button } from "@/components/primitives/Button";
import useGreetingsCarousel from "@/hooks/useGreetingsCarousel";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";

interface CoverArrowProps {
  className: string;
  disabled: boolean;
  icon: typeof ArrowLeft;
  label: string;
  onClick: () => void;
}

const CoverArrow = ({
  className,
  disabled,
  icon: Icon,
  label,
  onClick,
}: CoverArrowProps) => {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      size="icon"
      variant="outline"
    >
      <Icon ref={iconRef} />
      <span className="sr-only">{label}</span>
    </Button>
  );
};

interface CoverProps {
  loop?: boolean;
}

export const Cover = ({ loop = true }: CoverProps) => {
  /**
   * Sous mouvement réduit, la salutation est posée DÉJÀ ÉCRITE et ne défile
   * plus toute seule ; les boutons restent.
   *
   * `MotionConfig reducedMotion="user"` ne couvre pas `pathLength` : le tracé
   * et l'enchaînement tournaient donc à l'identique chez qui avait demandé
   * moins d'animations (mêmes 250 mises en page par fenêtre de cinq secondes,
   * mesurées avec et sans la préférence).
   *
   * La préférence est lue APRÈS le montage — `useMediaQuery` vaut `false` au
   * rendu serveur comme au premier rendu client, donc l'hydratation ne voit
   * aucun écart. La clé remonte la salutation : `initial` n'est lu qu'au
   * montage, un tracé déjà parti continuerait.
   */
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );
  const capture =
    process.env.ENV_TYPE === "capture" || prefersReducedMotion;

  const {
    boxRef,
    canNext,
    canPrevious,
    greeting,
    handleAnimationComplete,
    next,
    previous,
  } = useGreetingsCarousel(loop, !prefersReducedMotion);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  const { Component } = greeting;

  return (
    <div
      className={cn(
        "relative flex size-full select-none flex-col items-center justify-center",
        "aspect-2/1 border-edge border-x text-foreground before:-top-px after:-bottom-px sm:aspect-3/1"
      )}
      onKeyDownCapture={handleKeyDown}
    >
      <DotPattern className="mask-[radial-gradient(100px_circle_at_center,white,transparent)] sm:mask-[radial-gradient(300px_circle_at_center,white,transparent)]" />
      {/* Même boîte pour les trois : « bonjour » fait 80/120 px de haut, les
        deux autres 60/88. C'est elle que le crochet observe pour savoir si la
        salutation est à l'écran. */}
      <div
        className="flex h-20 items-center justify-center sm:h-30"
        ref={boxRef}
      >
        <Component
          capture={capture}
          key={`${greeting.key}-${capture ? "written" : "writing"}`}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>
      <CoverArrow
        className="absolute right-12 bottom-2 sm:bottom-4"
        disabled={!canPrevious}
        icon={ArrowLeft}
        label={m.home_cover_previous_button()}
        onClick={previous}
      />
      <CoverArrow
        className="absolute right-2 bottom-2 sm:bottom-4"
        disabled={!canNext}
        icon={ArrowRight}
        label={m.home_cover_next_button()}
        onClick={next}
      />
    </div>
  );
};
