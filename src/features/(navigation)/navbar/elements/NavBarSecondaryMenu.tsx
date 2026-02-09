"use client";

import { usePathname } from "next/navigation";
import { useNavBar } from "./NavBarContext";
import { NavBarLink } from "./NavBarLink";
import { NAVIGATION_DATA } from "../data";

export const NavBarSecondaryMenu = () => {
  const pathname = usePathname();
  const { isSecondaryMenuOpen, closeSecondaryMenu } = useNavBar();

  if (!isSecondaryMenuOpen) {
    return null;
  }

  return (
    <nav className="relative py-3 border-edge border-x border-b bg-background">
      <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
        <div className="border-edge border-r" />
        <div className="border-edge border-l" />
      </div>

      <div className="grid grid-cols-4">
        {NAVIGATION_DATA.map(({ title, link }) => (
          <NavBarLink
            href={link}
            key={link}
            label={title}
            pathname={pathname}
            onClick={closeSecondaryMenu}
          />
        ))}
      </div>
    </nav>
  );
};

/*
className={cn(
  "",
  "mx-auto flex h-10 max-w-3xl items-center justify-evenly px-2 gap-x-4 sm:hidden",
)}*/
