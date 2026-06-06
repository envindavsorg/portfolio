"use client";

import { usePathname } from "next/navigation";

import { Button } from "@/components/primitives/Button";
import { m } from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";

export const NavBarLocale = () => {
  const pathname = usePathname();
  const locale = getLocale();
  const target = locale === "fr" ? "en" : "fr";
  const href =
    localizeHref(pathname, { locale: target }).replace(/\/$/u, "") ||
    "/";

  return (
    <Button asChild size="icon" variant="outline">
      <a
        aria-label={m.locale_switcher_label()}
        href={href}
        hrefLang={target}
      >
        <span className="font-medium text-xs uppercase">
          {target}
        </span>
        <span className="sr-only">{m.locale_switcher_label()}</span>
      </a>
    </Button>
  );
};
