"use client";

import { useRef } from "react";

import { Rss } from "@/components/motion/Rss";
import { Button } from "@/components/primitives/Button";
import { rssFeedPath } from "@/lib/feed-path";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { NavBarTooltip } from "./NavBarTooltip";

export const NavBarRss = () => {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return (
    <NavBarTooltip label={m.nav_rss_aria()}>
      <Button
        asChild
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        size="icon"
        variant="outline"
      >
        {/* un `<a>` et non `next/link` : la cible est un gestionnaire de
            route, pas une page. `Link` la préchargeait sur chaque page vue,
            pour un onglet que presque personne n'ouvre. Sous /en, le flux
            anglais : le bouton ouvrait 22 éléments en français */}
        <a
          aria-label={m.nav_rss_aria()}
          href={rssFeedPath(getLocale())}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Rss ref={iconRef} />
          <span className="sr-only">{m.nav_rss_aria()}</span>
        </a>
      </Button>
    </NavBarTooltip>
  );
};
