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
 *
 * D'OÙ VIENNENT CES VALEURS. De la CI, pas d'un poste de travail. C'était le but
 * de la journalisation ajoutée à `budget.spec.ts`, et son premier passage a
 * démenti les mesures locales sur deux points : `/articles` à 518 Kio de JS en
 * local contre 707 en CI — un tiers d'écart, sur la page la plus lourde du site
 * — et `/` et `/en` à 4 Kio d'images en local contre 32. L'explication la plus
 * probable, non vérifiée, est le préchargement des liens visibles, qui a le
 * temps d'aboutir avant `networkidle` sur un runner et pas forcément ailleurs.
 * Partout ailleurs l'écart était de 2 Kio au plus.
 *
 * Les chiffres retenus sont donc ceux de la CI : c'est l'environnement
 * REPRODUCTIBLE, et c'est celui qui fait respecter les plafonds. Une page qui
 * publierait 518 quand le seul environnement vérifiable en mesure 707
 * annoncerait un poids que rien ne confirme.
 *
 * MISE À JOUR DU 14 AOÛT. La montée de version des dépendances — next 16.3.1,
 * react 19.2.8, motion 13 — a allégé CHAQUE page de 6 à 11 %, 9,2 % en moyenne,
 * soit une quarantaine à une soixantaine de kibioctets de JS par page. Le pire
 * cas passe de 707 à 648. Ce n'est pas un gain qu'on pouvait annoncer avant de
 * l'avoir vu : c'est la trace `POIDS` de la CI qui l'a montré, sur le passage
 * qui validait la mise à jour.
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
    images: 29,
    js: 591,
    kind: "home",
    path: "/",
  },
  {
    css: 24,
    document: 84,
    fonts: 266,
    images: 29,
    js: 579,
    kind: "home",
    path: "/en",
  },
  {
    css: 24,
    document: 22,
    fonts: 266,
    images: 27,
    js: 648,
    kind: "index",
    path: "/articles",
  },
  {
    css: 24,
    document: 39,
    fonts: 266,
    images: 0,
    js: 541,
    kind: "article",
    path: "/articles/how-i-write-css",
  },
  {
    css: 24,
    document: 46,
    fonts: 266,
    images: 0,
    js: 606,
    kind: "tool",
    path: "/utils/regex-tester",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 453,
    kind: "index",
    path: "/tags",
  },
  {
    css: 24,
    document: 17,
    fonts: 266,
    images: 0,
    js: 457,
    kind: "index",
    path: "/search",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 448,
    kind: "index",
    path: "/series/parcours",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 446,
    kind: "showcase",
    path: "/projects",
  },
  {
    css: 24,
    document: 18,
    fonts: 266,
    images: 0,
    js: 446,
    kind: "showcase",
    path: "/projects/portfolio",
  },
  {
    css: 24,
    document: 19,
    fonts: 266,
    images: 0,
    js: 446,
    kind: "showcase",
    path: "/experience/wefix-by-fnac",
  },
  {
    css: 24,
    document: 23,
    fonts: 266,
    images: 0,
    js: 445,
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
 * JS. Un plafond à 1000 laissait passer une régression de plus de 50 % sans rien
 * dire — un garde-fou qui ne garde rien.
 *
 * La marge est d'environ 15 à 20 % au-dessus du pire cas mesuré, sauf pour les
 * images : leur plafond reste volontairement large par rapport aux 29 Kio
 * actuels, parce qu'il n'est pas là pour traquer le kilo-octet mais pour qu'un
 * fichier lourd redéposé se voie tout de suite. Il passe quand même de 150 à 60,
 * ce qui le rend capable d'attraper une photo non optimisée.
 *
 * ⚠️ CALÉS SUR LA CI, pas sur un poste de travail. Ce plafond a bougé deux fois
 * en deux jours, et les deux fois pour la même raison de fond :
 *
 * - posé à 780 sur un pire cas mesuré EN LOCAL à 657, il n'offrait que 10 % de
 *   marge sur le vrai pire cas, que la CI a mesuré à 707 ;
 * - relevé à 820 sur ces 707, il s'est retrouvé 26 % au-dessus dès que la montée
 *   des dépendances a ramené le pire cas à 648.
 *
 * D'où 760, soit 17 % au-dessus des 648 constatés. Un garde-fou trop haut ne
 * garde rien, et il n'y a aucune raison de garder la marge d'un poids qu'on ne
 * porte plus.
 *
 * La leçon vaut plus que le chiffre : un plafond calculé sur une mesure qu'un
 * seul environnement sait produire n'est pas un plafond, c'est une supposition.
 * Et il se relit à chaque fois que le pire cas bouge, pas seulement quand il
 * monte.
 */
export const WEIGHT_BUDGETS = {
  css: 30,
  document: 100,
  fonts: 300,
  images: 60,
  js: 760,
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
