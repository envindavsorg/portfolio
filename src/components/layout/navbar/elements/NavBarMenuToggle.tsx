"use client";

import { MenuIcon } from "@/components/layout/navbar/elements/NavBarMenuIcon";
import { Button } from "@/components/primitives/Button";
import * as m from "@/paraglide/messages";

import { NAVBAR_MENU_ID, useNavBar } from "./NavBarContext";

export const NavBarMenuToggle = () => {
  const { isSecondaryMenuOpen, toggleRef, toggleSecondaryMenu } =
    useNavBar();

  return (
    <Button
      aria-controls={NAVBAR_MENU_ID}
      aria-expanded={isSecondaryMenuOpen}
      aria-label={m.nav_menu_toggle_aria()}
      className="sm:hidden"
      onClick={toggleSecondaryMenu}
      ref={toggleRef}
      size="icon"
      variant="outline"
    >
      <MenuIcon isOpen={isSecondaryMenuOpen} />
    </Button>
  );
};
