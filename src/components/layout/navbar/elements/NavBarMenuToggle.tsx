"use client";

import { MenuIcon } from "@/components/layout/navbar/elements/NavBarMenuIcon";
import { Button } from "@/components/primitives/Button";
import { m } from "@/paraglide/messages";

import { useNavBar } from "./NavBarContext";

export const NavBarMenuToggle = () => {
  const { isSecondaryMenuOpen, toggleSecondaryMenu } = useNavBar();

  return (
    <Button
      aria-expanded={isSecondaryMenuOpen}
      aria-label={m.nav_menu_toggle_aria()}
      className="sm:hidden"
      onClick={toggleSecondaryMenu}
      size="icon"
      variant="outline"
    >
      <MenuIcon isOpen={isSecondaryMenuOpen} />
    </Button>
  );
};
