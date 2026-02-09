"use client";

import { usePathname } from "next/navigation";
import { NavBarLink } from "./NavBarLink";
import { NAVIGATION_DATA } from "../data";

export const NavBarMainMenu = () => {
  const pathname = usePathname();

  return (
    <nav className="ml-auto hidden items-center gap-x-4 sm:flex">
      {NAVIGATION_DATA.map(({ title, link }) => (
        <NavBarLink href={link} key={link} label={title} pathname={pathname} />
      ))}
    </nav>
  );
};
