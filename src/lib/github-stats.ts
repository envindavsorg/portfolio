/**
 * Statistiques dérivées des données GitHub.
 *
 * Fonctions pures : la date « aujourd'hui » est injectable pour que les séries
 * de contributions soient testables sans dépendre du jour d'exécution.
 */

export interface ContributionStats {
  /** série en cours, en jours consécutifs */
  currentStreak: number;
  /** plus longue série de l'année */
  longestStreak: number;
  /** total de contributions */
  total: number;
  /** journée la plus active */
  bestDay: { date: string; count: number } | null;
  /** nombre de jours avec au moins une contribution */
  activeDays: number;
}

export interface LanguageShare {
  name: string;
  color: string;
  /** octets de code cumulés */
  size: number;
  /** part en pourcentage, arrondie à une décimale */
  percent: number;
}

const EMPTY_STATS: ContributionStats = {
  activeDays: 0,
  bestDay: null,
  currentStreak: 0,
  longestStreak: 0,
  total: 0,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const toUtcDay = (date: string): number => {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Math.floor(parsed.getTime() / DAY_MS);
};

/**
 * Série en cours. La journée d'aujourd'hui n'est pas terminée : une série qui
 * s'arrête hier reste « en cours », sinon elle tomberait à zéro chaque matin.
 */
const getCurrentStreak = (
  sortedAscending: CommitActivity[],
  today: Date
): number => {
  const todayNumber = Math.floor(today.getTime() / DAY_MS);
  let streak = 0;
  let expected: number | null = null;

  for (const day of sortedAscending.toReversed()) {
    const dayNumber = toUtcDay(day.date);

    // ignorer les jours postérieurs à aujourd'hui (le calendrier GitHub va
    // jusqu'au 31 décembre)
    if (dayNumber > todayNumber) {
      continue;
    }

    if (expected === null) {
      const isTodayOrYesterday = todayNumber - dayNumber <= 1;
      if (!isTodayOrYesterday) {
        return 0;
      }
      if (day.count === 0) {
        // aujourd'hui encore vide : on regarde la veille avant d'abandonner
        if (dayNumber === todayNumber) {
          expected = dayNumber - 1;
          continue;
        }
        return 0;
      }
      streak = 1;
      expected = dayNumber - 1;
      continue;
    }

    if (dayNumber !== expected) {
      break;
    }
    if (day.count === 0) {
      break;
    }

    streak += 1;
    expected = dayNumber - 1;
  }

  return streak;
};

export const getContributionStats = (
  contributions: CommitActivity[],
  today: Date = new Date()
): ContributionStats => {
  if (contributions.length === 0) {
    return EMPTY_STATS;
  }

  const sorted = [...contributions].toSorted((a, b) =>
    a.date.localeCompare(b.date)
  );

  let total = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let running = 0;
  let previousDay: number | null = null;
  let bestDay: ContributionStats["bestDay"] = null;

  for (const day of sorted) {
    total += day.count;

    if (!bestDay || day.count > bestDay.count) {
      bestDay = { count: day.count, date: day.date };
    }

    if (day.count > 0) {
      activeDays += 1;
      const dayNumber = toUtcDay(day.date);
      // une série ne continue que sur des jours calendaires adjacents
      running =
        previousDay !== null && dayNumber - previousDay === 1
          ? running + 1
          : 1;
      previousDay = dayNumber;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
      previousDay = null;
    }
  }

  if (bestDay?.count === 0) {
    bestDay = null;
  }

  return {
    activeDays,
    bestDay,
    currentStreak: getCurrentStreak(sorted, today),
    longestStreak,
    total,
  };
};

const PERCENT_PRECISION = 10;

/**
 * Agrège les langages de tous les dépôts en parts triées.
 *
 * `topN` limite l'affichage ; le reste est regroupé par l'appelant si besoin.
 */
export const aggregateLanguages = (
  repositories: GitHubLanguageNode[],
  topN = 6
): LanguageShare[] => {
  const totals = new Map<string, { color: string; size: number }>();
  let grandTotal = 0;

  for (const repo of repositories) {
    // le code d'un fork n'est pas le sien : l'inclure fausserait la répartition
    if (repo.isFork) {
      continue;
    }

    for (const edge of repo.languages?.edges ?? []) {
      if (!edge?.node?.name || edge.size <= 0) {
        continue;
      }

      const existing = totals.get(edge.node.name);
      totals.set(edge.node.name, {
        // GitHub renvoie parfois une couleur nulle pour un langage exotique
        color: edge.node.color ?? existing?.color ?? "#8b8b8b",
        size: (existing?.size ?? 0) + edge.size,
      });
      grandTotal += edge.size;
    }
  }

  if (grandTotal === 0) {
    return [];
  }

  return [...totals.entries()]
    .map(([name, { color, size }]) => ({
      color,
      name,
      percent:
        Math.round((size / grandTotal) * 100 * PERCENT_PRECISION) /
        PERCENT_PRECISION,
      size,
    }))
    .toSorted((a, b) => b.size - a.size)
    .slice(0, topN);
};
