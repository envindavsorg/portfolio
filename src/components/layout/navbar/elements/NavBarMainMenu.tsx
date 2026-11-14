"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { localizeHref } from "@/paraglide/runtime";

import { NAVIGATION_DATA } from "../data";
import { isRouteActive } from "./functions";
import { NavBarIntentLink } from "./NavBarIntentLink";

export const NavBarMainMenu = () => {
  const pathname = usePathname();

  return (
    <nav className="ml-auto hidden items-center gap-x-4 sm:flex">
      {NAVIGATION_DATA.map(({ title, link }) => {
        const active = isRouteActive(link, pathname);
        // l'accueil est la seule cible que l'on ne précharge pas à
        // l'affichage : voir NavBarIntentLink
        const Component = link === "/" ? NavBarIntentLink : Link;
        return (
          <Component
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sm underline-offset-4 transition-colors duration-300",
              // `hover:text-foreground` sur un lien déjà `text-foreground` :
              // le survol ne changeait rien. Couleur ET soulignement, comme
              // la variante `link` de Button — la couleur seule ne se
              // distingue pas pour tout le monde
              active
                ? "font-bold text-theme"
                : "font-medium text-foreground hover:text-theme hover:underline"
            )}
            href={localizeHref(link)}
            key={link}
          >
            {title()}
          </Component>
        );
      })}
    </nav>
  );
};
