import GLOBAL_DATA from "@/data/global";
import type { Content } from "@/lib/content";
import type { FeedMeta } from "@/lib/feed";
import { toFeedItems, toJsonFeed, toRssXml } from "@/lib/feed";
import { BASE_URL } from "@/lib/metadata";

/**
 * Petites fabriques partagées par les routes de flux, pour que RSS et JSON Feed
 * décrivent le même contenu sans dupliquer les métadonnées.
 */

const ONE_HOUR = 3600;
const ONE_DAY = 86_400;

const CACHE_CONTROL = `public, max-age=${ONE_HOUR}, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`;

export const feedMeta = ({
  description,
  path,
  title,
}: {
  description: string;
  /** chemin du flux, ex. "/api/rss" */
  path: string;
  title: string;
}): FeedMeta => ({
  author: GLOBAL_DATA.USER.fullName,
  description,
  feedUrl: `${BASE_URL}${path}`,
  language: "fr",
  siteUrl: BASE_URL,
  title,
});

export const rssResponse = (
  posts: Content[],
  meta: FeedMeta
): Response =>
  new Response(toRssXml(toFeedItems(posts, BASE_URL), meta), {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });

export const jsonFeedResponse = (
  posts: Content[],
  meta: FeedMeta
): Response =>
  new Response(toJsonFeed(toFeedItems(posts, BASE_URL), meta), {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": "application/feed+json; charset=utf-8",
    },
  });
