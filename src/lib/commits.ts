import type { Dayjs } from "dayjs";

import { dayjs } from "@/lib/functions";

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

export const getMonthLabels = (
  weeks: Week[],
  monthNames: string[] = DEFAULT_MONTH_LABELS
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
