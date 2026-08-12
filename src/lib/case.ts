/**
 * Conversions de casse et translittération en slug.
 *
 * Le découpage est fait une fois, en mots, puis chaque casse se contente de
 * recoller — sinon chaque conversion réinvente sa propre gestion des accents,
 * des acronymes et de la ponctuation, et elles finissent par divergent sur les
 * cas limites.
 */

const DIACRITICS = /\p{Diacritic}/gu;
const NON_ALPHANUMERIC = /[^a-z0-9]+/gu;
const EDGE_DASHES = /^-+|-+$/gu;

/** minuscules sans diacritiques : « Réseau » devient « reseau » */
const deburr = (value: string): string =>
  value.toLowerCase().normalize("NFD").replaceAll(DIACRITICS, "");

/**
 * Frontières de mots, dans l'ordre d'application :
 * acronyme suivi d'un mot (HTTPServer → HTTP Server), minuscule ou chiffre
 * suivi d'une majuscule (camelCase → camel Case), lettre suivie d'un chiffre.
 */
const BOUNDARIES: [RegExp, string][] = [
  [/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, "$1 $2"],
  [/([\p{Ll}\d])(\p{Lu})/gu, "$1 $2"],
  [/(\p{L})(\d)/gu, "$1 $2"],
];

const SEPARATORS = /[\s_\-.,/\\:;!?'"()[\]{}]+/u;

/**
 * Découpe une chaîne en mots, quelle que soit la casse d'origine.
 *
 * Les accents ne sont retirés qu'après le découpage : sinon « Élément » perdrait
 * sa majuscule initiale et deviendrait un seul mot indistinct de « élément ».
 */
export const toWords = (value: string): string[] => {
  let spaced = value;
  for (const [pattern, replacement] of BOUNDARIES) {
    spaced = spaced.replace(pattern, replacement);
  }

  return spaced
    .split(SEPARATORS)
    .map((word) => deburr(word))
    .map((word) => word.replaceAll(NON_ALPHANUMERIC, ""))
    .filter((word) => word.length > 0);
};

const capitalize = (word: string): string =>
  word.charAt(0).toUpperCase() + word.slice(1);

export const toCamelCase = (value: string): string => {
  const [first, ...rest] = toWords(value);
  if (!first) {
    return "";
  }
  return [first, ...rest.map(capitalize)].join("");
};

export const toPascalCase = (value: string): string =>
  toWords(value).map(capitalize).join("");

export const toSnakeCase = (value: string): string =>
  toWords(value).join("_");

export const toKebabCase = (value: string): string =>
  toWords(value).join("-");

export const toConstantCase = (value: string): string =>
  toWords(value).join("_").toUpperCase();

export const toTitleCase = (value: string): string =>
  toWords(value).map(capitalize).join(" ");

export const toSentenceCase = (value: string): string => {
  const words = toWords(value);
  const [first] = words;
  if (!first) {
    return "";
  }
  return [capitalize(first), ...words.slice(1)].join(" ");
};

/**
 * Segment d'URL : minuscules, sans accent, mots séparés par un tiret.
 *
 * Volontairement plus agressif que le découpage en mots : la ponctuation devient
 * un séparateur plutôt que d'être supprimée, pour que « a/b » donne « a-b » et
 * non « ab ».
 */
export const slugify = (value: string): string =>
  deburr(value)
    .replaceAll(NON_ALPHANUMERIC, "-")
    .replaceAll(EDGE_DASHES, "");

export const CASE_FORMATS = [
  "camel",
  "pascal",
  "snake",
  "kebab",
  "constant",
  "title",
  "sentence",
  "slug",
  "upper",
  "lower",
] as const;

export type CaseFormat = (typeof CASE_FORMATS)[number];

const CONVERTERS: Record<CaseFormat, (value: string) => string> = {
  camel: toCamelCase,
  constant: toConstantCase,
  kebab: toKebabCase,
  lower: (value) => value.toLowerCase(),
  pascal: toPascalCase,
  sentence: toSentenceCase,
  slug: slugify,
  snake: toSnakeCase,
  title: toTitleCase,
  upper: (value) => value.toUpperCase(),
};

export const convertCase = (
  value: string,
  format: CaseFormat
): string => CONVERTERS[format](value);

/**
 * Applique une conversion ligne à ligne.
 *
 * Une conversion sur le texte entier fusionnerait toutes les lignes en un seul
 * identifiant, ce qui rend l'outil inutilisable pour convertir une liste.
 */
export const convertLines = (
  value: string,
  format: CaseFormat
): string =>
  value
    .split("\n")
    .map((line) =>
      line.trim() ? convertCase(line, format) : line.trim()
    )
    .join("\n");
