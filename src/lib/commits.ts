import type { Dayjs } from "dayjs";

import { dayjs } from "@/lib/functions";
import { getLocale } from "@/paraglide/runtime";

const DEFAULT_MONTH_LABELS = [
  "jan.",
  "fév.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sep.",
  "oct.",
  "nov.",
  "déc.",
];

export const DEFAULT_LABELS: Labels = {
  legend: {
    less: "moins",
    more: "plus",
  },
  months: DEFAULT_MONTH_LABELS,
  totalCount: "{{count}} contributions en {{year}}",
  weekdays: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
};

const CONTRIBUTION_LEVEL_MAP: Record<ContributionLevel, number> = {
  FIRST_QUARTILE: 1,
  FOURTH_QUARTILE: 4,
  NONE: 0,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
};

export const contributionLevelToNumber = (
  level: ContributionLevel
): number => CONTRIBUTION_LEVEL_MAP[level];

export const eachDayOfInterval = (
  start: Dayjs,
  end: Dayjs
): Dayjs[] => {
  const days: Dayjs[] = [];
  let current = start;
  while (current.isBefore(end) || current.isSame(end, "day")) {
    days.push(current);
    current = current.add(1, "day");
  }
  return days;
};

export const nextDay = (
  date: Dayjs,
  targetWeekDay: WeekDay
): Dayjs => {
  const currentDay = date.day();
  const daysToAdd =
    targetWeekDay >= currentDay
      ? targetWeekDay - currentDay
      : 7 - currentDay + targetWeekDay;
  return date.add(daysToAdd, "day");
};

export const fillHoles = (
  activities: CommitActivity[]
): CommitActivity[] => {
  if (activities.length === 0) {
    return [];
  }

  const sorted = [...activities].toSorted((a, b) =>
    a.date.localeCompare(b.date)
  );
  const calendar = new Map(activities.map((a) => [a.date, a]));
  const [first] = sorted;
  const last = sorted.at(-1);

  if (!(first && last)) {
    return [];
  }

  return eachDayOfInterval(dayjs(first.date), dayjs(last.date)).map(
    (day) => {
      const date = day.format("YYYY-MM-DD");
      return calendar.get(date) ?? { count: 0, date, level: 0 };
    }
  );
};

export const groupByWeeks = (
  activities: CommitActivity[],
  weekStart: WeekDay = 0
): Week[] => {
  if (activities.length === 0) {
    return [];
  }

  const normalized = fillHoles(activities);
  const [firstNormalized] = normalized;
  if (!firstNormalized) {
    return [];
  }
  const firstDate = dayjs(firstNormalized.date);
  const firstCalendarDate =
    firstDate.day() === weekStart
      ? firstDate
      : nextDay(firstDate, weekStart).subtract(1, "week");

  const padding = firstDate.diff(firstCalendarDate, "day");
  const padded: (CommitActivity | undefined)[] = [
    ...Array.from<undefined>({ length: padding }),
    ...normalized,
  ];

  const numberOfWeeks = Math.ceil(padded.length / 7);
  return Array.from({ length: numberOfWeeks }, (_, i) =>
    padded.slice(i * 7, i * 7 + 7)
  );
};

/**
 * Noms de mois abrégés dans la locale courante. Les libellés du calendrier
 * étaient codés en dur en français et s'affichaient donc aussi sur /en.
 */
export const getLocalizedMonthLabels = (): string[] =>
  Array.from({ length: 12 }, (_, month) =>
    dayjs().locale(getLocale()).month(month).format("MMM")
  );

export const getMonthLabels = (
  weeks: Week[],
  monthNames: string[] = getLocalizedMonthLabels()
): MonthLabel[] => {
  const monthLabels: MonthLabel[] = [];

  for (const [weekIndex, week] of weeks.entries()) {
    const firstActivity = week.find(
      (activity) => activity !== undefined
    );
    if (!firstActivity) {
      throw new Error(`Week ${weekIndex + 1} is empty.`);
    }

    const month = monthNames[dayjs(firstActivity.date).month()];
    if (!month) {
      throw new Error(
        `Undefined month label for ${dayjs(firstActivity.date).format("MMM")}.`
      );
    }

    const prevLabel = monthLabels.at(-1);
    if (weekIndex === 0 || !prevLabel || prevLabel.label !== month) {
      monthLabels.push({ label: month, weekIndex });
    }
  }

  return monthLabels.filter(({ weekIndex }, index, labels) => {
    const minWeeks = 3;
    if (index === 0) {
      return labels[1]
        ? labels[1].weekIndex - weekIndex >= minWeeks
        : true;
    }
    if (index === labels.length - 1) {
      return weeks.length - weekIndex >= minWeeks;
    }
    return true;
  });
};

/** 52 semaines, comme le calendrier que GitHub affiche lui-même */
const CONTRIBUTION_WEEKS = 52;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86_400_000;

export interface ContributionWindow {
  from: Date;
  to: Date;
}

/**
 * La fenêtre du graphe de contributions : 52 semaines GLISSANTES.
 *
 * Elle était calculée sur l'année CIVILE — `${année}-01-01` à `${année}-12-31`.
 * Le graphe se vidait donc chaque 1er janvier et mettait douze mois à se
 * reremplir : au matin du Nouvel An, le widget vedette de la page d'accueil
 * n'affichait plus qu'une seule journée de contributions. Le défaut n'était
 * visible qu'un jour par an, ce qui explique qu'il ait survécu.
 *
 * Le début est ramené au dimanche : GitHub renvoie des semaines commençant un
 * dimanche, et sans cet alignement la première colonne de la grille serait
 * tronquée et tout le calendrier décalé d'autant.
 *
 * L'instant de référence est un PARAMÈTRE et non `new Date()` : c'est ce qui
 * rend la fonction testable, et c'est la convention des modules purs de ce
 * dépôt (voir `datetime.ts`).
 */
export const contributionWindow = (now: Date): ContributionWindow => {
  const from = new Date(
    now.getTime() -
      (CONTRIBUTION_WEEKS * DAYS_PER_WEEK - 1) * MS_PER_DAY
  );

  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - from.getUTCDay());

  return { from, to: now };
};
