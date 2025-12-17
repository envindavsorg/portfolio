'use server';

import { revalidateTag, unstable_cache } from 'next/cache';
import { octokit } from '@/lib/octokit';
import { GITHUB_QUERY } from './query/github.query';
import type { GitHubResponse, GitHubUserData } from './types/github.types';

const { GITHUB_USERNAME = '', GITHUB_REPO_NAME = '' } = process.env;

const CACHE_TAG = 'github-user-data';
const CACHE_REVALIDATE = 3600;

const contributionLevelToNumber = (
	level:
		| 'NONE'
		| 'FIRST_QUARTILE'
		| 'SECOND_QUARTILE'
		| 'THIRD_QUARTILE'
		| 'FOURTH_QUARTILE',
): number => {
	const levelMap = {
		NONE: 0,
		FIRST_QUARTILE: 1,
		SECOND_QUARTILE: 2,
		THIRD_QUARTILE: 3,
		FOURTH_QUARTILE: 4,
	};
	return levelMap[level];
};

const fetchGitHubData = async (): Promise<GitHubUserData> => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const from = new Date(`${currentYear}-01-01T00:00:00Z`);
	const to = new Date(`${currentYear}-12-31T23:59:59Z`);

	const { user, repository } = await octokit.graphql<GitHubResponse>(
		GITHUB_QUERY,
		{
			username: GITHUB_USERNAME,
			repoName: GITHUB_REPO_NAME,
			from: from.toISOString(),
			to: to.toISOString(),
		},
	);

	const contributions =
		user.contributionsCollection.contributionCalendar.weeks
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
		stars: user.repositories.nodes.reduce(
			(total, repo) => total + repo.stargazers.totalCount,
			0,
		),
		branch: repository?.defaultBranchRef?.name,
		commit: {
			hash: repository?.defaultBranchRef?.target.oid.slice(0, 7),
			date: repository?.defaultBranchRef?.target.committedDate,
		},
		contributions,
	};
};

export const getGitHubUserData = unstable_cache(
	fetchGitHubData,
	[CACHE_TAG, GITHUB_USERNAME],
	{
		revalidate: CACHE_REVALIDATE,
		tags: [CACHE_TAG],
	},
);

export const revalidateGitHubData = async () => revalidateTag(CACHE_TAG);
