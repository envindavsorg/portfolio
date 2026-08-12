import { notFound } from "next/navigation";

import GLOBAL_DATA from "@/data/global";
import type { ContentCategory } from "@/lib/content";
import { getContentByCategory } from "@/lib/content";
import { feedMeta, rssResponse } from "@/lib/feed-routes";

export const dynamic = "force-static";

const CATEGORIES: ContentCategory[] = [
  "articles",
  "components",
  "utils",
];

const TITLES: Record<ContentCategory, string> = {
  articles: "Articles",
  components: "Composants",
  utils: "Outils",
};

export const generateStaticParams = () =>
  CATEGORIES.map((category) => ({ category }));

const isCategory = (value: string): value is ContentCategory =>
  (CATEGORIES as string[]).includes(value);

/** un flux par catégorie, pour suivre les articles sans les composants ni les outils */
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ category: string }> }
): Promise<Response> => {
  const { category } = await params;

  if (!isCategory(category)) {
    notFound();
  }

  return rssResponse(
    getContentByCategory(category),
    feedMeta({
      description: `${TITLES[category]} — ${GLOBAL_DATA.USER.bio}`,
      path: `/api/rss/${category}`,
      title: `${TITLES[category]} | ${GLOBAL_DATA.USER.fullName}`,
    })
  );
};
