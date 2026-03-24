import { Octokit } from "octokit";

const github = new Octokit({
  auth: process.env.GITHUB_API_TOKEN,
  timeZone: "UTC",
  userAgent: "envindavsorg",
});

export const octokit = github.graphql.bind(github);
