import { getAllContent } from "@/lib/content";
import { feedMeta, jsonFeedResponse } from "@/lib/feed-routes";
import { feedTitle } from "@/lib/metadata";
import * as m from "@/paraglide/messages";

export const dynamic = "force-static";

/** JSON Feed 1.1 de l'arbre anglais — voir /api/rss/en */
export const GET = (): Response =>
  jsonFeedResponse(
    getAllContent("en"),
    feedMeta({
      description: m.user_bio(undefined, { locale: "en" }),
      locale: "en",
      path: "/api/feed.en.json",
      title: feedTitle("en", "all"),
    })
  );
