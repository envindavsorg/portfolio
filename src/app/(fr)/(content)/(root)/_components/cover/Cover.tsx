"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/primitives/Carousel";
import useGreetingsCarousel from "@/hooks/useGreetingsCarousel";
import useMediaQuery from "@/hooks/useMediaQuery";

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

  const { setApi, currentIndex, handleAnimationComplete, content } =
    useGreetingsCarousel(loop, !prefersReducedMotion);

  return (
    <Carousel opts={{ loop, watchDrag: false }} setApi={setApi}>
      <CarouselContent>
        {content.map(({ key, Component }, idx) => (
          // Même boîte pour les trois : « bonjour » fait 80/120 px de haut, les
          // deux autres 60/88. La fenêtre du carrousel changeait donc de
          // hauteur à chaque salutation — un décalage de mise en page toutes
          // les cinq secondes, et une réinitialisation d'embla par cycle.
          <CarouselItem className="h-20 sm:h-30" key={key}>
            {idx === currentIndex && (
              <Component
                capture={capture}
                key={capture ? "written" : "writing"}
                onAnimationComplete={handleAnimationComplete}
              />
            )}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
