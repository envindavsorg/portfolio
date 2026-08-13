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
export const MEASURED_ON = "2026-08-14";

export const MEASURED_PAGES: MeasuredPage[] = [
  {
    css: 24,
    document: 85,
    fonts: 266,
    images: 4,
    js: 629,
    kind: "home",
    path: "/",
  },
  {
    css: 24,
    document: 84,
    fonts: 266,
    images: 4,
    js: 641,
    kind: "home",
    path: "/en",
  },
  {
    css: 24,
    document: 21,
    fonts: 266,
    images: 27,
    js: 518,
    kind: "index",
    path: "/articles",
  },
  {
    css: 24,
    document: 39,
    fonts: 266,
    images: 0,
    js: 593,
    kind: "article",
    path: "/articles/how-i-write-css",
  },
  {
    css: 24,
    document: 45,
    fonts: 266,
    images: 0,
    js: 657,
    kind: "tool",
    path: "/utils/regex-tester",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 494,
    kind: "index",
    path: "/tags",
  },
  {
    css: 24,
    document: 16,
    fonts: 266,
    images: 0,
    js: 509,
    kind: "index",
    path: "/search",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 502,
    kind: "index",
    path: "/series/parcours",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 498,
    kind: "showcase",
    path: "/projects",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 498,
    kind: "showcase",
    path: "/projects/portfolio",
  },
  {
    css: 24,
    document: 19,
    fonts: 266,
    images: 0,
    js: 498,
    kind: "showcase",
    path: "/experience/wefix-by-fnac",
  },
  {
    css: 24,
    document: 23,
    fonts: 266,
    images: 0,
    js: 499,
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
 * RESSERRÉS. Ils avaient été posés à 15 % au-dessus d'une mesure de 871 Kio de
 * JS ; la même méthode en donne 657. Un plafond à 1000 laissait donc passer une
 * régression de plus de 50 % sans rien dire — un garde-fou qui ne garde rien.
 *
 * La marge retenue est d'environ 15 à 20 % au-dessus du pire cas mesuré, sauf
 * pour les images : leur plafond reste volontairement large par rapport aux
 * 27 Kio actuels, parce qu'il n'est pas là pour traquer le kilo-octet mais pour
 * qu'un fichier lourd redéposé se voie tout de suite. Il passe quand même de 150
 * à 60, ce qui le rend capable d'attraper une photo non optimisée.
 *
 * Ces valeurs viennent d'une mesure LOCALE. `budget.spec.ts` journalise
 * désormais ce qu'il mesure à chaque exécution : la prochaine trace de CI dira
 * si son environnement pèse comme celui-ci, et permettra de resserrer encore
 * sur des chiffres constatés plutôt que supposés.
 */
export const WEIGHT_BUDGETS = {
  css: 30,
  document: 100,
  fonts: 300,
  images: 60,
  js: 780,
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
