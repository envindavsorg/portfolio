import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
  },
  runtimeEnv: {
    API_TOKEN: process.env.API_TOKEN,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    GITHUB_API_TOKEN: process.env.GITHUB_API_TOKEN,
    GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
    GITHUB_USERNAME: process.env.GITHUB_USERNAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    TURBO_TEAM: process.env.TURBO_TEAM,
    TURBO_TOKEN: process.env.TURBO_TOKEN,
  },
  server: {
    API_TOKEN: z.string().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    GITHUB_API_TOKEN: z
      .string()
      .min(1, "gitHub API token is required !"),
    GITHUB_REPO_NAME: z.string().optional(),
    GITHUB_USERNAME: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    TURBO_TEAM: z.string().optional(),
    TURBO_TOKEN: z.string().optional(),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
