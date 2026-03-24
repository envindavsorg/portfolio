"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";

interface NavBarContextValue {
  isSecondaryMenuOpen: boolean;
  toggleSecondaryMenu: () => void;
  closeSecondaryMenu: () => void;
}

const NavBarContext = createContext<NavBarContextValue | null>(null);

export const useNavBar = () => {
  const context = useContext(NavBarContext);
  if (!context) {
    throw new Error("useNavBar must be used within NavBarProvider");
  }
  return context;
};

export const NavBarProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] =
    useState(false);

  const toggleSecondaryMenu = useCallback(
    () => setIsSecondaryMenuOpen((prev) => !prev),
    []
  );

  const closeSecondaryMenu = useCallback(
    () => setIsSecondaryMenuOpen(false),
    []
  );

  return (
    <NavBarContext.Provider
      value={{
        closeSecondaryMenu,
        isSecondaryMenuOpen,
        toggleSecondaryMenu,
      }}
    >
      {children}
    </NavBarContext.Provider>
  );
};
