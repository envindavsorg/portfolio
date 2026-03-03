'use server';

import { unstable_cache } from 'next/cache';
import { contributionLevelToNumber } from '@/lib/commits';
import { octokit } from '@/lib/octokit';

const CACHE_TAG = 'github-user-data';
const CACHE_REVALIDATE = 3600;

const fetchGitHubData = async (): Promise<GitHubData> => {
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
			owner: process.env.GITHUB_USERNAME,
			repo: process.env.GITHUB_REPO_NAME,
			from: from.toISOString(),
			to: to.toISOString(),
		}
	);

	const contributions = user.contributionsCollection.contributionCalendar.weeks
		.flatMap((week) => week.contributionDays)
		.map((day) => ({
			date: day.date,
			count: day.contributionCount,
			level: contributionLevelToNumber(day.contributionLevel),
		}));

	return {
		login: user.login,
		name: user.name,
		avatar: user.avatarUrl,
		followers: user.followers.totalCount,
		following: user.following.totalCount,
		stars: user.repositories.nodes.reduce((total, repo) => total + repo.stargazers.totalCount, 0),
		contributions,
	};
};

export const getGitHubData = unstable_cache(fetchGitHubData, [CACHE_TAG], {
	revalidate: CACHE_REVALIDATE,
	tags: [CACHE_TAG],
});
