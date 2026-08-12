import {
  GitBranchIcon,
  GitDiffIcon,
} from "@phosphor-icons/react/dist/ssr";

import { getCommitData } from "@/actions/commit.action";
import { Divider } from "@/components/base/Divider";
import { Panel } from "@/components/base/Panel";
import { Heart } from "@/components/motion/Heart";
import { formatDate, formatFromNow } from "@/lib/functions";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";

import { FooterClock } from "./FooterClock";
import { FooterDate } from "./FooterDate";

export const Footer = async () => {
  const { branch, hash, updated } = await getCommitData();

  return (
    <footer className="max-w-screen overflow-x-hidden px-2">
      <Panel className="relative mx-auto md:max-w-3xl">
        <div className="pointer-events-none absolute inset-0 -z-1 grid gap-4 max-sm:hidden sm:grid-cols-2">
          <div className="border-edge border-r" />
          <div className="border-edge border-l" />
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
          <div className="max-sm:screen-line-after flex items-center">
            <div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
              <GitDiffIcon
                className="size-6 text-theme"
                weight="duotone"
              />
            </div>
            <div className="w-full flex-1 border-edge border-l p-3 text-start">
              <p className="mt-0.5 flex items-baseline gap-x-1 text-balance font-bold text-sm">
                {/* `updated` est absent si l'API GitHub a échoué : afficher la
                    date du jour ferait passer le build pour le dernier commit */}
                {updated ? (
                  <>
                    {formatDate(updated, "dddd DD MMM")}
                    <span className="font-light text-[10px] text-theme">
                      ({formatFromNow(updated)})
                    </span>
                  </>
                ) : (
                  <span className="font-light text-muted-foreground">
                    —
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
              <GitBranchIcon
                className="size-6 text-theme"
                weight="duotone"
              />
            </div>
            <div className="w-full flex-1 border-edge border-l p-3 text-start">
              <p className="mt-0.5 flex items-baseline gap-x-1 text-balance font-bold text-sm">
                {hash}
                {branch && (
                  <span className="font-light text-[10px] text-theme">
                    {m.footer_on_branch({ branch })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="mx-auto md:max-w-3xl">
        <Divider after={false} type="half" />
      </div>

      <FooterClock />

      <div className="mx-auto md:max-w-3xl">
        <Divider after={false} before={false} type="half" />
      </div>

      <div className="screen-line-before screen-line-after mx-auto flex items-center justify-center border-edge border-x py-2 text-sm sm:text-base md:max-w-3xl">
        {getLocale() === "en" ? (
          <>
            built with lots of
            <Heart className="me-1 text-destructive" size={16} />
            {m.footer_made_with_love_suffix()}
          </>
        ) : (
          <>
            développé avec beaucoup d'
            <Heart className="me-1 text-destructive" size={16} />
            {m.footer_made_with_love_suffix()}
          </>
        )}
      </div>

      <FooterDate />

      <div className="pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex h-2" />
      </div>
    </footer>
  );
};
