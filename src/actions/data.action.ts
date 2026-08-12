"use server";

import { unstable_cache } from "next/cache";

import GLOBAL_DATA from "@/data/global";
import { env } from "@/env";
import { contributionLevelToNumber } from "@/lib/commits";
import { logger } from "@/lib/logger";
import { octokit } from "@/lib/octokit";

const CACHE_TAG = "github-user-data";
const CACHE_REVALIDATE = 3600;

/**
 * Valeurs servies quand l'API GitHub est indisponible (token expiré, quota
 * dépassé, panne). Les sections concernées se dégradent au lieu de faire
 * planter le rendu de la page — et donc le build entier.
 */
const FALLBACK: GitHubData = {
  avatar: GLOBAL_DATA.USER.avatar,
  contributions: [],
  followers: 0,
  following: 0,
  login: GLOBAL_DATA.USER.username,
  name: GLOBAL_DATA.USER.fullName,
  repositories: [],
  stars: 0,
};

const fetchGitHubData = async (): Promise<GitHubData> => {
  const owner = env.GITHUB_USERNAME;
  if (!owner) {
    throw new Error("GITHUB_USERNAME is not configured");
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const from = new Date(`${currentYear}-01-01T00:00:00Z`);
  const to = new Date(`${currentYear}-12-31T23:59:59Z`);

  const { user } = await octokit<GitHubDataResponse>(
    `query ($owner: String!, $from: DateTime!, $to: DateTime!) {
	        user(login: $owner) {
	            login
	            name
	            avatarUrl
	            followers {
	                totalCount
	            }
	            following {
	                totalCount
	            }
	            repositories(ownerAffiliations: OWNER, first: 100) {
	                nodes {
	                    stargazers {
	                        totalCount
	                    }
	                    isFork
	                    languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
	                        edges {
	                            size
	                            node {
	                                name
	                                color
	                            }
	                        }
	                    }
	                }
	            }
	            contributionsCollection(from: $from, to: $to) {
	                contributionCalendar {
	                    totalContributions
	                    weeks {
	                        contributionDays {
	                            contributionCount
	                            date
	                            contributionLevel
	                        }
	                    }
	                }
	            }
	        }
		}`,
    {
      from: from.toISOString(),
      owner,
      to: to.toISOString(),
    }
  );

  const contributions =
    user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week) => week.contributionDays)
      .map((day) => ({
        count: day.contributionCount,
        date: day.date,
        level: contributionLevelToNumber(day.contributionLevel),
      }));

  return {
    avatar: user.avatarUrl,
    contributions,
    followers: user.followers.totalCount,
    following: user.following.totalCount,
    login: user.login,
    name: user.name,
    repositories: user.repositories.nodes,
    stars: user.repositories.nodes.reduce(
      (total, repo) => total + repo.stargazers.totalCount,
      0
    ),
  };
};

// le cache enveloppe uniquement le fetch : une erreur remonte sans être mise
// en cache, la requête suivante retente au lieu de figer le fallback 1 heure.
const getCachedGitHubData = unstable_cache(
  fetchGitHubData,
  [CACHE_TAG],
  {
    revalidate: CACHE_REVALIDATE,
    tags: [CACHE_TAG],
  }
);

export const getGitHubData = async (): Promise<GitHubData> => {
  try {
    return await getCachedGitHubData();
  } catch (error) {
    logger.error("Failed to fetch GitHub user data:", error);
    return FALLBACK;
  }
};
