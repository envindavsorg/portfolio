export type ContributionDay = {
	date: string;
	count: number;
	level: number;
};

export type GitHubUserData = {
	login: string;
	name: string;
	avatar: string;
	followers: number;
	following: number;
	stars: number;
	branch: string | undefined;
	commit: {
		hash: string | undefined;
		date: string | undefined;
	};
	contributions: ContributionDay[];
};

export type GitHubResponse = {
	user: {
		login: string;
		name: string;
		avatarUrl: string;
		followers: { totalCount: number };
		following: { totalCount: number };
		repositories: {
			nodes: { stargazers: { totalCount: number } }[];
		};
		contributionsCollection: {
			contributionCalendar: {
				totalContributions: number;
				weeks: {
					contributionDays: {
						contributionCount: number;
						date: string;
						contributionLevel:
							| 'NONE'
							| 'FIRST_QUARTILE'
							| 'SECOND_QUARTILE'
							| 'THIRD_QUARTILE'
							| 'FOURTH_QUARTILE';
					}[];
				}[];
			};
		};
	};
	repository: {
		defaultBranchRef: {
			name: string;
			target: {
				oid: string;
				committedDate: string;
			};
		} | null;
	} | null;
};
