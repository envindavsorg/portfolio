import {
  GitBranchIcon,
  GitDiffIcon,
} from "@phosphor-icons/react/dist/ssr";

import { getCommitData } from "@/actions/commit.action";
import { Divider } from "@/components/base/Divider";
import type { LinkGridItem } from "@/components/base/LinkGrid";
import { LinkGrid } from "@/components/base/LinkGrid";
import { Panel } from "@/components/base/Panel";
import { Heart } from "@/components/motion/Heart";
import GLOBAL_DATA from "@/data/global";
import { formatDate, formatFromNow } from "@/lib/functions";
import * as m from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";

import { FooterClock } from "./FooterClock";
import { FooterDate } from "./FooterDate";

/**
 * Le plan du site, là où on le cherche.
 *
 * Le pied de page ne contenait AUCUN lien, et `/cv`, `/now`, `/uses` et
 * `/weight` n'en recevaient aucun de toute l'interface : ces pages n'étaient
 * joignables que par le sitemap ou en tapant l'adresse. La première ligne est
 * donc la raison d'être de la grille.
 *
 * C'est une fonction et non une constante : les libellés dépendent de la
 * locale de la requête, connue au rendu seulement.
 */
const getFooterLinks = (): LinkGridItem[] => [
  {
    href: localizeHref("/projects"),
    kind: "page",
    label: m.showcase_breadcrumb_projects(),
  },
  {
    href: localizeHref("/experience"),
    kind: "page",
    label: m.showcase_breadcrumb_experience(),
  },
  { href: localizeHref("/cv"), kind: "page", label: m.cv_title() },
  {
    href: localizeHref("/now"),
    kind: "page",
    label: m.now_breadcrumb(),
  },
  // `uses_heading`, le titre de la page : « outils » est déjà le libellé de
  // `/utils` dans la barre de navigation
  {
    href: localizeHref("/uses"),
    kind: "page",
    label: m.uses_heading(),
  },
  {
    href: localizeHref("/weight"),
    kind: "page",
    label: m.weight_breadcrumb(),
  },
  {
    href: localizeHref("/tags"),
    kind: "page",
    label: m.footer_link_topics(),
  },
  {
    href: localizeHref("/series"),
    kind: "page",
    label: m.writings_breadcrumb_series(),
  },
  // la clé de `SOCIAL` EST le libellé : un nom de marque ne se traduit pas
  ...(["github", "linkedin"] as const).map(
    (network): LinkGridItem => ({
      href: GLOBAL_DATA.SOCIAL[network],
      kind: "external",
      label: network,
    })
  ),
  {
    href: `mailto:${GLOBAL_DATA.USER.emailAddress}`,
    kind: "resource",
    label: m.footer_link_email(),
  },
  // le libellé de l'icône de la barre de navigation, réemployé : même cible
  { href: "/api/rss", kind: "resource", label: m.nav_rss_aria() },
];

export const Footer = async () => {
  const { branch, hash, updated } = await getCommitData();

  return (
    <footer className="max-w-screen overflow-x-hidden px-2 lowercase">
      {/* `lines="after"` (défaut) : le haut de la grille est déjà tracé par le
          dernier séparateur de la page, comme pour l'ancien pied */}
      <LinkGrid
        aria-label={m.footer_nav_aria()}
        className="mx-auto md:max-w-3xl"
        items={getFooterLinks()}
      />

      <div className="mx-auto md:max-w-3xl">
        <Divider before={false} type="half" />
      </div>

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
                {/* même tiret que la cellule voisine : vide, le paragraphe
                    perdait sa ligne de texte, donc sa hauteur, et le filet de
                    gauche s'arrêtait plus haut que celui de la date */}
                {hash || (
                  <span className="font-light text-muted-foreground">
                    —
                  </span>
                )}
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
            {/* une marge et non une espace : le conteneur est en flex, et
                l'espace finale d'un texte y est supprimée — « of » se collait
                au cœur. Le français n'en veut pas, il élide (« d' »). */}
            built with lots of
            <Heart className="mx-1 text-destructive" size={16} />
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
