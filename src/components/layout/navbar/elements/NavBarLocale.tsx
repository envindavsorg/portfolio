"use client";

import { usePathname } from "next/navigation";

import { Button } from "@/components/primitives/Button";
import { accessibleName } from "@/lib/accessible-name";
import * as m from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";

import { NavBarTooltip } from "./NavBarTooltip";

export const NavBarLocale = () => {
  const pathname = usePathname();
  const locale = getLocale();
  const target = locale === "fr" ? "en" : "fr";
  const href =
    localizeHref(pathname, { locale: target }).replace(/\/$/u, "") ||
    "/";

  return (
    <NavBarTooltip label={m.locale_switcher_label()}>
      <Button asChild size="icon" variant="ghost">
        <a
          // le code de langue OUVRE le nom : c'est le seul texte affiché, donc
          // ce qu'on dicte pour activer le lien. En capitales comme à l'écran
          // — `uppercase` ne change que le rendu, pas le texte du document
          aria-label={accessibleName(
            target.toUpperCase(),
            m.locale_switcher_label()
          )}
          href={href}
          hrefLang={target}
        >
          <span className="font-medium text-xs uppercase">
            {target}
          </span>
        </a>
      </Button>
    </NavBarTooltip>
  );
};
