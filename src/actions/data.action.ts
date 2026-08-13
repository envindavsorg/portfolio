"use server";

import { unstable_cache } from "next/cache";

import GLOBAL_DATA from "@/data/global";
import { env } from "@/env";
import {
  contributionLevelToNumber,
  contributionWindow,
} from "@/lib/commits";
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

  // fenêtre GLISSANTE : sur l'année civile, le graphe se vidait chaque
  // 1er janvier et mettait douze mois à se reremplir
  const { from, to } = contributionWindow(new Date());

  // `privacy: PUBLIC` : le token voit AUSSI les dépôts privés de l'employeur.
  // Le filtrage est demandé à GitHub plutôt que fait après coup — un filtre
  // oublié côté client publierait des noms de dépôts privés sur la page
  // d'accueil, et rien dans l'interface ne le signalerait.
  //
  // `orderBy: PUSHED_AT` : `first: 100` tronque, et sans ordre explicite la
  // troncature porte sur une centaine ARBITRAIRE de dépôts. Avec l'ordre, ce
  // sont les cent derniers poussés — un sous-ensemble qu'on peut nommer.
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
	            repositories(ownerAffiliations: OWNER, privacy: PUBLIC, first: 100, orderBy: { field: PUSHED_AT, direction: DESC }) {
	                nodes {
	                    name
	                    description
	                    url
	                    stargazerCount
	                    forkCount
	                    pushedAt
	                    isFork
	                    isArchived
	                    primaryLanguage {
	                        name
	                        color
	                    }
	                    repositoryTopics(first: 6) {
	                        nodes {
	                            topic {
	                                name
	                            }
	                        }
	                    }
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
      (total, repo) => total + (repo.stargazerCount ?? 0),
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
