import GLOBAL_DATA from "@/data/global";
import { getAllContent } from "@/lib/content";
import { feedMeta, rssResponse } from "@/lib/feed-routes";

export const dynamic = "force-static";

export const GET = (): Response =>
  rssResponse(
    getAllContent(),
    feedMeta({
      description: GLOBAL_DATA.USER.bio,
      path: "/api/rss",
      title: `Le coin de ${GLOBAL_DATA.USER.firstName}`,
    })
  );
