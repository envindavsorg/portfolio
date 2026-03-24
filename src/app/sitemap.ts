import type { MetadataRoute } from "next";

import { getAllContent } from "@/lib/content";
import { dayjs } from "@/lib/functions";

const CATEGORY_ROUTES: Record<string, string> = {
  article: "blog",
  components: "components",
  utils: "utils",
};

const sitemap = (): MetadataRoute.Sitemap => {
  const allPosts = getAllContent();

  const articles = allPosts.filter(
    (p) => (p.metadata.category ?? "article") === "article"
  );
  const components = allPosts.filter(
    (p) => p.metadata.category === "components"
  );
  const utils = allPosts.filter(
    (p) => p.metadata.category === "utils"
  );

  const getLatestDate = (posts: typeof allPosts) => {
    if (posts.length === 0) {
      return dayjs().toISOString();
    }

    return dayjs(posts[0].metadata.updatedAt).toISOString();
  };

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      changeFrequency: "daily",
      lastModified: getLatestDate(allPosts),
      priority: 1,
      url: "https://cuzeacflorin.fr",
    },
    {
      changeFrequency: "daily",
      lastModified: getLatestDate(articles),
      priority: 0.8,
      url: "https://cuzeacflorin.fr/blog",
    },
    {
      changeFrequency: "weekly",
      lastModified: getLatestDate(components),
      priority: 0.8,
      url: "https://cuzeacflorin.fr/components",
    },
    {
      changeFrequency: "weekly",
      lastModified: getLatestDate(utils),
      priority: 0.8,
      url: "https://cuzeacflorin.fr/utils",
    },
  ];

  const mapPostsToSitemap = (
    posts: typeof allPosts,
    routeBase: string
  ): MetadataRoute.Sitemap =>
    posts.map((post) => ({
      changeFrequency: "weekly",
      lastModified: dayjs(post.metadata.updatedAt).toISOString(),
      priority: 0.6,
      url: `https://cuzeacflorin.fr/${routeBase}/${post.slug}`,
    }));

  const articleUrls = mapPostsToSitemap(
    articles,
    CATEGORY_ROUTES.article
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
