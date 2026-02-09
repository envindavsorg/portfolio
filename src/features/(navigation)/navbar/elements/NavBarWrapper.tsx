"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";

export const NavBarWrapper = (props: ComponentProps<"header">) => {
  const { scrollY } = useScroll();
  const headerRef = useRef<HTMLHeadElement>(null);

  const updateAffix = (y: number) =>
    headerRef.current?.toggleAttribute("data-affix", y >= 8);

  useMotionValueEvent(scrollY, "change", updateAffix);

  useEffect(() => {
    updateAffix(scrollY.get());
  }, [scrollY]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full px-2 pt-2 overflow-x-hidden backdrop-blur-lg transition-all"
      {...props}
    />
  );
};
