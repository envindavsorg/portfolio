import GLOBAL_DATA from "@/data/global";
import type { Content, ContentLocale } from "@/lib/content";
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
  locale = "fr",
  path,
  title,
}: {
  description: string;
  /** langue du flux : celle des contenus servis ET de leurs liens */
  locale?: ContentLocale;
  /** chemin du flux, ex. "/api/rss" */
  path: string;
  title: string;
}): FeedMeta => ({
  author: GLOBAL_DATA.USER.fullName,
  description,
  favicon: `${BASE_URL}/favicon.ico`,
  feedUrl: `${BASE_URL}${path}`,
  homeUrl: locale === "en" ? `${BASE_URL}/en` : `${BASE_URL}/`,
  icon: `${BASE_URL}/icon-512x512.png`,
  language: locale,
  siteUrl: BASE_URL,
  title,
});

// La langue des liens vient de `meta.language`, pas d'un second paramètre : un
// flux déclaré `en` dont les éléments pointeraient vers le français est
// précisément le défaut que ces fabriques doivent rendre impossible.
export const rssResponse = (
  posts: Content[],
  meta: FeedMeta
): Response =>
  new Response(
    toRssXml(toFeedItems(posts, BASE_URL, meta.language), meta),
    {
      headers: {
        "Cache-Control": CACHE_CONTROL,
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    }
  );

export const jsonFeedResponse = (
  posts: Content[],
  meta: FeedMeta
): Response =>
  new Response(
    toJsonFeed(toFeedItems(posts, BASE_URL, meta.language), meta),
    {
      headers: {
        "Cache-Control": CACHE_CONTROL,
        "Content-Type": "application/feed+json; charset=utf-8",
      },
    }
  );
