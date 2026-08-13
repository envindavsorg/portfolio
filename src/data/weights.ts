/**
 * Le poids de ce site, mesuré.
 *
 * Source UNIQUE, partagée par la page /weight et par `e2e/budget.spec.ts`. C'est
 * tout l'intérêt du module : un chiffre publié et un plafond de CI définis
 * séparément finiraient par se contredire, et la page annoncerait un poids que
 * plus rien ne vérifie.
 *
 * MÉTHODE. Chaque valeur est la somme des corps de réponse réellement reçus par
 * un vrai navigateur sur la page, en octets encodés — donc compressés, tels
 * qu'ils passent sur le réseau. Ce n'est pas le chiffre de `next build`, qui
 * agrège des chunks partagés dont une partie n'est jamais téléchargée. Les
 * scripts de la plateforme (`/_vercel/*`) sont exclus : ils répondent 404 hors
 * production.
 *
 * Un piège rencontré en produisant ces chiffres : sommer les entrées
 * `performance.getEntriesByType("resource")` DOUBLE le poids des scripts, parce
 * qu'un chunk préchargé puis exécuté produit deux entrées pour un seul transfert.
 * La première version de cette mesure annonçait 1340 Kio de JS au lieu de 654.
 */

export type PageKind =
  | "home"
  | "index"
  | "article"
  | "tool"
  | "showcase"
  | "resume";

export interface MeasuredPage {
  path: string;
  kind: PageKind;
  /** poids en kibioctets, encodés */
  js: number;
  fonts: number;
  css: number;
  images: number;
  document: number;
}

/** jour de la mesure, affiché à côté des chiffres */
export const MEASURED_ON = "2026-08-13";

export const MEASURED_PAGES: MeasuredPage[] = [
  {
    css: 24,
    document: 85,
    fonts: 266,
    images: 4,
    js: 638,
    kind: "home",
    path: "/",
  },
  {
    css: 24,
    document: 84,
    fonts: 266,
    images: 4,
    js: 638,
    kind: "home",
    path: "/en",
  },
  {
    css: 24,
    document: 21,
    fonts: 266,
    images: 27,
    js: 516,
    kind: "index",
    path: "/articles",
  },
  {
    css: 24,
    document: 39,
    fonts: 266,
    images: 0,
    js: 590,
    kind: "article",
    path: "/articles/how-i-write-css",
  },
  {
    css: 24,
    document: 45,
    fonts: 266,
    images: 0,
    js: 654,
    kind: "tool",
    path: "/utils/regex-tester",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 491,
    kind: "index",
    path: "/tags",
  },
  {
    css: 24,
    document: 16,
    fonts: 266,
    images: 0,
    js: 506,
    kind: "index",
    path: "/search",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 499,
    kind: "index",
    path: "/series/parcours",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 496,
    kind: "showcase",
    path: "/projects",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 496,
    kind: "showcase",
    path: "/projects/portfolio",
  },
  {
    css: 24,
    document: 19,
    fonts: 266,
    images: 0,
    js: 496,
    kind: "showcase",
    path: "/experience/wefix-by-fnac",
  },
  {
    css: 24,
    document: 23,
    fonts: 266,
    images: 0,
    js: 494,
    kind: "resume",
    path: "/cv",
  },
];

/**
 * Plafonds de la CI, en kibioctets.
 *
 * Ce sont des GARDE-FOUS, pas des objectifs atteints : un plafond franchi est un
 * signal à examiner, pas une invitation à l'élargir.
 *
 * ⚠️ Le plafond JS est aujourd'hui LARGE par rapport à la mesure : il a été posé
 * à 15 % au-dessus de 871 Kio, valeur mesurée le 12 août 2026, alors que la même
 * méthode donne 654 Kio le lendemain. Je n'ai pas resserré à l'aveugle : la CI
 * mesure dans son propre environnement, et un plafond calculé sur une mesure
 * locale peut la faire échouer pour une raison qui n'est pas une régression. Le
 * publier tel quel rend l'écart visible — c'est précisément ce que cette page
 * sert à ne plus cacher.
 */
export const WEIGHT_BUDGETS = {
  css: 40,
  document: 120,
  fonts: 300,
  images: 150,
  js: 1000,
} as const;

export type WeightMetric = keyof typeof WEIGHT_BUDGETS;

export const WEIGHT_METRICS: WeightMetric[] = [
  "js",
  "fonts",
  "css",
  "images",
  "document",
];

export const pageTotal = (page: MeasuredPage): number => {
  let total = 0;

  for (const metric of WEIGHT_METRICS) {
    total += page[metric];
  }

  return total;
};

/** la page la plus lourde pour une métrique donnée */
export const heaviest = (
  pages: MeasuredPage[],
  metric: WeightMetric
): MeasuredPage | null => {
  let worst: MeasuredPage | null = null;

  for (const page of pages) {
    if (worst === null || page[metric] > worst[metric]) {
      worst = page;
    }
  }

  return worst;
};
