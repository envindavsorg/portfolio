import { notFound } from "next/navigation";

import GLOBAL_DATA from "@/data/global";
import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { feedMeta, rssResponse } from "@/lib/feed-routes";
import {
  getContentByTagSlug,
  getTagBySlug,
  getTagIndex,
} from "@/lib/tags";

export const dynamic = "force-static";

/**
 * Le français d'abord : pour un slug connu des deux côtés, le flux sert le
 * contenu FR, comme le reste du site dont l'arbre canonique est le français.
 */
const FEED_LOCALES: ContentLocale[] = ["fr", "en"];

/**
 * L'UNION des slugs des deux locales, et non le seul index français.
 *
 * Les pages de sujet anglaises affichent un bouton « suivre ce sujet » vers
 * /api/rss/tag/<slug>. Avec les seuls slugs FR, ce bouton pointait vers un flux
 * qui n'était prérendu nulle part pour les quatre sujets propres à l'anglais.
 */
export const generateStaticParams = () => {
  const slugs = new Set<string>();

  for (const locale of FEED_LOCALES) {
    for (const tag of getTagIndex(getAllContent(locale))) {
      slugs.add(tag.slug);
    }
  }

  return [...slugs].map((tag) => ({ tag }));
};

/** Première locale dont l'index connaît ce slug. */
const resolveTag = (slug: string) => {
  for (const locale of FEED_LOCALES) {
    const contents = getAllContent(locale);
    const tag = getTagBySlug(contents, slug);

    if (tag) {
      return { contents, tag };
    }
  }

  return null;
};

/**
 * Un flux par sujet : suivre « accessibilité » sans recevoir tout le reste.
 * Contrairement aux flux par catégorie, celui-ci traverse les catégories.
 */
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ tag: string }> }
): Promise<Response> => {
  const { tag: slug } = await params;
  const resolved = resolveTag(slug);

  if (!resolved) {
    notFound();
  }

  const { contents, tag } = resolved;

  return rssResponse(
    getContentByTagSlug(contents, slug),
    feedMeta({
      description: `Contenus sur le sujet « ${tag.label} » — ${GLOBAL_DATA.USER.bio}`,
      path: `/api/rss/tag/${tag.slug}`,
      title: `${tag.label} | ${GLOBAL_DATA.USER.fullName}`,
    })
  );
};
