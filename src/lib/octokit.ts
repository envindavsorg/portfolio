import { Octokit } from "octokit";

import { env } from "@/env";

/**
 * Le token vient de `src/env.ts`, pas de `process.env`.
 *
 * CLAUDE.md l'interdit explicitement, et pour une raison concrète : `env.ts`
 * valide les variables au démarrage avec Zod, alors qu'une lecture directe
 * accepte silencieusement une valeur absente et ne se manifeste qu'au premier
 * appel réseau — c'est-à-dire au build, en pleine génération de pages.
 */
const github = new Octokit({
  auth: env.GITHUB_API_TOKEN,
  timeZone: "UTC",
  userAgent: "envindavsorg",
});

export const octokit = github.graphql.bind(github);
