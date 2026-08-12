import GLOBAL_DATA from "@/data/global";
import { getAllContent } from "@/lib/content";
import { feedMeta, jsonFeedResponse } from "@/lib/feed-routes";

export const dynamic = "force-static";

/** JSON Feed 1.1 — alternative moderne au RSS, plus simple à consommer */
export const GET = (): Response =>
  jsonFeedResponse(
    getAllContent(),
    feedMeta({
      description: GLOBAL_DATA.USER.bio,
      path: "/api/feed.json",
      title: `Le coin de ${GLOBAL_DATA.USER.firstName}`,
    })
  );
