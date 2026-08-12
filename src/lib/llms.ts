import { notFound } from "next/navigation";

import type { Content, ContentLocale } from "@/lib/content";
import { getAllContent, getLLMText } from "@/lib/content";

/**
 * Sert la source markdown d'un contenu, dans une locale donnée.
 *
 * Le bouton « Copy Markdown » des pages /en pointait sur le miroir français :
 * un lecteur anglophone copiait du texte en français. Les deux locales passent
 * désormais par ce même gestionnaire, avec le repli FR déjà géré par
 * `getAllContent` quand la traduction n'existe pas.
 */
export const serveMarkdown = async (
  slug: string,
  locale: ContentLocale
): Promise<Response> => {
  const posts = getAllContent(locale);
  const post = posts.find((entry: Content) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return new Response(await getLLMText(post), {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
};

export const markdownStaticParams = (
  locale: ContentLocale
): { slug: string }[] =>
  getAllContent(locale).map(({ slug }) => ({ slug }));
