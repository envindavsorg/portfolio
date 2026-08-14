/**
 * Ce que l'administration doit savoir du contenu, sans lire le disque.
 *
 * Module PUR : il reçoit les contenus des deux locales et en déduit ce qui
 * manque. Aucune dépendance à `content.ts`, donc aucun accès au système de
 * fichiers ni à la chaîne MDX — il se teste avec trois objets littéraux.
 *
 * L'intérêt n'est pas de recompter ce que le site affiche déjà, c'est de rendre
 * visible ce qui est INVISIBLE en naviguant : une traduction absente se
 * remarque en changeant de langue, mais un article publié sans description ou
 * une série trouée ne se voient nulle part.
 */

export interface InventoryItem {
  slug: string;
  category: string;
  title: string;
  /** locale réellement servie : « fr » sur une page EN signale un repli */
  locale: string;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  description?: string;
}

export interface InventoryFinding {
  kind:
    | "traduction-manquante"
    | "description-absente"
    | "sans-etiquette"
    | "ordre-de-serie-duplique";
  slug: string;
  category: string;
  detail: string;
}

export interface InventorySummary {
  total: number;
  translated: number;
  byCategory: { category: string; count: number }[];
  findings: InventoryFinding[];
}

const byCategoryCount = (
  items: InventoryItem[]
): { category: string; count: number }[] => {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort(
      (a, b) =>
        b.count - a.count || a.category.localeCompare(b.category)
    );
};

/**
 * Un ordre de série dupliqué ne casse rien — `series.ts` retombe sur la date
 * puis le slug — mais il rend l'ordre de lecture arbitraire alors qu'il est
 * censé être choisi. C'est exactement le genre de chose qu'on ne voit pas en
 * relisant le site.
 */
const duplicateSeriesOrders = (
  items: InventoryItem[]
): InventoryFinding[] => {
  const seen = new Map<string, InventoryItem[]>();

  for (const item of items) {
    if (item.series === undefined || item.seriesOrder === undefined) {
      continue;
    }

    const key = `${item.series}#${item.seriesOrder}`;
    seen.set(key, [...(seen.get(key) ?? []), item]);
  }

  const findings: InventoryFinding[] = [];

  for (const [key, group] of seen) {
    if (group.length < 2) {
      continue;
    }

    const [series, order] = key.split("#");

    for (const item of group) {
      findings.push({
        category: item.category,
        detail: `ordre ${order} partagé dans la série « ${series} » par ${group.length} contenus`,
        kind: "ordre-de-serie-duplique",
        slug: item.slug,
      });
    }
  }

  return findings;
};

export const buildInventory = (
  french: InventoryItem[],
  english: InventoryItem[]
): InventorySummary => {
  const findings: InventoryFinding[] = [];

  /**
   * Une traduction « manquante » se reconnaît à la locale SERVIE, pas à
   * l'absence du slug. `getAllContent("en")` rend toujours les 44 contenus : un
   * fichier EN absent retombe sur le français, et c'est `content.locale` qui
   * porte la vérité. Comparer les listes de slugs ne trouverait donc rien.
   */
  const englishBySlug = new Map(
    english.map((item) => [`${item.category}/${item.slug}`, item])
  );

  let translated = 0;

  for (const item of french) {
    const key = `${item.category}/${item.slug}`;
    const counterpart = englishBySlug.get(key);

    if (counterpart?.locale === "en") {
      translated += 1;
    } else {
      findings.push({
        category: item.category,
        detail: "aucun fichier anglais, la page /en sert le français",
        kind: "traduction-manquante",
        slug: item.slug,
      });
    }

    if (!item.description?.trim()) {
      findings.push({
        category: item.category,
        detail:
          "sans description : la carte sociale et les métadonnées la reprennent",
        kind: "description-absente",
        slug: item.slug,
      });
    }

    if (!item.tags || item.tags.length === 0) {
      findings.push({
        category: item.category,
        detail:
          "sans étiquette : le contenu n'apparaît sur aucune page de tag",
        kind: "sans-etiquette",
        slug: item.slug,
      });
    }
  }

  findings.push(...duplicateSeriesOrders(french));

  return {
    byCategory: byCategoryCount(french),
    findings,
    total: french.length,
    translated,
  };
};
