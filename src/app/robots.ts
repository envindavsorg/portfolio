import type { MetadataRoute } from "next";

import { BASE_URL } from "@/lib/metadata";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      // `/api/*` bloquait aussi /api/og : les crawlers sociaux qui respectent
      // robots.txt (Twitterbot) ne pouvaient plus récupérer les images
      // OpenGraph, et /api/rss n'était pas explorable. On ne masque donc que
      // les endpoints réellement non publics.
      allow: [
        "/api/og",
        "/api/rss",
        "/api/rss/*",
        "/api/feed.json",
        "/api/vcard",
      ],
      // `/admin` porte déjà `noindex` dans ses métadonnées, mais un en-tête que
      // le robot lit APRÈS avoir chargé la page ne l'empêche pas de la charger —
      // et `/api/auth/*` déclenche des redirections OAuth qu'aucun robot n'a de
      // raison de suivre
      disallow: [
        "/admin",
        "/admin/*",
        "/api/auth/*",
        "/api/health",
        "/ingest/*",
        "/og",
      ],
      userAgent: "*",
    },
  ],
  sitemap: `${BASE_URL}/sitemap.xml`,
});

export default robots;
