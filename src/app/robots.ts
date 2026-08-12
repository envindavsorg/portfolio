import type { MetadataRoute } from "next";

import { BASE_URL } from "@/lib/metadata";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      // `/api/*` bloquait aussi /api/og : les crawlers sociaux qui respectent
      // robots.txt (Twitterbot) ne pouvaient plus récupérer les images
      // OpenGraph, et /api/rss n'était pas explorable. On ne masque donc que
      // les endpoints réellement non publics.
      allow: ["/api/og", "/api/rss", "/api/vcard"],
      disallow: ["/api/health", "/ingest/*", "/og"],
      userAgent: "*",
    },
  ],
  sitemap: `${BASE_URL}/sitemap.xml`,
});

export default robots;
