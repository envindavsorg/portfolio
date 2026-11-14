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
import { Badge } from "@/components/primitives/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/Table";
import { Prose } from "@/components/primitives/Typography";
import type { MeasuredPage, WeightMetric } from "@/data/weights";
import {
  heaviest,
  MEASURED_ON,
  MEASURED_PAGES,
  pageTotal,
  WEIGHT_BUDGETS,
  WEIGHT_METRICS,
} from "@/data/weights";
import { formatDate } from "@/lib/functions";
import type { AppLocale, Message } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import * as m from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

/**
 * Le poids du site, publié.
 *
 * L'intégration continue pesait déjà chaque type de page à chaque exécution, et
 * personne ne pouvait voir le résultat. Publier ces chiffres coûte une page et
 * engage : ils viennent de `src/data/weights.ts`, la même source que les plafonds
 * du test — donc la page ne peut pas annoncer un poids que rien ne vérifie.
 */

const pageDescription =
  "Le poids réel de chaque type de page de ce site, mesuré dans un vrai navigateur : JavaScript, polices, CSS, images et document.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Le poids de ce site",
    type: "blog",
  },
  path: "/weight",
  title: "Le poids de ce site",
});

/**
 * `Message` et non `() => string` : la signature courte MASQUE le paramètre de
 * locale, et le compilateur refuse alors l'appel qui la passe explicitement. Ce
 * type existe dans `i18n.ts` pour cette raison précise — c'est la même erreur
 * qui, sous une autre forme, avait fait publier du code source dans /projects.md.
 */
const KIND_LABELS: Record<MeasuredPage["kind"], Message> = {
  article: m.weight_kind_article,
  home: m.weight_kind_home,
  index: m.weight_kind_index,
  resume: m.weight_kind_resume,
  showcase: m.weight_kind_showcase,
  tool: m.weight_kind_tool,
};

const METRIC_LABELS: Record<WeightMetric, string> = {
  css: "CSS",
  document: "HTML",
  fonts: "fonts",
  images: "images",
  js: "JS",
};

/**
 * Sous 640 px, huit colonnes ne tiennent pas : le tableau défile dans son
 * cadre, et la colonne « total » — le chiffre qu'on vient chercher — partait
 * hors champ sans que rien ne signale qu'il fallait faire glisser (539 px de
 * contenu pour 348 visibles à 390 px).
 *
 * La page et le total restent donc en place, et seul le détail défile entre
 * les deux. Une cellule collante doit être opaque, sinon le détail se lit à
 * travers : elle prend la couleur du fond de page. Le filet est un
 * pseudo-élément et non une bordure — dans un tableau à bordures fusionnées,
 * la bordure d'une cellule collante reste en arrière au défilement.
 */
const FROZEN_CELL =
  "max-sm:sticky max-sm:z-1 max-sm:bg-canvas max-sm:after:absolute max-sm:after:inset-y-0 max-sm:after:w-px max-sm:after:bg-edge";

const FROZEN_START = cn(
  FROZEN_CELL,
  "max-sm:left-0 max-sm:after:right-0"
);

const FROZEN_END = cn(
  FROZEN_CELL,
  "max-sm:right-0 max-sm:after:left-0"
);

