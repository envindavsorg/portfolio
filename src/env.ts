import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },
  runtimeEnv: {
    ADMIN_GITHUB_ID: process.env.ADMIN_GITHUB_ID,
    API_TOKEN: process.env.API_TOKEN,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_API_TOKEN: process.env.GITHUB_API_TOKEN,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    TURBO_TEAM: process.env.TURBO_TEAM,
    TURBO_TOKEN: process.env.TURBO_TOKEN,
  },
  server: {
    /**
     * Espace d'administration — toutes ces variables sont OPTIONNELLES.
     *
     * Le dépôt tolère leur absence, comme il tolère celle de `RESEND_API_KEY` :
     * la CI construit sans aucune d'elles. C'est `src/lib/admin/access.ts` qui
     * fait respecter la règle à l'exécution, et il échoue FERMÉ — sans
     * `ADMIN_GITHUB_ID`, personne n'entre. Les rendre obligatoires ici
     * casserait le build au lieu de fermer une porte.
     *
     * `ADMIN_GITHUB_ID` est l'identifiant NUMÉRIQUE, pas le pseudo : voir la
     * note de `access.ts` sur les pseudos réenregistrables. On le trouve avec
     * `curl https://api.github.com/users/<pseudo> | jq .id`.
     */
    ADMIN_GITHUB_ID: z.string().optional(),
    API_TOKEN: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    DATABASE_URL: z.string().optional(),
    GITHUB_API_TOKEN: z
      .string()
      .min(1, "gitHub API token is required !"),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_REPO_NAME: z.string().optional(),
    GITHUB_USERNAME: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    TURBO_TEAM: z.string().optional(),
    TURBO_TOKEN: z.string().optional(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
