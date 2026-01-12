export const DATA_QUERY = `
    query ($owner: String!, $from: DateTime!, $to: DateTime!) {
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
    }
`;
