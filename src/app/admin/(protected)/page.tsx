import {
  heaviest,
  MEASURED_ON,
  MEASURED_PAGES,
  WEIGHT_BUDGETS,
  WEIGHT_METRICS,
} from "@/data/weights";
import { requireAdminSession } from "@/lib/admin/auth";
import type { InventoryItem } from "@/lib/admin/inventory";
import { buildInventory } from "@/lib/admin/inventory";
import type { Content } from "@/lib/content";
import { getAllContent } from "@/lib/content";

const toInventoryItem = (content: Content): InventoryItem => ({
  category: content.metadata.category ?? "sans-catégorie",
  description: content.metadata.description,
  locale: content.locale,
  series: content.metadata.series,
  seriesOrder: content.metadata.seriesOrder,
  slug: content.slug,
  tags: content.metadata.tags,
  title: content.metadata.title,
});

const FINDING_LABELS: Record<string, string> = {
  "description-absente": "description absente",
  "ordre-de-serie-duplique": "ordre de série dupliqué",
  "sans-etiquette": "sans étiquette",
  "traduction-manquante": "traduction manquante",
};

const Card = ({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) => (
  <section className="rounded-md border border-input p-4">
    <h2 className="pb-3 font-semibold text-sm lowercase">{title}</h2>
    {children}
  </section>
);

const DashboardPage = async () => {
  /*
    AVANT toute lecture de données. La garde du layout ne suffit pas : Next rend
    le layout et la page en parallèle, donc un `redirect()` du layout laisse la
    page calculer et diffuser son contenu dans le payload de la redirection.
    Vérifié par `e2e/admin.spec.ts`, qui lit le corps du 307.
  */
  await requireAdminSession();

  const inventory = buildInventory(
    getAllContent("fr").map(toInventoryItem),
    getAllContent("en").map(toInventoryItem)
  );

  const grouped = new Map<string, typeof inventory.findings>();
  for (const finding of inventory.findings) {
    grouped.set(finding.kind, [
      ...(grouped.get(finding.kind) ?? []),
      finding,
    ]);
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-1">
        <h1 className="font-semibold text-2xl lowercase">
          tableau de bord
        </h1>
        <p className="text-muted-foreground text-sm">
          Ce que la navigation ne montre pas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="contenus">
          <p className="font-semibold text-3xl">{inventory.total}</p>
          <p className="pt-1 text-muted-foreground text-sm">
            {inventory.translated} traduits en anglais
          </p>
        </Card>

        <Card title="signalements">
          <p className="font-semibold text-3xl">
            {inventory.findings.length}
          </p>
          <p className="pt-1 text-muted-foreground text-sm">
            {grouped.size} type
            {grouped.size > 1 ? "s" : ""} distinct
            {grouped.size > 1 ? "s" : ""}
          </p>
        </Card>

        <Card title="par catégorie">
          <ul className="flex flex-col gap-y-1 text-sm">
            {inventory.byCategory.map(({ category, count }) => (
              <li className="flex justify-between" key={category}>
                <span>{category}</span>
                <span className="text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {[...grouped.entries()].map(([kind, findings]) => (
        <Card
          key={kind}
          title={`${FINDING_LABELS[kind] ?? kind} (${findings.length})`}
        >
          <ul className="flex flex-col gap-y-2 text-sm">
            {findings.map((finding) => (
              <li
                className="flex flex-col gap-y-0.5"
                key={`${finding.kind}-${finding.category}-${finding.slug}`}
              >
                <span className="font-mono text-xs">
                  {finding.category}/{finding.slug}
                </span>
                <span className="text-muted-foreground">
                  {finding.detail}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {/*
        Les poids viennent de `src/data/weights.ts`, la même source que la page
        publique /weight et que `budget.spec.ts`. Ce tableau n'en refait pas la
        mesure : il montre la marge restante sous chaque plafond, qui est ce
        qu'on veut savoir avant d'ajouter quoi que ce soit.
      */}
      <Card
        title={`poids sous les plafonds (mesuré le ${MEASURED_ON})`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">métrique</th>
                <th className="pb-2 font-medium">pire cas</th>
                <th className="pb-2 font-medium">plafond</th>
                <th className="pb-2 font-medium">marge</th>
              </tr>
            </thead>
            <tbody>
              {WEIGHT_METRICS.map((metric) => {
                const worst = heaviest(MEASURED_PAGES, metric);
                const ceiling = WEIGHT_BUDGETS[metric];
                const value = worst?.[metric] ?? 0;
                const margin =
                  ceiling > 0
                    ? Math.round(((ceiling - value) / ceiling) * 100)
                    : 0;

                return (
                  <tr className="border-input border-t" key={metric}>
                    <td className="py-1.5">{metric}</td>
                    <td className="py-1.5">
                      {value} Kio
                      <span className="pl-1 text-muted-foreground text-xs">
                        {worst?.path}
                      </span>
                    </td>
                    <td className="py-1.5">{ceiling} Kio</td>
                    <td className="py-1.5">{margin} %</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
