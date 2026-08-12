import { Badge } from "@/components/primitives/Badge";
import { formatDate } from "@/lib/functions";
import type { ContributionStats } from "@/lib/github-stats";
import { m } from "@/paraglide/messages";

interface CommitsStatsProps {
  stats: ContributionStats;
}

/**
 * Bandeau de statistiques dérivées du calendrier de contributions : série en
 * cours, record de l'année, jours actifs et meilleure journée.
 */
export const CommitsStats = ({ stats }: CommitsStatsProps) => {
  // sans données (API indisponible), le bandeau n'a rien à dire
  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="screen-line-before flex flex-wrap items-center gap-2 px-2 py-2 sm:gap-4 sm:px-4">
      <span className="text-theme">---</span>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Badge className="text-theme lowercase">
          {m.home_commits_stat_current_streak({
            count: stats.currentStreak,
          })}
        </Badge>

        <Badge className="text-theme lowercase">
          {m.home_commits_stat_longest_streak({
            count: stats.longestStreak,
          })}
        </Badge>

        <Badge className="text-theme lowercase">
          {m.home_commits_stat_active_days({
            count: stats.activeDays,
          })}
        </Badge>

        {stats.bestDay && (
          <Badge className="text-theme lowercase">
            {m.home_commits_stat_best_day({
              count: stats.bestDay.count,
              date: formatDate(stats.bestDay.date, "DD MMM"),
            })}
          </Badge>
        )}
      </div>
    </div>
  );
};
