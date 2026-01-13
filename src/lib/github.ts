import type { Dayjs } from 'dayjs';
import { dayjs } from '@/lib/dayjs';

const DEFAULT_MONTH_LABELS = [
	'Jan.',
	'Fév.',
	'Mars',
	'Avr.',
	'Mai',
	'Juin',
	'Juil.',
	'Août',
	'Sep.',
	'Oct.',
	'Nov.',
	'Déc.',
];

export const DEFAULT_LABELS: Labels = {
	months: DEFAULT_MONTH_LABELS,
	weekdays: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
	totalCount: '{{count}} contributions en {{year}}',
	legend: {
		less: 'Plus',
		more: 'Moins',
	},
};

export const contributionLevelToNumber = (level: ContributionLevel): number => {
	const levelMap = {
		NONE: 0,
		FIRST_QUARTILE: 1,
		SECOND_QUARTILE: 2,
		THIRD_QUARTILE: 3,
		FOURTH_QUARTILE: 4,
	};

	return levelMap[level];
};

// Helper function to get each day in an interval
export const eachDayOfInterval = (start: Dayjs, end: Dayjs): Dayjs[] => {
	const days: Dayjs[] = [];
	let current = start;

	while (current.isBefore(end) || current.isSame(end, 'day')) {
		days.push(current);
		current = current.add(1, 'day');
	}

	return days;
};

// Helper function to get the next occurrence of a specific weekday
export const nextDay = (date: Dayjs, targetWeekDay: WeekDay): Dayjs => {
	const currentDay = date.day();
	const daysToAdd = targetWeekDay >= currentDay ? targetWeekDay - currentDay : 7 - currentDay + targetWeekDay;
	return date.add(daysToAdd, 'day');
};

export const fillHoles = (activities: CommitActivity[]): CommitActivity[] => {
	if (activities.length === 0) {
		return [];
	}

	const sortedActivities = [...activities].sort((a, b) => a.date.localeCompare(b.date));

	const calendar = new Map<string, CommitActivity>(activities.map((a) => [a.date, a]));

	const firstActivity = sortedActivities[0] as CommitActivity;
	const lastActivity = sortedActivities.at(-1);

	if (!lastActivity) {
		return [];
	}

	return eachDayOfInterval(dayjs(firstActivity.date), dayjs(lastActivity.date)).map((day) => {
		const date = day.format('YYYY-MM-DD');

		if (calendar.has(date)) {
			return calendar.get(date) as CommitActivity;
		}

		return {
			date,
			count: 0,
			level: 0,
		};
	});
};

export const groupByWeeks = (activities: CommitActivity[], weekStart: WeekDay = 0): Week[] => {
	if (activities.length === 0) {
		return [];
	}

	const normalizedActivities = fillHoles(activities);
	const firstActivity = normalizedActivities[0] as CommitActivity;
	const firstDate = dayjs(firstActivity.date);
	const firstCalendarDate =
		firstDate.day() === weekStart ? firstDate : nextDay(firstDate, weekStart).subtract(1, 'week');

	const paddedActivities = [
		...(new Array(firstDate.diff(firstCalendarDate, 'day')).fill(undefined) as CommitActivity[]),
		...normalizedActivities,
	];

	const numberOfWeeks = Math.ceil(paddedActivities.length / 7);

	return new Array(numberOfWeeks)
		.fill(undefined)
		.map((_, weekIndex) => paddedActivities.slice(weekIndex * 7, weekIndex * 7 + 7));
};

export const getMonthLabels = (weeks: Week[], monthNames: string[] = DEFAULT_MONTH_LABELS): MonthLabel[] =>
	weeks
		.reduce<MonthLabel[]>((labels, week, weekIndex) => {
			const firstActivity = week.find((activity) => activity !== undefined);

			if (!firstActivity) {
				throw new Error(`Unexpected error: Week ${weekIndex + 1} is empty: [${week}].`);
			}

			const month = monthNames[dayjs(firstActivity.date).month()];

			if (!month) {
				const monthName = dayjs(firstActivity.date).format('MMM');
				throw new Error(`Unexpected error: undefined month label for ${monthName}.`);
			}

			const prevLabel = labels.at(-1);

			if (weekIndex === 0 || !prevLabel || prevLabel.label !== month) {
				return labels.concat({ weekIndex, label: month });
			}

			return labels;
		}, [])
		.filter(({ weekIndex }, index, labels) => {
			const minWeeks = 3;

			if (index === 0) {
				return labels[1] && labels[1].weekIndex - weekIndex >= minWeeks;
			}

			if (index === labels.length - 1) {
				return weeks.slice(weekIndex).length >= minWeeks;
			}

			return true;
		});
