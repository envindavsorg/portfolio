import { notFound } from "next/navigation";

import GLOBAL_DATA from "@/data/global";
import { getAllContent } from "@/lib/content";
import { feedMeta, rssResponse } from "@/lib/feed-routes";
import {
  getContentByTagSlug,
  getTagBySlug,
  getTagIndex,
} from "@/lib/tags";

export const dynamic = "force-static";

export const generateStaticParams = () =>
  getTagIndex(getAllContent()).map((tag) => ({ tag: tag.slug }));

/**
 * Un flux par sujet : suivre « accessibilité » sans recevoir tout le reste.
 * Contrairement aux flux par catégorie, celui-ci traverse les catégories.
 */
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ tag: string }> }
): Promise<Response> => {
  const { tag: slug } = await params;
  const contents = getAllContent();
  const tag = getTagBySlug(contents, slug);

  if (!tag) {
    notFound();
  }

  return rssResponse(
    getContentByTagSlug(contents, slug),
    feedMeta({
      description: `Contenus sur le sujet « ${tag.label} » — ${GLOBAL_DATA.USER.bio}`,
      path: `/api/rss/tag/${tag.slug}`,
      title: `${tag.label} | ${GLOBAL_DATA.USER.fullName}`,
    })
  );
};
