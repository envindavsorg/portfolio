"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef } from "react";

export const NavBarWrapper = (props: ComponentProps<"header">) => {
  const { scrollY } = useScroll();
  const headerRef = useRef<HTMLHeadElement>(null);

  // stabilisé : la fonction ne lit qu'une ref, et elle est passée à DEUX hooks.
  // Recréée à chaque rendu, elle forçait à omettre la dépendance pour éviter que
  // l'effet ne se rejoue en boucle — omission que le linteur signalait à raison.
  const updateAffix = useCallback(
    (y: number) =>
      headerRef.current?.toggleAttribute("data-affix", y >= 8),
    []
  );

  useMotionValueEvent(scrollY, "change", updateAffix);

  useEffect(() => {
    updateAffix(scrollY.get());
  }, [scrollY, updateAffix]);

  return (
    <header
      // `data-affix` était posé au défilement sans qu'aucun style ne le lise :
      // le flou seul laissait titres et bannières transparaître sous les liens.
      // Le fond est `--canvas`, la couleur que la page peint réellement.
      // En clair il monte à 98 % : le lien actif (#306fdb) ne tient que
      // 4,75:1 sur le canevas, et sur une barre à 90 % posée sur du noir il
      // tombait à 3,81:1. Mesuré avec lib/contrast.ts, pire cas compris :
      // 97 % donne 4,43:1, 98 % donne 4,55:1. En sombre le pêche garde
      // 10,6:1 à 90 % sur du blanc, donc le flou y reste plus lisible.
      className="sticky top-0 z-50 w-full overflow-x-hidden px-2 pt-2 backdrop-blur-lg transition-colors duration-300 data-affix:bg-canvas/98 dark:data-affix:bg-canvas/90"
      ref={headerRef}
      {...props}
    />
  );
};
