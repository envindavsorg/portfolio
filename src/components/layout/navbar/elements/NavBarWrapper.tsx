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
      className="sticky top-0 z-50 w-full overflow-x-hidden px-2 pt-2 backdrop-blur-lg transition-all"
      ref={headerRef}
      {...props}
    />
  );
};
