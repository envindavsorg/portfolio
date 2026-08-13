// import de TYPES uniquement depuis `content` : ce module doit rester pur
// (testable sans entraîner le pipeline MDX ni le registre de composants).
// `tags` n'entame pas cette propriété — il ne dépend que de `case`.
import type { Content, ContentCategory } from "@/lib/content";
import { tagLabel } from "@/lib/tags";

/**
 * Entrée d'index de recherche : tout ce dont la palette ⌘K a besoin, et rien
 * de plus.
 *
 * La navbar passait auparavant les objets `Content` complets au composant
 * client — donc le corps MDX intégral de CHAQUE article dans le payload RSC de
 * CHAQUE page, pour n'utiliser au final que le titre. On sérialise désormais un
 * index compact, qui pèse moins tout en permettant une recherche plein texte.
 */
export interface SearchDoc {
  slug: string;
  category: ContentCategory;
  title: string;
  description: string;
  tags: string[];
  /** titres de sections, pour retrouver un passage précis */
  headings: string[];
  /** début du contenu en texte brut */
  excerpt: string;
}

const EXCERPT_LENGTH = 400;
const MAX_HEADINGS = 12;

const ATX_HEADING = /^#{1,6}\s+(.+)$/gmu;

const STRIP_PATTERNS: [RegExp, string][] = [
  // blocs de code : bruit pur pour une recherche de contenu
  [/```[\s\S]*?```/gu, " "],
  [/`[^`]*`/gu, " "],
  // composants MDX et HTML brut
  [/<[^>]+>/gu, " "],
  // images puis liens, en gardant le libellé du lien
  [/!\[[^\]]*\]\([^)]*\)/gu, " "],
  [/\[([^\]]*)\]\([^)]*\)/gu, "$1"],
  // emphase, titres, citations, puces
  [/[*_~>#]+/gu, " "],
  [/^\s*[-+]\s+/gmu, " "],
  // entités et espaces résiduels
  [/&[a-z]+;/giu, " "],
  [/\s+/gu, " "],
];

/** transforme du MDX en texte brut lisible pour la recherche */
export const toPlainText = (mdx: string): string => {
  let text = mdx;
  for (const [pattern, replacement] of STRIP_PATTERNS) {
    text = text.replace(pattern, replacement);
  }
  return text.trim();
};

const extractHeadings = (mdx: string): string[] =>
  [...mdx.matchAll(ATX_HEADING)]
    .map(([, heading]) => toPlainText(heading))
    .filter((heading) => heading.length > 0)
    .slice(0, MAX_HEADINGS);

export const toSearchDoc = (content: Content): SearchDoc => {
  const plain = toPlainText(content.content);

  return {
    category: content.metadata.category ?? "articles",
    description: content.metadata.description,
    excerpt: plain.slice(0, EXCERPT_LENGTH),
    headings: extractHeadings(content.content),
    slug: content.slug,
    /**
     * Les LIBELLÉS, pas les clés.
     *
     * Un tag est une clé française (voir `tags.ts`). Indexer la clé telle quelle
     * rendait le sujet introuvable dans sa propre langue : sur /en, chercher
     * « career » ne rapprochait aucun tag, et la liste des résultats affichait
     * « #carrière » à un lecteur anglophone.
     *
     * Sans risque de confusion avec les URL : ces tags ne sont qu'affichés et
     * indexés, aucun slug n'en est dérivé — un slug calculé depuis « career »
     * pointerait vers une page qui n'existe pas.
     */
    tags: (content.metadata.tags ?? []).map((tag) =>
      tagLabel(tag, content.locale)
    ),
    title: content.metadata.title,
  };
};

/**
 * Normalise pour comparer : minuscules et sans diacritiques, afin que
 * « réseau » se trouve en tapant « reseau ».
 */
export const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "");

/** texte indexé d'un document, concaténé une seule fois */
export const searchableText = (doc: SearchDoc): string =>
  normalize(
    [
      doc.title,
      doc.description,
      doc.category,
      ...doc.tags,
      ...doc.headings,
      doc.excerpt,
    ].join(" ")
  );

export const SCORES = {
  /** la requête apparaît dans le texte indexé */
  content: 0.5,
  /** le titre est exactement la requête */
  exactTitle: 1,
  none: 0,
  /** la requête apparaît dans le titre */
  title: 0.9,
} as const;

/**
 * Pertinence d'un document pour une requête.
 *
 * Les titres passent devant le contenu : trouver un mot dans le corps d'un
 * article est utile, mais quand le titre correspond c'est presque toujours le
 * résultat attendu. La comparaison est insensible aux accents des deux côtés.
 *
 * Cette fonction est le point de partage entre la palette ⌘K et la page de
 * recherche : deux classements différents pour la même requête seraient
 * déroutants, et la palette perdrait sa raison d'être de raccourci.
 */
export const scoreText = (
  title: string,
  haystack: string,
  query: string
): number => {
  const needle = normalize(query.trim());
  if (!needle) {
    return SCORES.exactTitle;
  }

  const normalizedTitle = normalize(title);
  if (normalizedTitle === needle) {
    return SCORES.exactTitle;
  }
  if (normalizedTitle.includes(needle)) {
    return SCORES.title;
  }

  return haystack && normalize(haystack).includes(needle)
    ? SCORES.content
    : SCORES.none;
};

export const scoreDoc = (doc: SearchDoc, query: string): number =>
  scoreText(doc.title, searchableText(doc), query);

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

/**
 * Documents correspondant à la requête, du plus pertinent au moins pertinent.
 *
 * À score égal l'ordre d'entrée est conservé — `getAllContent` trie par date
 * décroissante, donc le plus récent sort en premier, ce qui est le bon
 * départage par défaut.
 */
export const searchDocs = (
  docs: SearchDoc[],
  query: string
): SearchHit[] =>
  docs
    .map((doc) => ({ doc, score: scoreDoc(doc, query) }))
    .filter(({ score }) => score > SCORES.none)
    .toSorted((left, right) => right.score - left.score);
