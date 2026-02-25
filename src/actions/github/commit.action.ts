'use server';

import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logger';
import { octokit } from '@/lib/octokit';

const CACHE_TAG = 'github-commit';
const CACHE_REVALIDATE = 3600;

const fetchCommitData = async (): Promise<CommitData> => {
	try {
		const { repository } = await octokit<CommitResponse>(
			`query ($owner: String!, $repo: String!) {
				repository(owner: $owner, name: $repo) {
					defaultBranchRef {
						name
						target {
							... on Commit {
								oid
								committedDate
							}
						}
					}
				}
			}`,
			{
				owner: process.env.GITHUB_USERNAME,
				repo: process.env.GITHUB_REPO_NAME,
			}
		);

		const ref = repository?.defaultBranchRef;

		return {
			branch: ref?.name,
			hash: ref?.target.oid.slice(0, 7),
			updated: ref?.target.committedDate,
		};
	} catch (error) {
		logger.error('Failed to fetch GitHub commit data:', error);
		return {};
	}
};

export const getCommitData = unstable_cache(fetchCommitData, [CACHE_TAG], {
	revalidate: CACHE_REVALIDATE,
	tags: [CACHE_TAG],
});