export const WeightPage = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const options = { locale } as const;
  // le kibioctet s'abrège « Kio » en français, « KiB » partout ailleurs :
  // /en/weight affichait l'unité française au milieu d'une phrase anglaise
  const unit = locale === "en" ? "KiB" : "Kio";

  return (
    <PageColumn>
      <div className="screen-line-after min-h-svh">
        <WritingsBreadcrumb
          items={[
            {
              href: localizeHref("/"),
              label: m.writings_breadcrumb_home(undefined, options),
            },
            { label: m.weight_breadcrumb(undefined, options) },
          ]}
        />

        <Divider before={false} border={false} type="half" />

        <div className="flex w-full items-center justify-between gap-x-3 px-3">
          <PixelHeading
            autoPlay
            className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
            mode="multi"
          >
            {m.weight_heading(undefined, options)}
          </PixelHeading>
        </div>

        <PanelContent className="screen-line-after screen-line-before">
          <Prose>{m.weight_intro(undefined, options)}</Prose>
          <Prose>{m.weight_method(undefined, options)}</Prose>
          <div className="pt-1">
            <Badge className="lowercase" variant="primary">
              {m.weight_measured_on(
                { date: formatDate(MEASURED_ON, "LL") },
                options
              )}
            </Badge>
          </div>
        </PanelContent>

        {/* le tableau défile dans son propre conteneur : la page, elle, ne
            doit jamais défiler horizontalement. `my-0` : la primitive apporte
            24 px de marge verticale, qui s'ajoutaient aux 12 px d'ici — 36 px
            d'air là où les autres sections en ont 16. */}
        <div className="screen-line-after p-3 [&_[data-slot=table-container]]:my-0">
          {/* `overflow-visible` : avec le `overflow-hidden` de la primitive,
              le tableau devient lui-même le cadre de référence des cellules
              collantes, et comme il ne défile pas, rien ne colle. Le cadre
              arrondi qui l'entoure rogne déjà ce qui dépasse. */}
          <Table className="overflow-visible">
            <TableHeader>
              <TableRow>
                <TableHead className={FROZEN_START}>
                  {m.weight_col_page(undefined, options)}
                </TableHead>
                <TableHead>
                  {m.weight_col_kind(undefined, options)}
                </TableHead>
                {WEIGHT_METRICS.map((metric) => (
                  <TableHead className="text-right" key={metric}>
                    {METRIC_LABELS[metric]}
                  </TableHead>
                ))}
                <TableHead className={cn("text-right", FROZEN_END)}>
                  {m.weight_col_total(undefined, options)}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {MEASURED_PAGES.map((page) => (
                <TableRow key={page.path}>
                  {/* le chemin passe à la ligne sous 640 px : figé sur une
                      seule ligne, il prendrait à lui seul la moitié du cadre.
                      La largeur est portée par un bloc intérieur — une
                      cellule de tableau ignore `max-width` et se replierait
                      sur son plus petit mot. */}
                  <TableCell
                    className={cn(
                      "font-medium max-sm:whitespace-normal max-sm:text-xs",
                      FROZEN_START
                    )}
                  >
                    <span className="block max-sm:w-28 max-sm:[overflow-wrap:anywhere]">
                      {page.path}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground lowercase">
                    {KIND_LABELS[page.kind](undefined, options)}
                  </TableCell>
                  {WEIGHT_METRICS.map((metric) => (
                    <TableCell
                      className="text-right tabular-nums"
                      key={metric}
                    >
                      {page[metric]}
                    </TableCell>
                  ))}
                  <TableCell
                    className={cn(
                      "text-right font-semibold tabular-nums",
                      FROZEN_END
                    )}
                  >
                    {pageTotal(page)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ShowcaseSection
          title={m.weight_budgets_title(undefined, options)}
        >
          <Prose className="pb-3">
            {m.weight_budgets_intro(undefined, options)}
          </Prose>

          <ShowcaseDashList>
            {WEIGHT_METRICS.map((metric) => {
              const worst = heaviest(MEASURED_PAGES, metric);

              return (
                <ShowcaseDashItem
                  className="text-muted-foreground"
                  key={metric}
                >
                  {m.weight_budget_row(
                    {
                      budget: `${WEIGHT_BUDGETS[metric]} ${unit}`,
                      measured: `${worst?.[metric] ?? 0} ${unit}`,
                      metric: METRIC_LABELS[metric],
                    },
                    options
                  )}
                </ShowcaseDashItem>
              );
            })}
          </ShowcaseDashList>
        </ShowcaseSection>
      </div>
    </PageColumn>
  );
};

const Page = () => <WeightPage />;

export default Page;
