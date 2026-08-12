/**
 * Analyse d'expressions cron à cinq champs et calcul des prochaines exécutions.
 *
 * Tout est interprété en **UTC**, comme le font la plupart des ordonnanceurs
 * (cron système, GitHub Actions, Vercel). Interpréter les champs dans un fuseau
 * local ouvrirait la question des changements d'heure : à un passage à l'heure
 * d'été, une exécution à 02:30 n'existe pas, et au passage à l'heure d'hiver elle
 * existe deux fois. Mieux vaut un modèle honnête et un affichage traduit qu'un
 * calcul qui prétend gérer un cas ambigu.
 */

export const CRON_FIELDS = [
  "minute",
  "hour",
  "dayOfMonth",
  "month",
  "dayOfWeek",
] as const;

export type CronFieldName = (typeof CRON_FIELDS)[number];

interface FieldRange {
  min: number;
  max: number;
  names?: Record<string, number>;
}

const MONTH_NAMES: Record<string, number> = {
  apr: 4,
  aug: 8,
  dec: 12,
  feb: 2,
  jan: 1,
  jul: 7,
  jun: 6,
  mar: 3,
  may: 5,
  nov: 11,
  oct: 10,
  sep: 9,
};

const DAY_NAMES: Record<string, number> = {
  fri: 5,
  mon: 1,
  sat: 6,
  sun: 0,
  thu: 4,
  tue: 2,
  wed: 3,
};

const RANGES: Record<CronFieldName, FieldRange> = {
  dayOfMonth: { max: 31, min: 1 },
  dayOfWeek: { max: 6, min: 0, names: DAY_NAMES },
  hour: { max: 23, min: 0 },
  minute: { max: 59, min: 0 },
  month: { max: 12, min: 1, names: MONTH_NAMES },
};

export interface CronField {
  /** valeurs qui déclenchent, triées */
  values: number[];
  /** le champ valait `*` : nécessaire pour la règle jour du mois / jour de semaine */
  isWildcard: boolean;
}

export type ParsedCron = Record<CronFieldName, CronField>;

export type CronResult =
  | { ok: true; cron: ParsedCron }
  | { ok: false; field: CronFieldName | null; reason: CronError };

export type CronError =
  | "field-count"
  | "empty"
  | "unknown-value"
  | "out-of-range"
  | "reversed-range"
  | "bad-step";

const SUNDAY_ALIAS = 7;

const readValue = (
  token: string,
  range: FieldRange
): number | null => {
  const named = range.names?.[token.toLowerCase()];
  if (named !== undefined) {
    return named;
  }

  if (!/^\d+$/u.test(token)) {
    return null;
  }

  const value = Number(token);

  // 7 pour dimanche est accepté partout : crontab(5) le documente
  if (range.names === DAY_NAMES && value === SUNDAY_ALIAS) {
    return 0;
  }

  return value;
};

const expandPart = (
  part: string,
  range: FieldRange
): { values: number[] } | { reason: CronError } => {
  const [spec = "", stepToken, ...extra] = part.split("/");

  if (extra.length > 0) {
    return { reason: "bad-step" };
  }

  let step = 1;
  if (stepToken !== undefined) {
    if (!/^\d+$/u.test(stepToken) || Number(stepToken) === 0) {
      return { reason: "bad-step" };
    }
    step = Number(stepToken);
  }

  let from = range.min;
  let to = range.max;

  if (spec !== "*") {
    const [startToken = "", endToken, ...rest] = spec.split("-");

    if (rest.length > 0) {
      return { reason: "unknown-value" };
    }

    const start = readValue(startToken, range);
    if (start === null) {
      return { reason: "unknown-value" };
    }

    if (endToken === undefined) {
      // une valeur seule avec un pas court jusqu'au maximum : « 5/10 » vaut
      // « 5-59/10 », conformément à crontab(5)
      from = start;
      to = stepToken === undefined ? start : range.max;
    } else {
      const end = readValue(endToken, range);
      if (end === null) {
        return { reason: "unknown-value" };
      }
      from = start;
      to = end;
    }
  }

  if (from < range.min || to > range.max) {
    return { reason: "out-of-range" };
  }

  if (from > to) {
    return { reason: "reversed-range" };
  }

  const values: number[] = [];
  for (let value = from; value <= to; value += step) {
    values.push(value);
  }

  return { values };
};

const parseField = (
  raw: string,
  name: CronFieldName
): CronField | CronError => {
  const range = RANGES[name];
  const parts = raw.split(",");
  const collected = new Set<number>();

  for (const part of parts) {
    if (!part) {
      return "empty";
    }

    const expanded = expandPart(part, range);
    if ("reason" in expanded) {
      return expanded.reason;
    }

    for (const value of expanded.values) {
      collected.add(value);
    }
  }

  if (collected.size === 0) {
    return "empty";
  }

  return {
    isWildcard: raw === "*",
    values: [...collected].toSorted((left, right) => left - right),
  };
};

