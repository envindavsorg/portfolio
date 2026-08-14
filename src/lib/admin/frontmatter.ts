/**
 * Réécrire du MDX sans l'abîmer.
 *
 * Module PUR : il prend un document et rend une chaîne, sans toucher au disque
 * ni au réseau. C'est le seul code du dépôt capable de RÉÉCRIRE les 44 fichiers
 * de contenu, donc le seul dont une erreur se propage à tout le site — d'où le
 * test aller-retour à côté.
 *
 * ⚠️ POURQUOI PAS `gray-matter.stringify` NI js-yaml.
 *
 * Les deux reformatent tout : un `createdAt: 2026-03-03` relu par
 * `z.coerce.date()` devient un objet `Date`, et le resérialiser rend
 * `2026-03-03T00:00:00.000Z`. Or `assertValidDates` dans `content.ts` n'accepte
 * qu'un jour réel au format `YYYY-MM-DD` — précisément parce que la coercition
 * de Zod transformait silencieusement `2026-02-30` en 2 mars et mélangeait
 * l'ordre de tri. Une sauvegarde depuis l'administration aurait donc réécrit
 * chaque date dans un format que le site refuse ensuite de lire.
 *
 * Ce sérialiseur écrit donc les dates en jour nu, garde l'ordre de champs du
 * dépôt, et n'entoure de guillemets que ce qui l'exige.
 */

export type FrontmatterValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export type Frontmatter = Record<string, FrontmatterValue>;

export interface MdxDocument {
  frontmatter: Frontmatter;
  body: string;
}

/**
 * L'ordre des champs, celui qu'utilisent déjà les fichiers du dépôt.
 *
 * Sans ordre imposé, une sauvegarde réordonnerait le frontmatter selon l'ordre
 * d'insertion de l'objet et produirait un diff illisible sur un fichier dont
 * rien n'a changé sémantiquement.
 */
const FIELD_ORDER = [
  "title",
  "description",
  "image",
  "cover",
  "bannerLight",
  "bannerDark",
  "category",
  "createdAt",
  "updatedAt",
  "series",
  "seriesName",
  "seriesOrder",
  "tags",
  "author",
  "isNew",
] as const;

const DAY = /^\d{4}-\d{2}-\d{2}$/u;

/** un jour réel, pas seulement un motif qui y ressemble */
export const isRealDay = (value: string): boolean => {
  if (!DAY.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * Un jour au format `YYYY-MM-DD`, quelle que soit la forme reçue.
 *
 * Les composants d'édition manipulent des chaînes, mais `content.ts` rend des
 * `Date` : les deux doivent aboutir au même jour nu. On passe par les
 * composantes UTC, pas par `toISOString().slice(0, 10)` sur une date locale, qui
 * décale d'un jour à l'est de Greenwich le soir.
 */
export const toDay = (value: Date | string): string => {
  if (typeof value === "string") {
    return value.trim().slice(0, 10);
  }

  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const DATE_FIELDS = new Set(["createdAt", "updatedAt"]);

/**
 * Guillemets seulement quand il en faut.
 *
 * Une chaîne YAML sans guillemets casse dès qu'elle commence par un caractère
 * d'indicateur, contient `: `, ` #`, ou pourrait se relire comme un nombre ou un
 * booléen. En mettre partout serait sûr mais produirait un diff sur les 44
 * fichiers au premier enregistrement.
 */
const needsQuotes = (value: string): boolean => {
  if (value === "") {
    return true;
  }
  if (value.trim() !== value) {
    return true;
  }
  if (/^[-?:,[\]{}#&*!|>'"%@`]/u.test(value)) {
    return true;
  }
  if (value.includes(": ") || value.includes(" #")) {
    return true;
  }
  if (value.includes("\n")) {
    return true;
  }
  // se relirait comme autre chose qu'une chaîne
  return /^(true|false|null|~|-?\d+(\.\d+)?)$/iu.test(value);
};

const quote = (value: string): string =>
  `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

const scalar = (value: string): string =>
  needsQuotes(value) ? quote(value) : value;

const serializeValue = (
  key: string,
  value: FrontmatterValue
): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    // tableau EN LIGNE, comme dans les fichiers existants — un bloc à tirets
    // serait valide mais réécrirait chaque fichier
    return value.length === 0
      ? null
      : `[${value.map((entry) => quote(entry)).join(", ")}]`;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }

  return DATE_FIELDS.has(key) ? toDay(value) : scalar(value);
};

/** le document complet, frontmatter puis corps */
export const serializeMdx = (document: MdxDocument): string => {
  const known = FIELD_ORDER.filter((key) =>
    Object.hasOwn(document.frontmatter, key)
  );
  // un champ inconnu n'est pas perdu : il est écrit après les champs connus,
  // dans un ordre stable
  const extra = Object.keys(document.frontmatter)
    .filter((key) => !FIELD_ORDER.includes(key as never))
    .sort();

  const lines: string[] = [];

  for (const key of [...known, ...extra]) {
    const serialized = serializeValue(key, document.frontmatter[key]);

    if (serialized !== null) {
      lines.push(`${key}: ${serialized}`);
    }
  }

  // un corps est toujours séparé du frontmatter par une ligne vide, et le
  // fichier se termine par un saut de ligne
  const body = document.body
    .replace(/^\n+/u, "")
    .replace(/\s+$/u, "");

  return `---\n${lines.join("\n")}\n---\n\n${body}\n`;
};
