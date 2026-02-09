import { NavBarMark } from "./elements/NavBarMark";
import { NavBarWrapper } from "./elements/NavBarWrapper";
import { NavBarTheme } from "./elements/NavBarTheme";
import { NavBarGitHub } from "./elements/NavBarGitHub";
import { NavBarRss } from "./elements/NavBarRss";
import { NavBarLlm } from "./elements/NavBarLlm";
import { NavBarMainMenu } from "./elements/NavBarMainMenu";
import { NavBarProvider } from "./elements/NavBarContext";
import { NavBarMenuToggle } from "./elements/NavBarMenuToggle";
import { NavBarSecondaryMenu } from "./elements/NavBarSecondaryMenu";
import { getAllPosts } from "@/lib/blog/posts";
import { NavBarCommand } from "./elements/NavBarCommand";

export const NavBar = () => {
  const posts: Post[] = getAllPosts();

  return (
    <NavBarProvider>
      <NavBarWrapper>
        <div className="screen-line-before screen-line-after border-edge border-x mx-auto flex h-12 max-w-3xl items-center justify-between px-2 gap-x-4">
          <NavBarMark />
          <NavBarMainMenu />

          <div className="flex items-center gap-x-2 sm:border-edge sm:border-l sm:pl-4">
            <NavBarCommand posts={posts} />
            <NavBarTheme />
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
