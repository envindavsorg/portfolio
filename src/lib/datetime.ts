/**
 * Conversions entre horodatages Unix, ISO 8601 et dates lisibles, avec fuseaux.
 *
 * Toutes les fonctions prennent leur instant de référence en paramètre : une
 * lecture cachée de l'horloge rendrait la logique intestable et le rendu non
 * déterministe entre le serveur et le client.
 */

export const TIME_ZONES = [
  "UTC",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export type TimeZone = (typeof TIME_ZONES)[number];

export type TimestampKind =
  | "unix-seconds"
  | "unix-millis"
  | "iso"
  | "invalid";

export interface DetectedTimestamp {
  kind: TimestampKind;
  date: Date | null;
}

const DIGITS_ONLY = /^-?\d+$/u;
const MILLIS_DIGITS = 12;
const MILLIS_IN_SECOND = 1000;

/**
 * Devine ce qu'on vient de coller.
 *
 * Le nombre de chiffres départage secondes et millisecondes : c'est la seule
 * heuristique fiable, puisque les deux sont de simples entiers. Douze chiffres
 * ou plus valent des millisecondes — un horodatage en secondes n'atteindra pas
 * cette longueur avant l'an 33 658.
 */
export const detectTimestamp = (input: string): DetectedTimestamp => {
  const value = input.trim();

  if (!value) {
    return { date: null, kind: "invalid" };
  }

  if (DIGITS_ONLY.test(value)) {
    const digits = value.replace("-", "").length;
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return { date: null, kind: "invalid" };
    }

    const isMillis = digits >= MILLIS_DIGITS;
    const date = new Date(
      isMillis ? numeric : numeric * MILLIS_IN_SECOND
    );

    if (Number.isNaN(date.getTime())) {
      return { date: null, kind: "invalid" };
    }

    return {
      date,
      kind: isMillis ? "unix-millis" : "unix-seconds",
    };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: null, kind: "invalid" };
  }

  return { date: parsed, kind: "iso" };
};

export const toUnixSeconds = (date: Date): number =>
  Math.floor(date.getTime() / MILLIS_IN_SECOND);

export const toUnixMillis = (date: Date): number => date.getTime();

export const toIsoString = (date: Date): string => date.toISOString();

/**
 * Date lisible dans un fuseau donné.
 *
 * Passe par `Intl.DateTimeFormat` plutôt que par un décalage en heures : les
 * fuseaux changent d'offset deux fois par an, et un décalage figé donne une
 * heure fausse la moitié de l'année.
 */
export const formatInZone = (
  date: Date,
  timeZone: string,
  locale = "fr-FR"
): string =>
  new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    timeZoneName: "short",
    year: "numeric",
  }).format(date);

/** décalage du fuseau à cette date, au format ±HH:MM */
export const zoneOffset = (date: Date, timeZone: string): string => {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).format(date);

  // « 11/14/2023, GMT+01:00 » → « +01:00 » ; UTC ressort en « GMT » sans offset
  const match = /GMT([+-]\d{2}:\d{2})/u.exec(formatted);
  return match?.[1] ?? "+00:00";
};

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86_400;
const MONTH = 2_592_000;
const YEAR = 31_536_000;

export interface RelativeParts {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
}

/**
 * Écart entre deux instants, réduit à l'unité la plus parlante.
 *
 * `now` est un paramètre : la même entrée doit toujours produire la même sortie,
 * sinon le test devient dépendant de l'heure à laquelle il tourne.
 */
export const toRelativeParts = (
  date: Date,
  now: Date
): RelativeParts => {
  const seconds = Math.round(
    (date.getTime() - now.getTime()) / MILLIS_IN_SECOND
  );
  const magnitude = Math.abs(seconds);

  if (magnitude < MINUTE) {
    return { unit: "second", value: seconds };
  }
  if (magnitude < HOUR) {
    return { unit: "minute", value: Math.round(seconds / MINUTE) };
  }
  if (magnitude < DAY) {
    return { unit: "hour", value: Math.round(seconds / HOUR) };
  }
  if (magnitude < MONTH) {
    return { unit: "day", value: Math.round(seconds / DAY) };
  }
  if (magnitude < YEAR) {
    return { unit: "month", value: Math.round(seconds / MONTH) };
  }

  return { unit: "year", value: Math.round(seconds / YEAR) };
};

export const formatRelative = (
  date: Date,
  now: Date,
  locale = "fr-FR"
): string => {
  const { value, unit } = toRelativeParts(date, now);
  return new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  }).format(value, unit);
};

const pad = (value: number): string => String(value).padStart(2, "0");

/** valeur pour un `<input type="datetime-local">`, dans le fuseau du navigateur */
export const toLocalInputValue = (date: Date): string =>
  [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
