"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react/jsx-dev-runtime";

import { Highlighter } from "@/components/blocks/Highlighter";
import { TextAnimate } from "@/components/blocks/TextAnimate";
import { cn } from "@/lib/utils";
import { localizeHref } from "@/paraglide/runtime";

import { NAVIGATION_DATA } from "../data";
import { isRouteActive } from "./functions";
import { useNavBar } from "./NavBarContext";

export const NavBarSecondaryMenu = () => {
  const pathname = usePathname();
  const { isSecondaryMenuOpen, closeSecondaryMenu } = useNavBar();

  if (!isSecondaryMenuOpen) {
    return null;
  }

  return (
    <nav className="relative border-edge border-x border-b backdrop-blur-lg">
      <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
        <div className="border-edge border-r" />
        <div className="border-edge border-l" />
      </div>

      <div className="grid grid-cols-4 divide-x divide-edge">
        {NAVIGATION_DATA.map(({ title, link }, idx) => {
          const href = localizeHref(link);
          const active = isRouteActive(href, pathname);
          const text: JSX.Element = (
            <TextAnimate
              animation="slideUp"
              as="p"
              by="word"
              delay={0.4 + idx * 0.1}
              segmentClassName={cn(
                "text-xs",
                active
                  ? "font-bold text-theme"
                  : "font-medium text-foreground"
              )}
            >
              {title()}
            </TextAnimate>
          );

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className="pointer-events-auto py-3 text-center"
              href={href}
              key={link}
              onClick={closeSecondaryMenu}
            >
              {active ? <Highlighter>{text}</Highlighter> : text}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
