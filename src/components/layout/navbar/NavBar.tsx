import { getAllContent } from "@/lib/content";
import type { SearchDoc } from "@/lib/search";
import { toSearchDoc } from "@/lib/search";
import { getLocale } from "@/paraglide/runtime";

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

export const NavBar = () => {
  // index compact : la navbar est dans le chrome du site, donc ces données
  // partent dans le payload RSC de CHAQUE page. Sérialiser les objets Content
  // complets y embarquait le corps MDX intégral de tous les articles.
  const posts: SearchDoc[] = getAllContent(
    getLocale() === "en" ? "en" : "fr"
  ).map(toSearchDoc);

  return (
    <NavBarProvider>
      <NavBarWrapper>
        <div className="screen-line-before screen-line-after mx-auto flex h-12 max-w-3xl items-center justify-between gap-x-4 border-edge border-x px-3">
          <NavBarMark />
          <NavBarMainMenu />

          <div className="flex items-center gap-x-2 sm:border-edge sm:border-l sm:pl-4">
            <NavBarCommand posts={posts} />
            <NavBarTheme />
            <NavBarLocale />
            <NavBarGitHub />
            <NavBarRss />
            <NavBarLlm />
            <NavBarMenuToggle />
          </div>
        </div>

        <NavBarSecondaryMenu />
      </NavBarWrapper>
    </NavBarProvider>
  );
};
