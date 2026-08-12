"use server";

import { unstable_cache } from "next/cache";

import { env } from "@/env";
import { logger } from "@/lib/logger";
import { octokit } from "@/lib/octokit";

const CACHE_TAG = "github-commit";
const CACHE_REVALIDATE = 3600;

const fetchCommitData = async (): Promise<CommitData> => {
  const owner = env.GITHUB_USERNAME;
  const repo = env.GITHUB_REPO_NAME;
  if (!(owner && repo)) {
    throw new Error(
      "GITHUB_USERNAME / GITHUB_REPO_NAME are not configured"
    );
  }

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
    { owner, repo }
  );

  const ref = repository?.defaultBranchRef;

  return {
    branch: ref?.name,
    hash: ref?.target.oid.slice(0, 7),
    updated: ref?.target.committedDate,
  };
};

// le cache n'enveloppe que le fetch : une erreur n'est pas mise en cache,
// sinon une panne passagère figerait le footer pendant 1 heure.
const getCachedCommitData = unstable_cache(
  fetchCommitData,
  [CACHE_TAG],
  {
    revalidate: CACHE_REVALIDATE,
    tags: [CACHE_TAG],
  }
);

export const getCommitData = async (): Promise<CommitData> => {
  try {
    return await getCachedCommitData();
  } catch (error) {
    logger.error("Failed to fetch GitHub commit data:", error);
    return {};
  }
};
