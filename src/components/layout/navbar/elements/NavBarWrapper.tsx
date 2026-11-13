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
      // Le fond est `--canvas`, la couleur que la page peint réellement, et à
      // 90 % plutôt que 80 : le lien actif ne tient que 4,75:1 sur le canevas
      // clair, il n'a presque aucune marge à céder à ce qui défile dessous.
      className="sticky top-0 z-50 w-full overflow-x-hidden px-2 pt-2 backdrop-blur-lg transition-colors duration-300 data-affix:bg-canvas/90"
      ref={headerRef}
      {...props}
    />
  );
};
