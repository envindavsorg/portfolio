import { Octokit } from "octokit";

import { env } from "@/env";

const github = new Octokit({
  auth: env.GITHUB_API_TOKEN,
  timeZone: "UTC",
  userAgent: "envindavsorg",
});

export const octokit = github.graphql.bind(github);
