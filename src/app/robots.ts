import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      disallow: ["/api/*", "/ingest/*"],
      userAgent: "*",
    },
  ],
  sitemap: "https://cuzeacflorin.fr/sitemap.xml",
});

export default robots;
