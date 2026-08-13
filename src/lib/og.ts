/**
 * Identité visuelle des cartes sociales, par type de page.
 *
 * Il n'existait qu'UN gabarit : même fond, même bannière, même composition pour
 * les neuf types de page. Seul le texte d'un badge changeait. Partagé dans un
 * fil, un article, un outil et une fiche de poste produisaient donc la même
 * image — la carte ne disait rien de ce qu'il y avait au bout du lien.
 *
 * Les structures s'inspirent de `ogimagecn` (shadcn-labs, MIT) : la pastille de
 * catégorie, la ligne de méta en pied, le bloc terminal, les guides en
 * pointillés. Rien n'en est recopié tel quel — leur palette violette et leurs
 * capitales jureraient avec ce site, qui écrit en minuscules dans une fonte
 * pixel. Les guides, eux, ne sont même pas un emprunt : ce sont les
 * `screen-line` que le site trace déjà sur chacune de ses pages.
 *
 * Module PUR : aucune dépendance au rendu, donc testable seul. Le gabarit lui
 * même vit dans la route, qui est le seul endroit à savoir composer du JSX pour
 * Satori.
 */

export type OgFamily =
  | "home"
  | "writing"
  | "components"
  | "tools"
  | "project"
  | "experience";

export interface OgPalette {
  /** couleur d'accent : pastille, filet, ponctuation */
  accent: string;
  /**
   * Couleur du TEXTE de la pastille, distincte de l'accent graphique.
   *
   * L'accent posé tel quel sur son propre fond doux donnait 3,99:1 pour le bleu
   * et 3,95:1 pour le vert — sous le seuil de 4,5:1 que ce site s'impose partout
   * ailleurs. Une carte sociale n'est pas auditée par axe, mais elle est lue en
   * vignette sur un téléphone, où le contraste compte plus, pas moins. Les paires
   * sont vérifiées par un test qui utilise `contrast.ts`, la bibliothèque du site.
   */
  accentInk: string;
  /** fond de la pastille de catégorie */
  accentSoft: string;
  /** fond de la carte */
  canvas: string;
  /** couleur du texte principal */
  ink: string;
  /** couleur du texte secondaire */
  muted: string;
  /** couleur des guides en pointillés */
  guide: string;
}

/**
 * Les jetons du site, pas une palette inventée pour l'occasion.
 *
 * `#306fdb` est la couleur de marque exacte — celle qui est passée de 4,4995:1 à
 * 4,5102:1 pour franchir le seuil WCAG. Une carte sociale n'est pas auditée par
 * axe, mais utiliser une autre valeur ferait deux bleus « de marque » dans le
 * même produit.
 */
const CANVAS = "#faf9f6";
const INK = "#141413";
const MUTED = "#5b5b58";
const GUIDE = "#d8d5cc";

const PALETTES: Record<OgFamily, OgPalette> = {
  components: {
    accent: "#7c3aed",
    accentInk: "#6d28d9",
    accentSoft: "#ede9fe",
    canvas: CANVAS,
    guide: GUIDE,
    ink: INK,
    muted: MUTED,
  },
  experience: {
    accent: "#b45309",
    accentInk: "#92400e",
    accentSoft: "#fef3c7",
    canvas: CANVAS,
    guide: GUIDE,
    ink: INK,
    muted: MUTED,
  },
  home: {
    accent: "#306fdb",
    accentInk: "#1d4ed8",
    accentSoft: "#e2ecfd",
    canvas: CANVAS,
    guide: GUIDE,
    ink: INK,
    muted: MUTED,
  },
  project: {
    accent: "#047857",
    accentInk: "#065f46",
    accentSoft: "#d1fae5",
    canvas: CANVAS,
    guide: GUIDE,
    ink: INK,
    muted: MUTED,
  },
  /** la carte des outils est SOMBRE : c'est un terminal, pas une page */
  tools: {
    accent: "#22c55e",
    accentInk: "#22c55e",
    accentSoft: "#0b3a1f",
    canvas: "#121212",
    guide: "#2f2f2f",
    ink: "#fafafa",
    muted: "#a1a1a1",
  },
  writing: {
    accent: "#306fdb",
    accentInk: "#1d4ed8",
    accentSoft: "#e2ecfd",
    canvas: CANVAS,
    guide: GUIDE,
    ink: INK,
    muted: MUTED,
  },
};

