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
 * — et `/` et `/en` à 4 Kio d'images en local contre 32.
 *
 * L'EXPLICATION DONNÉE ICI ÉTAIT FAUSSE. Ce commentaire attribuait l'écart au
 * préchargement des liens visibles, « non vérifié ». Ce qui a été vérifié
 * depuis, sur un build servi en local : `public/sw.js` prend la main pendant le
 * chargement (`clients.claim()`) et sert lui-même `/_next/static/**` ; pour une
 * réponse passée par lui, Playwright rapporte une taille NÉGATIVE, d'environ
 * −1 Kio. Chaque chunk arrivé après l'activation perdait donc son poids ET
 * retirait 1 Kio au total : 14 à 18 scripts par page, `/articles` annoncé à
 * 390 Kio pour 582 reçus. Service worker bloqué, plus une seule taille
 * négative. Le nombre de chunks touchés dépend de l'instant où le service
 * worker s'active, donc de la machine : c'est l'explication retenue pour
 * l'écart entre le poste et la CI, et seule la prochaine trace CI la
 * confirmera. L'écart sur les images, lui, n'est toujours pas expliqué.
 *
 * `budget.spec.ts` bloque désormais le service worker. La mesure est celle
 * d'une PREMIÈRE visite, tous les octets comptés, et elle échoue si une réponse
 * revient sans taille lisible au lieu de l'additionner.
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
 *
 * MISE À JOUR DU 14 NOVEMBRE, en deux traces `POIDS` de la CI sur la PR #19 —
 * les premières depuis que la mesure bloque le service worker, fond de
 * particules compris sur chaque page (`particules=oui`). Toutes les valeurs
 * ci-dessous sortent de la SECONDE ; l'avertissement qui les disait périmées
 * avait disparu dès la première.
 *
 * Depuis le relevé d'août, elles ont bougé dans LES DEUX SENS, parce que deux
 * effets se superposent. À la hausse : les scripts servis par le service
 * worker ne sont plus soustraits, chaque octet reçu compte. À la baisse : la
 * branche a retiré des pages les locales de zod, le parseur markdown, tslog,
 * le polyfill URLPattern, le Pages Router, le catalogue de messages et une
 * police préchargée. `/articles` descend ainsi de 648 à 520 et `/` de 591 à
 * 562, quand `/series/parcours` monte de 448 à 536 et `/tags` de 453 à 486 ;
 * les polices tombent de 266 à 198 sur chaque page, le CSS passe de 24 à 26.
 * Une trace ne sépare pas ces deux effets : ces chiffres disent ce que pèse
 * une première visite aujourd'hui, pas ce que chaque retrait a rapporté.
 *
 * Entre les deux traces du jour, UNE valeur a vraiment bougé, et sa cause est
 * connue : la page d'outil passe de 613 à 533. Elle téléchargeait les
 * quatorze widgets de /utils quel que soit l'outil affiché ; elle ne reçoit
 * plus que le sien, soit 80 Kio de JS en moins. La première trace en faisait
 * le pire cas du site : elle passe derrière `/series/parcours`, restée à
 * 536, et LE PIRE CAS EST DÉSORMAIS L'ACCUEIL, `/` et `/en`, à 562. Toutes
 * les pages publiées sauf ces deux-là — la page d'outil et
 * `/series/parcours` — affichent 1 Kio de JS de plus : 561 à 562 sur
 * l'accueil, 519 à 520 sur `/articles`. Les valeurs sont arrondies au
 * kibioctet, et la trace ne dit pas quel commit l'apporte. Polices, CSS,
 * images et documents sont identiques au kibioctet près.
 *
 * TROISIÈME TRACE DU 14 NOVEMBRE, sur la PR #20 (fluidité sur téléphone).
 * Seul le JS bouge, et dans les deux sens. L'accueil perd 4 Kio, 562 à 558 ;
 * chacune des dix autres pages publiées en gagne 3 — 520 à 523 sur
 * `/articles`, 533 à 536 sur la page d'outil, 536 à 539 sur
 * `/series/parcours`. Ces 3 Kio sont le prix des titres collants animés en
 * CSS : la ligne de temps commune et les états du titre voyagent dans un
 * chunk que toutes les pages reçoivent. L'accueil les paie aussi, mais sa
 * couverture n'embarque plus de carrousel. La trace ne sépare pas ces deux
 * effets ; les relevés locaux, commit par commit, donnaient 7 Kio de moins
 * pour le carrousel. LE PIRE CAS RESTE L'ACCUEIL, à 558. Polices, CSS, images
 * et documents sont identiques au kibioctet près.
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
export const MEASURED_ON = "2026-11-14";