export const parseCron = (expression: string): CronResult => {
  const tokens = expression.trim().split(/\s+/u).filter(Boolean);

  if (tokens.length === 0) {
    return { field: null, ok: false, reason: "empty" };
  }

  if (tokens.length !== CRON_FIELDS.length) {
    return { field: null, ok: false, reason: "field-count" };
  }

  const cron = {} as ParsedCron;

  for (const [index, name] of CRON_FIELDS.entries()) {
    const parsed = parseField(tokens[index] ?? "", name);

    if (typeof parsed === "string") {
      return { field: name, ok: false, reason: parsed };
    }

    cron[name] = parsed;
  }

  return { cron, ok: true };
};

const MILLIS_IN_MINUTE = 60_000;
/**
 * Garde-fou : une expression peut être valide et ne jamais se déclencher
 * (« 0 0 30 2 * » — le 30 février). Sans borne, la recherche tournerait sans fin.
 * Environ huit ans de minutes en sautant les mois et les jours non concernés.
 */
const MAX_ITERATIONS = 200_000;

const matchesDay = (cron: ParsedCron, date: Date): boolean => {
  const dayOfMonth = date.getUTCDate();
  const dayOfWeek = date.getUTCDay();

  const domMatches = cron.dayOfMonth.values.includes(dayOfMonth);
  const dowMatches = cron.dayOfWeek.values.includes(dayOfWeek);

  // règle de Vixie cron : si les DEUX champs sont restreints, l'exécution a lieu
  // dès que l'UN des deux correspond, et non les deux. C'est contre-intuitif et
  // c'est la source de bug la plus fréquente dans les expressions cron.
  if (!(cron.dayOfMonth.isWildcard || cron.dayOfWeek.isWildcard)) {
    return domMatches || dowMatches;
  }

  return domMatches && dowMatches;
};

/**
 * Prochaines exécutions après `from`, en UTC.
 *
 * Avance par sauts : mois non concerné, on passe au 1er du mois suivant ; jour
 * non concerné, au jour suivant ; heure non concernée, à l'heure suivante. Une
 * boucle minute par minute sur huit ans serait quatre millions d'itérations.
 */
export const nextRuns = (
  cron: ParsedCron,
  from: Date,
  count: number
): Date[] => {
  const runs: Date[] = [];

  // on part de la minute suivante : `from` lui-même n'est pas une occurrence future
  let cursor = new Date(
    Math.floor(from.getTime() / MILLIS_IN_MINUTE) * MILLIS_IN_MINUTE +
      MILLIS_IN_MINUTE
  );

  for (
    let iteration = 0;
    iteration < MAX_ITERATIONS && runs.length < count;
    iteration += 1
  ) {
    if (!cron.month.values.includes(cursor.getUTCMonth() + 1)) {
      cursor = new Date(
        Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)
      );
      continue;
    }

    if (!matchesDay(cron, cursor)) {
      cursor = new Date(
        Date.UTC(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth(),
          cursor.getUTCDate() + 1
        )
      );
      continue;
    }

    if (!cron.hour.values.includes(cursor.getUTCHours())) {
      cursor = new Date(
        Date.UTC(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth(),
          cursor.getUTCDate(),
          cursor.getUTCHours() + 1
        )
      );
      continue;
    }

    if (!cron.minute.values.includes(cursor.getUTCMinutes())) {
      cursor = new Date(cursor.getTime() + MILLIS_IN_MINUTE);
      continue;
    }

    runs.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + MILLIS_IN_MINUTE);
  }

  return runs;
};

export type FieldShape =
  | { kind: "every" }
  | { kind: "step"; step: number }
  | { kind: "single"; value: number }
  | { kind: "list"; values: number[] };

/**
 * Résume un champ pour l'affichage.
 *
 * Renvoie une forme structurée plutôt qu'une phrase : la description doit
 * exister dans les deux langues du site, et fabriquer la phrase ici imposerait
 * de dupliquer la traduction hors des messages Paraglide.
 */
export const describeField = (
  field: CronField,
  name: CronFieldName
): FieldShape => {
  const { max, min } = RANGES[name];
  const total = max - min + 1;

  if (field.values.length === total) {
    return { kind: "every" };
  }

  if (field.values.length === 1 && field.values[0] !== undefined) {
    return { kind: "single", value: field.values[0] };
  }

  const [first, second] = field.values;
  if (first !== undefined && second !== undefined) {
    const step = second - first;
    const isRegular =
      first === min &&
      field.values.every(
        (value, index) => value === min + index * step
      ) &&
      field.values.length === Math.ceil(total / step);

    if (isRegular) {
      return { kind: "step", step };
    }
  }

  return { kind: "list", values: field.values };
};

export const CRON_PRESETS = [
  "* * * * *",
  "*/5 * * * *",
  "0 * * * *",
  "0 9 * * 1-5",
  "30 3 1 * *",
  "0 0 * * 0",
] as const;
