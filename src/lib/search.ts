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
  /** correspondance approchée dans le texte indexé */
  fuzzyContent: 0.2,
  /** correspondance approchée dans le titre */
  fuzzyTitle: 0.45,
  none: 0,
  /** la requête apparaît dans le titre */
  title: 0.9,
} as const;

/** tout ce qui n'est ni lettre ni chiffre sépare deux mots */
const WORD_SEPARATOR = /[^\p{L}\p{N}]+/u;

const words = (value: string): string[] =>
  normalize(value).split(WORD_SEPARATOR).filter(Boolean);

/**
 * Nombre de fautes tolérées selon la longueur du mot cherché.
 *
 * En dessous de quatre caractères, AUCUNE : à une faute près, « css » couvre
 * « cs », « css », « csv », « css » et une dizaine d'autres mots courts du
 * texte. La tolérance sur un mot court ne rapproche pas le bon résultat, elle
 * noie la liste.
 */
const tolerance = (length: number): number => {
  if (length >= 8) {
    return 2;
  }

  return length >= 4 ? 1 : 0;
};

/**
 * Distance d'édition avec TRANSPOSITION (alignement optimal de chaînes).
 *
 * La transposition n'est pas un raffinement théorique : c'est la faute de frappe
 * la plus courante, celle de deux lettres inversées. « tailwnid » pour
 * « tailwind » est à une transposition — mais à DEUX opérations pour une
 * Levenshtein classique, qui devrait supprimer puis réinsérer. Avec un seuil de
 * une faute, la variante classique ne rapprocherait donc pas le mot que
 * l'utilisateur croit avoir tapé.
 */
export const editDistance = (left: string, right: string): number => {
  const rows = left.length;
  const columns = right.length;

  if (rows === 0) {
    return columns;
  }
  if (columns === 0) {
    return rows;
  }

  let beforePrevious: number[] = [];
  let previous: number[] = Array.from(
    { length: columns + 1 },
    (_, index) => index
  );

  for (let row = 1; row <= rows; row += 1) {
    const current: number[] = Array.from({
      length: columns + 1,
    });
    current[0] = row;

    for (let column = 1; column <= columns; column += 1) {
      const substitution =
        left[row - 1] === right[column - 1] ? 0 : 1;

      current[column] = Math.min(
        previous[column] + 1,
        current[column - 1] + 1,
        previous[column - 1] + substitution
      );

      const isTransposition =
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1];

      if (isTransposition) {
        current[column] = Math.min(
          current[column],
          beforePrevious[column - 2] + 1
        );
      }
    }

    beforePrevious = previous;
    previous = current;
  }

  return previous[columns];
};

const matchesWord = (
  candidates: string[],
  token: string
): boolean => {
  const max = tolerance(token.length);

  return candidates.some((candidate) => {
    if (candidate.includes(token)) {
      return true;
    }

    // l'écart de longueur borne la distance par le bas : le test évite la
    // majorité des calculs, qui sont quadratiques
    return (
      max > 0 &&
      Math.abs(candidate.length - token.length) <= max &&
      editDistance(candidate, token) <= max
    );
  });
};

/**
 * Correspondance approchée : chaque mot de la requête doit se retrouver, à une
 * ou deux fautes près, dans le texte.
 *
 * Le découpage en mots a un second effet, assumé : l'ORDRE des mots cesse de
 * compter. « css tailwind » ne trouvait rien sur un texte disant « tailwind et
 * css », parce que la requête entière était cherchée comme sous-chaîne. Ces
 * correspondances tombent dans le même palier que les fautes de frappe — elles
 * sont utiles, mais moins sûres qu'une correspondance exacte.
 */
export const fuzzyMatches = (
  haystack: string,
  query: string
): boolean => {
  const tokens = words(query);

  if (tokens.length === 0 || !haystack) {
    return false;
  }

  const candidates = words(haystack);

  return tokens.every((token) => matchesWord(candidates, token));
};

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

  if (haystack && normalize(haystack).includes(needle)) {
    return SCORES.content;
  }

  /**
   * Les paliers approchés viennent APRÈS, et valent moins que n'importe quelle
   * correspondance exacte.
   *
   * L'ordre est le contrat : une correspondance tolérante ne déplace jamais un
   * résultat exact. Sans cette garantie, une faute de frappe sur un mot du titre
   * d'un article pourrait faire remonter cet article devant celui qui contient
   * réellement le mot cherché — et la recherche deviendrait imprévisible pour
   * gagner sur un cas rare.
   */
  if (fuzzyMatches(title, query)) {
    return SCORES.fuzzyTitle;
  }

  return fuzzyMatches(haystack, query)
    ? SCORES.fuzzyContent
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
