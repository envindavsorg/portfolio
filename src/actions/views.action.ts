"use server";

import { head, put } from "@vercel/blob";
import { headers } from "next/headers";
import { z } from "zod";

import { actionClient } from "@/actions/safe-action";
import { env } from "@/env";
import { getContentBySlug } from "@/lib/content";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const VIEWS_BLOB_PATH = "stats/views.json";
const RATE_LIMIT_PER_IP = { limit: 60, windowMs: 10 * 60 * 1000 };
const SLUG_REGEX = /^[a-z0-9-]+$/u;

const viewSchema = z.object({
  category: z.enum(["articles", "components", "utils"]),
  increment: z.boolean(),
  slug: z.string().regex(SLUG_REGEX).max(100),
});

type ViewCounts = Record<string, number>;

const readViews = async (): Promise<ViewCounts> => {
  try {
    const blob = await head(VIEWS_BLOB_PATH, {
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) {
      return {};
    }

    const data = (await res.json()) as ViewCounts;
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    // blob inexistant tant qu'aucune vue n'a été enregistrée
    return {};
  }
};

export const trackViewAction = actionClient
  .inputSchema(viewSchema)
  .action(async ({ parsedInput }) => {
    const { category, increment, slug } = parsedInput;

    if (!env.BLOB_READ_WRITE_TOKEN) {
      return { views: null };
    }

    if (!getContentBySlug(slug, category)) {
      return { views: null };
    }

    const key = `${category}/${slug}`;
    const views = await readViews();
    const current = views[key] ?? 0;

    if (!increment) {
      return { views: current };
    }

    const clientIp = getClientIp(await headers());
    const rate = checkRateLimit(
      `views:ip:${clientIp}`,
      RATE_LIMIT_PER_IP
    );
    if (!rate.allowed) {
      return { views: current };
    }

    // Lecture-modification-écriture non atomique : des incréments
    // peuvent se perdre en cas d'accès concurrents, acceptable pour
    // un compteur de vues de portfolio.
    views[key] = current + 1;

    try {
      await put(VIEWS_BLOB_PATH, JSON.stringify(views), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        token: env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (error) {
      logger.error("Failed to persist view counts:", error);
      return { views: current };
    }

    return { views: current + 1 };
  });