export const MEASURED_PAGES: MeasuredPage[] = [
  {
    css: 26,
    document: 85,
    fonts: 198,
    images: 23,
    js: 558,
    kind: "home",
    path: "/",
  },
  {
    css: 26,
    document: 83,
    fonts: 198,
    images: 23,
    js: 558,
    kind: "home",
    path: "/en",
  },
  {
    css: 26,
    document: 23,
    fonts: 198,
    images: 27,
    js: 523,
    kind: "index",
    path: "/articles",
  },
  {
    css: 26,
    document: 41,
    fonts: 198,
    images: 0,
    js: 523,
    kind: "article",
    path: "/articles/how-i-write-css",
  },
  {
    css: 26,
    document: 47,
    fonts: 198,
    images: 0,
    js: 536,
    kind: "tool",
    path: "/utils/regex-tester",
  },
  {
    css: 26,
    document: 18,
    fonts: 198,
    images: 0,
    js: 489,
    kind: "index",
    path: "/tags",
  },
  {
    css: 26,
    document: 17,
    fonts: 198,
    images: 0,
    js: 497,
    kind: "index",
    path: "/search",
  },
  {
    css: 26,
    document: 18,
    fonts: 198,
    images: 0,
    js: 539,
    kind: "index",
    path: "/series/parcours",
  },
  {
    css: 26,
    document: 18,
    fonts: 198,
    images: 0,
    js: 489,
    kind: "showcase",
    path: "/projects",
  },
  {
    css: 26,
    document: 19,
    fonts: 198,
    images: 0,
    js: 489,
    kind: "showcase",
    path: "/projects/portfolio",
  },
  {
    css: 26,
    document: 19,
    fonts: 198,
    images: 0,
    js: 489,
    kind: "showcase",
    path: "/experience/wefix-by-fnac",
  },
  {
    css: 26,
    document: 23,
    fonts: 198,
    images: 0,
    js: 477,
    kind: "resume",
    path: "/cv",
  },
];

/**
 * Pages que `budget.spec.ts` mesure et journalise, sans plafond ni publication.
 *
 * Elles manquaient au relevé : les listes /components et /utils, et la vue d'un
 * composant, qui porte un aperçu et trois blocs d'onglets. Elles ne peuvent pas
 * entrer dans `MEASURED_PAGES` sans chiffre de CI — c'est la règle de ce module
 * — et n'auront pas de chiffre de CI tant qu'elles ne sont pas mesurées. Cette
 * liste casse le cercle : à verser dans `MEASURED_PAGES` dès la première trace.
 *
 * TRACÉES DEUX FOIS LE 14 NOVEMBRE, et elles restent ici. /components pèse
 * dans les deux traces 539 Kio de JS et 119 d'IMAGES, le double du plafond de
 * 60 : la publier ferait échouer « aucune valeur publiée ne dépasse son
 * plafond », et relever un plafond pour faire entrer une page est ce que ce
 * module interdit. Alléger la liste ou borner les images par type de page est
 * une décision, pas un rafraîchissement. Les deux autres passent sous chaque
 * plafond — dans la seconde trace, la vue du composant à 540 de JS et 40 de
 * document, /utils à 469 et 22 — mais la première demande un `PageKind` que
 * /weight n'a pas. /utils peut entrer telle quelle ; les deux relevés du 14
 * novembre n'ont changé que des valeurs et ne l'ont pas versée.
 */
export const LOGGED_PAGES: string[] = [
  "/components",
  "/components/theme-switcher-component",
  "/utils",
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
 * images : leur plafond reste volontairement large par rapport aux 27 Kio
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
 *
 * RELUS LE 14 NOVEMBRE, sur les deux traces prises service worker bloqué.
 * Même règle, 15 à 20 % au-dessus du pire cas, appliquée aux nouveaux pires
 * cas ; un plafond ne bouge que s'il sort de cette bande, et aucun ne monte :
 *
 * - JS, 562 sur l'accueil. La première trace donnait 613 sur la page
 *   d'outil : 760 se retrouvait 24 % au-dessus (760 / 613 = 1,24), d'où 720.
 *   La seconde ramène cette page à 533 et le pire cas à 562 : 720 se retrouve
 *   à son tour 28 % au-dessus (720 / 562 = 1,28), hors d'une bande qui va de
 *   646 à 674. D'où 660, soit 17,4 % — encore la marge d'un poids qu'on ne
 *   porte plus ;
 * - polices, 198 sur chaque page, dans les deux traces : 300 était 52 %
 *   au-dessus (300 / 198 = 1,52), pour une bande de 228 à 238. D'où 235, soit
 *   18,7 %. À 300, la police préchargée en trop que cette branche a retirée —
 *   266 contre 198 — tenait encore sous le plafond ;
 * - CSS, 26 : 30 est à 15,4 %, dans la bande. Inchangé ;
 * - document, 85 sur l'accueil : 100 est à 17,6 %, dans la bande. Inchangé ;
 * - images, 27 sur /articles : 60 reste large à dessein. Inchangé.
 *
 * RELUS SUR LA TRACE DE LA PR #20 : le pire cas de JS passe de 562 à 558,
 * toujours sur l'accueil. 660 est à 18,3 % (660 / 558 = 1,183), dans la
 * bande de 642 à 670. Inchangé, comme les quatre autres.
 */
export const WEIGHT_BUDGETS = {
  css: 30,
  document: 100,
  fonts: 235,
  images: 60,
  js: 660,
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
