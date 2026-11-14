import { NavBarCommand } from "./elements/NavBarCommand";
import { NavBarProvider } from "./elements/NavBarContext";
import { NavBarGitHub } from "./elements/NavBarGitHub";
import { NavBarLlm } from "./elements/NavBarLlm";
import { NavBarLocale } from "./elements/NavBarLocale";
import { NavBarMainMenu } from "./elements/NavBarMainMenu";
import { NavBarMark } from "./elements/NavBarMark";
import { NavBarMenuToggle } from "./elements/NavBarMenuToggle";
import { NavBarRss } from "./elements/NavBarRss";
import { NavBarSecondaryMenu } from "./elements/NavBarSecondaryMenu";
import { NavBarTheme } from "./elements/NavBarTheme";
import { NavBarWrapper } from "./elements/NavBarWrapper";

export const NavBar = () => (
  <NavBarProvider>
    <NavBarWrapper>
      {/* le filet du bas n'est PAS `screen-line-after` : un bloc de 0,5px
          calé sur `bottom: 0` occupe [55,5 ; 56], que l'arrondi au pixel
          réduit à une hauteur nulle — la barre avait un bord en haut et
          aucun en bas. Une bordure, elle, vaut toujours au moins un pixel
          d'écran, et reste un filet fin sur un écran dense. */}
      <div className="screen-line-before after:-left-[100vw] after:-z-1 relative mx-auto flex h-12 max-w-3xl items-center justify-between gap-x-4 border-edge border-x px-3 after:absolute after:bottom-0 after:w-[200vw] after:border-edge after:border-b-[0.5px]">
        <NavBarMark />
        <NavBarMainMenu />

        <div className="flex items-center gap-x-2 sm:border-edge sm:border-l sm:pl-4">
          <NavBarCommand />
          <NavBarTheme />
          <NavBarLocale />
          {/* sept boutons font 272px, plus le logo, pour 278px utiles à
              320px de large : le bouton du menu sortait de l'écran. Sous
              `sm` ces trois liens vivent dans NavBarSecondaryMenu */}
          <div className="hidden items-center gap-x-2 sm:flex">
            <NavBarGitHub />
            <NavBarRss />
            <NavBarLlm />
          </div>
          <NavBarMenuToggle />
        </div>
      </div>

      <NavBarSecondaryMenu />
    </NavBarWrapper>
  </NavBarProvider>
);
