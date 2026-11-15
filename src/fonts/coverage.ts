import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Ce que les polices du site doivent savoir dessiner, calculé et non deviné.
 *
 * Partagé par `src/scripts/subset-fonts.ts`, qui taille les polices, et par
 * `coverage.test.ts`, qui refuse qu'un caractère ajouté plus tard reste sans
 * glyphe. Aucun module de l'application n'importe ce fichier : il lit le
 * disque.
 */

interface FontCoverage {
  bytes: number;
  codePoints: string[];
  sha256: string;
  source: {
    bytes: number;
    codePoints: string[];
    file: string;
    sha256: string;
  };
}

export type CoverageFile = Record<string, FontCoverage>;

export interface Inventory {
  code: Set<number>;
  content: Set<number>;
  messages: Set<number>;
}

type Span = readonly [first: number, last: number];

/** Latin de base, supplément Latin-1, latin étendu A : gardés en entier. */
const BASE: readonly Span[] = [
  [0x20, 0x7e],
  [0xa0, 0xff],
  [0x01_00, 0x01_7f],
];

/** Ce que le rendu produit sans que les sources le contiennent. */
const RENDERED: readonly Span[] = [
  // insécable : remark-french-spacing, Intl (« 12 % »)
  [0xa0, 0xa0],
  // insécable fine : remark-french-spacing, Intl (« 1 234 », « 3:45 PM »)
  [0x20_2f, 0x20_2f],
  // traits d'union et tirets
  [0x20_10, 0x20_15],
  // guillemets typographiques, simples et doubles
  [0x20_18, 0x20_1f],
  // puce, points de suspension
  [0x20_22, 0x20_22],
  [0x20_26, 0x20_26],
  // guillemets simples en chevron
  [0x20_39, 0x20_3a],
  // signe moins et infini d'Intl
  [0x22_12, 0x22_12],
  [0x22_1e, 0x22_1e],
  // flèches des raccourcis clavier
  [0x21_90, 0x21_93],
  // retour, majuscule, tabulation
  [0x21_b5, 0x21_b5],
  [0x21_e5, 0x21_e5],
  [0x21_e7, 0x21_e7],
  // contrôle, commande, option, effacement, échappement
  [0x23_03, 0x23_03],
  [0x23_18, 0x23_18],
  [0x23_25, 0x23_25],
  [0x23_2b, 0x23_2b],
  [0x23_8b, 0x23_8b],
];

/**
 * Fonctions OpenType gardées ; les autres partent avec leurs glyphes de
 * rechange (`aalt`, `ss01` à `ss11`, `sups`, `subs`, `sinf`, `case`, `dlig`),
 * soit 12 Kio sur Geist Mono à elle seule. Sont gardées celles qu'un
 * navigateur applique d'office, les fractions que HarfBuzz compose seul autour
 * de U+2044, et celles qu'un utilitaire numérique de Tailwind allume — une
 * seule sert aujourd'hui (`tabular-nums`), les autres sont à une classe près.
 *
 * Une déclaration explicite (réglage de fonctions, variante de police) n'est
 * pas couverte par cette liste : `coverage.test.ts` la refuse tant que sa
 * fonction n'est pas ajoutée ici.
 */
export const KEPT_FEATURES = [
  "calt",
  "ccmp",
  "clig",
  "curs",
  "dist",
  "kern",
  "liga",
  "locl",
  "mark",
  "mkmk",
  "rclt",
  "rlig",
  "rvrn",
  "dnom",
  "frac",
  "numr",
  "afrc",
  "lnum",
  "onum",
  "ordn",
  "pnum",
  "tnum",
  "zero",
] as const;

/**
 * Entités nommées qu'un fichier TSX ou MDX peut écrire. Les inconnues sont
 * laissées telles quelles : `&x;` est aussi du C dans un bloc de code.
 */
const ENTITIES: Record<string, number> = {
  amp: 0x26,
  apos: 0x27,
  bull: 0x20_22,
  copy: 0xa9,
  darr: 0x21_93,
  deg: 0xb0,
  euro: 0x20_ac,
  ge: 0x22_65,
  gt: 0x3e,
  hellip: 0x20_26,
  laquo: 0xab,
  larr: 0x21_90,
  ldquo: 0x20_1c,
  le: 0x22_64,
  lsquo: 0x20_18,
  lt: 0x3c,
  mdash: 0x20_14,
  middot: 0xb7,
  minus: 0x22_12,
  nbsp: 0xa0,
  ndash: 0x20_13,
  ne: 0x22_60,
  quot: 0x22,
  raquo: 0xbb,
  rarr: 0x21_92,
  rdquo: 0x20_1d,
  rsquo: 0x20_19,
  times: 0xd7,
  trade: 0x21_22,
  uarr: 0x21_91,
};