const FAMILY_BY_TYPE: Record<PageType, OgFamily> = {
  blog: "writing",
  blogArticle: "writing",
  components: "components",
  componentsArticle: "components",
  experience: "experience",
  homepage: "home",
  project: "project",
  utils: "tools",
  utilsArticle: "tools",
};

export const ogFamily = (type: PageType): OgFamily =>
  FAMILY_BY_TYPE[type] ?? "home";

export const ogPalette = (type: PageType): OgPalette =>
  PALETTES[ogFamily(type)];

const BADGES_FR: Record<PageType, string> = {
  blog: "blog",
  blogArticle: "article",
  components: "composants",
  componentsArticle: "composant",
  experience: "expérience",
  homepage: "portfolio",
  project: "projet",
  utils: "outils",
  utilsArticle: "outil",
};

const BADGES_EN: Record<PageType, string> = {
  blog: "blog",
  blogArticle: "article",
  components: "components",
  componentsArticle: "component",
  experience: "experience",
  homepage: "portfolio",
  project: "project",
  utils: "tools",
  utilsArticle: "tool",
};

/** le mot de la pastille, dans la langue de la page partagée */
export const ogBadge = (type: PageType, isEnglish: boolean): string =>
  (isEnglish ? BADGES_EN : BADGES_FR)[type] ?? BADGES_FR.homepage;

/**
 * `Object.hasOwn`, et non l'opérateur `in`.
 *
 * `in` remonte la CHAÎNE DE PROTOTYPES : `"toString" in FAMILY_BY_TYPE` vaut
 * `true`, donc `?type=toString` franchissait la validation, puis la recherche de
 * gabarit rendait une fonction héritée d'`Object.prototype` au lieu d'une
 * famille. La carte tombait alors dans le repli d'erreur — sur un paramètre
 * fourni par l'appelant, sur un endpoint public.
 */
export const isPageType = (value: string): value is PageType =>
  Object.hasOwn(FAMILY_BY_TYPE, value);

export const MAX_TITLE_LENGTH = 90;
export const MAX_DESCRIPTION_LENGTH = 180;
export const MAX_META_LENGTH = 80;

/**
 * L'endpoint est PUBLIC : sans plafond, un titre de 100 ko fait rendre à Satori
 * un texte géant — coût CPU et mémoire — et pollue le cache CDN, qui garde une
 * entrée par URL.
 */
export const truncate = (value: string, max: number): string =>
  value.length > max
    ? `${value.slice(0, max - 1).trimEnd()}…`
    : value;

/**
 * Taille du titre selon sa longueur.
 *
 * Une taille fixe déborde de la carte sur un titre long, ou laisse un vide sur
 * un titre court. Les paliers sont larges à dessein : deux titres de longueurs
 * voisines doivent rendre pareil, sinon les cartes d'une même rubrique n'ont
 * plus l'air d'une famille.
 */
export const ogTitleSize = (title: string): number => {
  if (title.length > 60) {
    return 54;
  }
  if (title.length > 38) {
    return 66;
  }

  return 78;
};

/**
 * Découpe une ligne de méta en segments affichables.
 *
 * Le format d'entrée est libre — « 8 min · 12 août 2026 », une stack séparée par
 * des virgules — et le séparateur visuel appartient au gabarit, pas à l'appelant.
 */
export const ogMetaParts = (meta: string | null): string[] =>
  (meta ?? "")
    .split(/[·,]/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);
