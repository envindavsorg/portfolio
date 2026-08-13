import type { Metadata } from "next";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
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
import { m } from "@/paraglide/messages";
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

export const WeightPage = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const options = { locale } as const;

  return (
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

      {/* le tableau défile dans son propre conteneur : la page, elle, ne doit
          jamais défiler horizontalement */}
      <div className="screen-line-after overflow-x-auto p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
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
              <TableHead className="text-right">
                {m.weight_col_total(undefined, options)}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {MEASURED_PAGES.map((page) => (
              <TableRow key={page.path}>
                <TableCell className="font-medium">
                  {page.path}
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
                <TableCell className="text-right font-semibold tabular-nums">
                  {pageTotal(page)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <section className="screen-line-after px-3 py-4">
        <h2 className="pb-2 font-semibold text-sm lowercase">
          {m.weight_budgets_title(undefined, options)}
        </h2>

        <Prose className="pb-3">
          {m.weight_budgets_intro(undefined, options)}
        </Prose>

        <ul className="space-y-1.5">
          {WEIGHT_METRICS.map((metric) => {
            const worst = heaviest(MEASURED_PAGES, metric);

            return (
              <li
                className="flex gap-x-2 text-muted-foreground text-sm"
                key={metric}
              >
                <span aria-hidden="true" className="text-theme">
                  --
                </span>
                {m.weight_budget_row(
                  {
                    budget: `${WEIGHT_BUDGETS[metric]} Kio`,
                    measured: `${worst?.[metric] ?? 0} Kio`,
                    metric: METRIC_LABELS[metric],
                  },
                  options
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

const Page = () => <WeightPage />;

export default Page;
