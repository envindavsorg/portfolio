'use server';

import { unstable_cache } from 'next/cache';
import { octokit } from '@/lib/octokit';
import { COMMIT_QUERY } from '@/queries/github/commit.query';

const CACHE_TAG = 'github-commit';
const CACHE_REVALIDATE = 3600;

const fetchCommitData = async (): Promise<CommitData> => {
	try {
		const { repository } = await octokit<CommitResponse>(COMMIT_QUERY, {
			owner: process.env.GITHUB_USERNAME,
			repo: process.env.GITHUB_REPO_NAME,
		});

		const ref = repository?.defaultBranchRef;

		return {
			branch: ref?.name,
			hash: ref?.target.oid.slice(0, 7),
			updated: ref?.target.committedDate,
		};
	} catch (error) {
		console.error('Failed to fetch GitHub commit data:', error);
		return {};
	}
};

export const getCommitData = unstable_cache(fetchCommitData, [CACHE_TAG], {
	revalidate: CACHE_REVALIDATE,
	tags: [CACHE_TAG],
});
