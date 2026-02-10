"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAVIGATION_DATA } from "../data";
import { isRouteActive } from "./functions";

export const NavBarMainMenu = () => {
  const pathname = usePathname();

  return (
    <nav className="ml-auto hidden items-center gap-x-4 sm:flex">
      {NAVIGATION_DATA.map(({ title, link }) => {
        const active = isRouteActive(link, pathname);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-sm transition-colors duration-300",
              active
                ? "font-bold text-theme"
                : "font-medium text-foreground hover:text-foreground",
            )}
            href={link}
            key={link}
          >
            {title}
          </Link>
        );
      })}
    </nav>
  );
};