/**
 * La dernière branche est l'échappement CSS (`content: "\21A9"`,
 * `after:content-['\\2192']`) : c'est la façon ordinaire d'écrire un caractère
 * dans une feuille de style, et sans elle il entrait dans le site sans entrer
 * dans les polices. Trois chiffres au moins : en dessous tout est dans le
 * latin gardé en entier, et `\d`, `\b` suivis d'une lettre ne sont plus pris
 * pour un caractère. Un faux positif ne coûte rien — il faut que la source le
 * dessine pour qu'il compte.
 */
const ESCAPE =
  /\\u(d[89ab][0-9a-f]{2})\\u(d[c-f][0-9a-f]{2})|\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|\\x([0-9a-f]{2})|&#x([0-9a-f]{1,6});|&#(\d{1,7});|&([a-z][a-z0-9]*);|\\{1,2}([0-9a-f]{3,6})(?![0-9a-f])/giu;

const SURROGATE_BASE = 0xd8_00;
const LOW_SURROGATE_BASE = 0xdc_00;
const ASTRAL_BASE = 0x1_00_00;

const escapedCodePoint = (
  match: RegExpMatchArray
): number | undefined => {
  const [
    ,
    high,
    low,
    braced,
    four,
    two,
    hexEntity,
    decEntity,
    named,
    css,
  ] = match;

  if (high && low) {
    return (
      ASTRAL_BASE +
      (Number.parseInt(high, 16) - SURROGATE_BASE) * 0x4_00 +
      (Number.parseInt(low, 16) - LOW_SURROGATE_BASE)
    );
  }

  const hex = braced ?? four ?? two ?? hexEntity ?? css;
  if (hex) {
    return Number.parseInt(hex, 16);
  }
  if (decEntity) {
    return Number.parseInt(decEntity, 10);
  }
  return named ? ENTITIES[named] : undefined;
};

/** ni caractère de contrôle, ni demi-paire, ni hors d'Unicode */
const isDrawable = (codePoint: number): boolean =>
  codePoint >= 0x20 &&
  !(codePoint >= 0x7f && codePoint < 0xa0) &&
  !(codePoint >= SURROGATE_BASE && codePoint <= 0xdf_ff) &&
  codePoint <= 0x10_ff_ff;

/**
 * Les points de code d'un texte : ceux qui y sont écrits, et ceux que ses
 * échappements (` `, `&nbsp;`, `&#8594;`, `\2192` en CSS) désignent.
 */
export const drawnCodePoints = (text: string): Set<number> => {
  const codePoints = new Set<number>();
  const add = (codePoint: number | undefined) => {
    if (codePoint !== undefined && isDrawable(codePoint)) {
      codePoints.add(codePoint);
    }
  };

  for (const char of text) {
    add(char.codePointAt(0));
  }
  for (const match of text.matchAll(ESCAPE)) {
    add(escapedCodePoint(match));
  }

  return codePoints;
};

const hex = (codePoint: number): string =>
  codePoint.toString(16).toUpperCase().padStart(4, "0");

export const formatCodePoint = (codePoint: number): string =>
  `U+${hex(codePoint)}`;

export const toRanges = (codePoints: Iterable<number>): string[] => {
  const spans: [number, number][] = [];

  for (const codePoint of [...new Set(codePoints)].sort(
    (a, b) => a - b
  )) {
    const last = spans.at(-1);
    if (last && last[1] === codePoint - 1) {
      last[1] = codePoint;
    } else {
      spans.push([codePoint, codePoint]);
    }
  }

  return spans.map(([first, last]) =>
    first === last ? hex(first) : `${hex(first)}-${hex(last)}`
  );
};

export const fromRanges = (
  ranges: readonly string[]
): Set<number> => {
  const codePoints = new Set<number>();

  for (const range of ranges) {
    const [first = "", last = first] = range.split("-");
    const end = Number.parseInt(last, 16);
    for (
      let codePoint = Number.parseInt(first, 16);
      codePoint <= end;
      codePoint += 1
    ) {
      codePoints.add(codePoint);
    }
  }

  return codePoints;
};

