"use client";

import { Button } from "@/components/buttons/Button";
import { MenuIcon } from "@/components/icons/MenuIcon";
import { useNavBar } from "./NavBarContext";

export const NavBarMenuToggle = () => {
  const { isSecondaryMenuOpen, toggleSecondaryMenu } = useNavBar();

  return (
    <Button
      aria-label="Menu principal"
      aria-expanded={isSecondaryMenuOpen}
      className="sm:hidden"
      size="icon"
      variant="outline"
      onClick={toggleSecondaryMenu}
    >
      <MenuIcon isOpen={isSecondaryMenuOpen} />
    </Button>
  );
};
