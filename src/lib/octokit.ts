import { Octokit } from 'octokit';

const github = new Octokit({
	auth: process.env.GITHUB_API_TOKEN,
	userAgent: 'envindavsorg',
	timeZone: 'UTC',
});

export const octokit = github.graphql.bind(github);
