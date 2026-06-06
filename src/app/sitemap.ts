import type { MetadataRoute } from "next";

import { getAllContent } from "@/lib/content";
import { dayjs } from "@/lib/functions";

const BASE_URL = "https://cuzeacflorin.fr";

const CATEGORY_ROUTES: Record<string, string> = {
  articles: "articles",
  components: "components",
  utils: "utils",
};

// path SANS préfixe de locale, ex. "/articles" ou "" pour la racine
const toUrl = (path: string, locale: "fr" | "en") =>
  locale === "fr" ? `${BASE_URL}${path}` : `${BASE_URL}/en${path}`;

const localizedEntries = (
  path: string,
  entry: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap => {
  const alternates = {
    languages: {
      en: toUrl(path, "en"),
      fr: toUrl(path, "fr"),
    },
  };

  return [
    { ...entry, alternates, url: toUrl(path, "fr") },
    { ...entry, alternates, url: toUrl(path, "en") },
  ];
};

const getLatestDate = (posts: ReturnType<typeof getAllContent>) => {
  if (posts.length === 0) {
    return dayjs().toISOString();
  }

  return dayjs(posts[0].metadata.updatedAt).toISOString();
};

const sitemap = (): MetadataRoute.Sitemap => {
  const allPosts = getAllContent();

  const articles = allPosts.filter(
    (p) => p.metadata.category === "articles"
  );
  const components = allPosts.filter(
    (p) => p.metadata.category === "components"
  );
  const utils = allPosts.filter(
    (p) => p.metadata.category === "utils"
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    ...localizedEntries("", {
      changeFrequency: "daily",
      lastModified: getLatestDate(allPosts),
      priority: 1,
    }),
    ...localizedEntries("/articles", {
      changeFrequency: "daily",
      lastModified: getLatestDate(articles),
      priority: 0.8,
    }),
    ...localizedEntries("/components", {
      changeFrequency: "weekly",
      lastModified: getLatestDate(components),
      priority: 0.8,
    }),
    ...localizedEntries("/utils", {
      changeFrequency: "weekly",
      lastModified: getLatestDate(utils),
      priority: 0.8,
    }),
  ];

  const mapPostsToSitemap = (
    posts: typeof allPosts,
    routeBase: string
  ): MetadataRoute.Sitemap =>
    posts.flatMap((post) =>
      localizedEntries(`/${routeBase}/${post.slug}`, {
        changeFrequency: "weekly",
        lastModified: dayjs(post.metadata.updatedAt).toISOString(),
        priority: 0.6,
      })
    );

  const articleUrls = mapPostsToSitemap(
    articles,
    CATEGORY_ROUTES.articles
  );
  const componentUrls = mapPostsToSitemap(
    components,
    CATEGORY_ROUTES.components
  );
  const utilUrls = mapPostsToSitemap(utils, CATEGORY_ROUTES.utils);

  return [
    ...staticRoutes,
    ...articleUrls,
    ...componentUrls,
    ...utilUrls,
  ];
};

export default sitemap;