const filesUnder = (
  directory: string,
  keep: (path: string) => boolean
): string[] =>
  readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .filter(keep)
    .sort();

/**
 * Ni le code généré, ni ce dossier, ni les scripts : rien de tout cela n'est
 * dessiné, et un caractère cité ici en exemple entrerait dans les polices.
 */
const NEVER_DRAWN =
  /^src\/(?:paraglide|__registry__|fonts|scripts)\//u;
const CODE = /\.(?:tsx?|css)$/u;
const TEST = /\.test\.tsx?$/u;

const codePointsOfFiles = (paths: readonly string[]): Set<number> => {
  const codePoints = new Set<number>();

  for (const path of paths) {
    for (const codePoint of drawnCodePoints(
      readFileSync(path, "utf-8")
    )) {
      codePoints.add(codePoint);
    }
  }

  return codePoints;
};

const isCode = (path: string): boolean => {
  const normalized = path.replaceAll("\\", "/");
  return (
    CODE.test(normalized) &&
    !TEST.test(normalized) &&
    !NEVER_DRAWN.test(normalized)
  );
};

const isContent = (path: string): boolean => path.endsWith(".mdx");

/** Les fichiers de code, ceux où une règle de style s'écrit. */
export const codeSources = (): string[] => filesUnder("src", isCode);

/**
 * Tout texte du dépôt qui peut finir à l'écran : les messages, les contenus
 * MDX, et le code (données en dur, `content:` des feuilles de style). Les
 * chemins sont relatifs à la racine du dépôt, d'où le script et Vitest sont
 * lancés.
 */
export const readInventory = (): Inventory => ({
  code: codePointsOfFiles(codeSources()),
  content: codePointsOfFiles(filesUnder("src/content", isContent)),
  messages: codePointsOfFiles(
    filesUnder("messages", (path) => path.endsWith(".json"))
  ),
});

const codePointsOfString = (text: string): number[] =>
  [...text].flatMap((char) => char.codePointAt(0) ?? []);

/**
 * Ce qu'une police garde si sa source le possède : le latin en entier, ce
 * que le rendu ajoute, chaque point de code de l'inventaire, et ce que
 * `text-transform` en fait — « µ » en capitales est un mu grec.
 */
export const wantedCodePoints = (
  inventory: Inventory
): Set<number> => {
  const written = new Set<number>([
    ...inventory.code,
    ...inventory.content,
    ...inventory.messages,
  ]);

  for (const [first, last] of [...BASE, ...RENDERED]) {
    for (let codePoint = first; codePoint <= last; codePoint += 1) {
      written.add(codePoint);
    }
  }

  const wanted = new Set(written);
  for (const codePoint of written) {
    const char = String.fromCodePoint(codePoint);
    for (const cased of codePointsOfString(
      char.toUpperCase() + char.toLowerCase()
    )) {
      wanted.add(cased);
    }
  }

  return wanted;
};

/** La décomposition canonique d'un point de code, vide s'il n'en a pas. */
const decompose = (codePoint: number): number[] => {
  const parts = codePointsOfString(
    String.fromCodePoint(codePoint).normalize("NFD")
  );
  return parts.length > 1 ? parts : [];
};

/**
 * Une police dessine aussi un caractère qu'elle n'a pas, quand elle a sa
 * lettre de base et son accent combinant : le navigateur le décompose. Les
 * sources n'ont pas « ĕ », elles ont « e » et la brève — retirer la brève
 * envoyait six lettres du latin étendu A à la police du système, ce que la
 * comparaison de rendu a vu.
 */
export const canDraw = (
  codePoints: ReadonlySet<number>,
  codePoint: number
): boolean => {
  if (codePoints.has(codePoint)) {
    return true;
  }
  const parts = decompose(codePoint);
  return (
    parts.length > 0 && parts.every((part) => codePoints.has(part))
  );
};

/** Ce qu'il faut garder de la source pour dessiner `wanted` comme elle. */
export const keptCodePoints = (
  wanted: Iterable<number>,
  source: ReadonlySet<number>
): Set<number> => {
  const kept = new Set<number>();

  for (const codePoint of wanted) {
    if (source.has(codePoint)) {
      kept.add(codePoint);
    } else if (canDraw(source, codePoint)) {
      for (const part of decompose(codePoint)) {
        kept.add(part);
      }
    }
  }

  return kept;
};
