"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { memo } from "react";

const isRouteActive = (href: string, pathname: string | null): boolean => {
  const path = pathname ?? "";

  if (path === href) {
    return true;
  }

  if (href === "/") {
    return false;
  }

  return path.startsWith(`${href}/`);
};

interface NavBarLinkProps {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
  className?: string;
}

export const NavBarLink = memo(
  ({ href, label, pathname, onClick, className }: NavBarLinkProps) => {
    const active = isRouteActive(href, pathname);

    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={cn(
          "text-xs sm:text-sm transition-colors duration-300 max-sm:text-center",
          active
            ? "text-theme font-bold"
            : "text-muted-foreground hover:text-foreground font-medium",
          className,
        )}
        href={href}
        onClick={onClick}
      >
        {label}
      </Link>
    );
  },
);
