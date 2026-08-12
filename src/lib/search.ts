// import de TYPES uniquement : ce module doit rester pur (testable sans
// entraîner le pipeline MDX ni le registre de composants)
import type { Content, ContentCategory } from "@/lib/content";

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
    tags: content.metadata.tags ?? [],
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
