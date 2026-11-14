import type { Metadata } from "next";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import {
  ShowcaseDashItem,
  ShowcaseDashList,
} from "@/components/features/ShowcaseDashList";
import { ShowcaseSection } from "@/components/features/ShowcaseSection";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { PageColumn } from "@/components/layout/PageColumn";
import { Prose } from "@/components/primitives/Typography";
import { usesGroups } from "@/data/uses";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import * as m from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Les outils avec lesquels florin cuzeac travaille : la stack de ce site, les langages, l'outillage, les services dont il dépend et l'environnement de développement.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Ce que j'utilise",
    type: "blog",
  },
  path: "/uses",
  title: "Ce que j'utilise",
});

export const UsesPage = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const options = { locale } as const;

  return (
    <PageColumn>
      <div className="screen-line-after min-h-svh">
        <WritingsBreadcrumb
          items={[
            {
              href: localizeHref("/"),
              label: m.writings_breadcrumb_home(undefined, options),
            },
            // le libellé du pied de page, seul lien entrant : « outils » était
            // aussi celui de /utils dans la barre de navigation, juste au-dessus
            { label: m.uses_heading(undefined, options) },
          ]}
        />

        <Divider before={false} border={false} type="half" />

        <div className="flex w-full items-center justify-between gap-x-3 px-3">
          <PixelHeading
            autoPlay
            className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
            mode="multi"
          >
            {m.uses_heading(undefined, options)}
          </PixelHeading>
        </div>

        <PanelContent className="screen-line-after screen-line-before">
          <Prose>{m.uses_intro(undefined, options)}</Prose>
        </PanelContent>

        {usesGroups().map((group) => (
          <ShowcaseSection
            data-slot="uses-group"
            key={group.id}
            title={group.title(undefined, options)}
          >
            <p className="pb-3 text-muted-foreground text-sm">
              {group.note(undefined, options)}
            </p>

            {/* deux colonnes dès 640 px : trente noms d'un ou deux mots sur
                une seule colonne laissaient les trois quarts de la largeur
                vides. `columns` et non une grille : l'ordre se lit de haut en
                bas, et celui des langages est un ordre de fréquence. */}
            <ShowcaseDashList className="sm:columns-2 sm:gap-x-6">
              {group.items.map((item) => (
                <ShowcaseDashItem key={item.name}>
                  {item.link ? (
                    <a
                      className="underline decoration-dotted underline-offset-4 transition-colors hover:text-theme"
                      href={item.link}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </ShowcaseDashItem>
              ))}
            </ShowcaseDashList>
          </ShowcaseSection>
        ))}
      </div>
    </PageColumn>
  );
};

const Page = () => <UsesPage />;

export default Page;
