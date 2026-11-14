import Link from "next/link";

import { Divider } from "@/components/base/Divider";
import type { LinkGridItem } from "@/components/base/LinkGrid";
import { LinkGrid } from "@/components/base/LinkGrid";
import {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
} from "@/components/base/Panel";
import { Particles } from "@/components/blocks/Particles";
import { TextAnimate } from "@/components/blocks/TextAnimate";
import { Button } from "@/components/primitives/Button";
import * as m from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

/**
 * Par où repartir : la page n'a ni barre de navigation ni pied de page, et son
 * seul lien menait à l'accueil. Une fonction, parce que les libellés dépendent
 * de la locale de la requête.
 */
const getWayOut = (): LinkGridItem[] => [
  {
    href: localizeHref("/articles"),
    kind: "page",
    label: m.nav_articles(),
  },
  {
    href: localizeHref("/components"),
    kind: "page",
    label: m.nav_components(),
  },
  {
    href: localizeHref("/utils"),
    kind: "page",
    label: m.nav_utils(),
  },
  {
    href: localizeHref("/search"),
    kind: "page",
    label: m.search_breadcrumb(),
  },
];

/**
 * `overflow-x-clip` n'est pas décoratif : les filets d'écran sont des
 * pseudo-éléments de 200vw. Les pages ordinaires les rognent par le `<main>` de
 * leur gabarit ; celle-ci est rendue hors de ce gabarit et défilait donc de
 * 349 px à l'horizontale à 1440 px de large.
 *
 * `lowercase` vient du même `<main>` absent : sans lui le texte gardait ses
 * capitales, seul de tout le site.
 */
export const NotFoundContent = () => (
  <main className="max-w-screen overflow-x-clip px-2 lowercase">
    {/* `min-h-svh` et non `h-screen` : sur mobile, `100vh` compte la barre
        d'adresse et le bloc centré débordait du cadre visible */}
    <div className="mx-auto flex min-h-svh flex-col justify-center md:max-w-3xl">
      <Divider border={false} type="half" />

      <Panel>
        <PanelHeader>
          {/* animé par MOT : par caractère, chaque lettre est un bloc en
              ligne et le titre se coupait n'importe où — « page not f / ound! »
              à 320 px. La taille passe par `segmentClassName` parce que le
              mode mot impose `text-sm` à ses segments. */}
          <h1>
            <TextAnimate
              animation="slideLeft"
              by="word"
              delay={0.2}
              segmentClassName="text-4xl sm:text-5xl"
            >
              {m.notfound_title()}
            </TextAnimate>
          </h1>
        </PanelHeader>

        <Divider before={false} border={false} type="half" />

        <PanelContent>
          <TextAnimate
            animation="slideUp"
            as="p"
            by="word"
            delay={0.4}
          >
            {m.notfound_reason()}
          </TextAnimate>

          <Divider border={false} type="half" />

          <TextAnimate
            animation="slideUp"
            as="p"
            by="word"
            delay={0.6}
            themed
          >
            {m.notfound_advice()}
          </TextAnimate>
        </PanelContent>

        {/* le cadre est déjà celui du `Panel` : pas de second filet latéral */}
        <LinkGrid
          aria-label={m.footer_nav_aria()}
          className="border-x-0"
          items={getWayOut()}
          lines="before"
        />

        <PanelFooter>
          <Button asChild variant="outline">
            <Link href={localizeHref("/")}>
              {m.notfound_back_label()}
            </Link>
          </Button>
        </PanelFooter>
      </Panel>

      <Divider border={false} type="half" />
    </div>

    <Particles density={150} />
  </main>
);
