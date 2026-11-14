"use client";

import type { ReactNode, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/** relie le bouton du menu (`aria-controls`) au `<nav>` qu'il déplie */
export const NAVBAR_MENU_ID = "navbar-menu";

interface NavBarContextValue {
  isSecondaryMenuOpen: boolean;
  toggleSecondaryMenu: () => void;
  closeSecondaryMenu: () => void;
  /** posée sur le bouton du menu : Échap lui rend le focus */
  toggleRef: RefObject<HTMLButtonElement | null>;
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
  const toggleRef = useRef<HTMLButtonElement>(null);

  const toggleSecondaryMenu = useCallback(
    () => setIsSecondaryMenuOpen((prev) => !prev),
    []
  );

  const closeSecondaryMenu = useCallback(
    () => setIsSecondaryMenuOpen(false),
    []
  );

  useEffect(() => {
    if (!isSecondaryMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      // `defaultPrevented` : une couche ouverte PAR-DESSUS le menu (palette,
      // feuille de raccourcis) a déjà consommé la touche pour se fermer. Une
      // pression d'Échap ne referme qu'une couche à la fois.
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }

      setIsSecondaryMenuOpen(false);
      // le menu démonté, le focus qu'il portait retomberait sur `<body>` et
      // la tabulation repartirait du haut de la page
      toggleRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSecondaryMenuOpen]);

  return (
    <NavBarContext.Provider
      value={{
        closeSecondaryMenu,
        isSecondaryMenuOpen,
        toggleRef,
        toggleSecondaryMenu,
      }}
    >
      {children}
    </NavBarContext.Provider>
  );
};
