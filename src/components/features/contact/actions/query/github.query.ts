export const GITHUB_QUERY = `
    query ($username: String!, $repoName: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
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
        repository(owner: $username, name: $repoName) {
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
    }
`;
