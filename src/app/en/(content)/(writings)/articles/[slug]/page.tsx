import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ArticleView,
  generateStaticParams,
} from "@/app/(fr)/(content)/(writings)/articles/[slug]/page";
import { getContentBySlug } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export { generateStaticParams };

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const article = getContentBySlug(slug, "articles", "en");
  if (!article) {
    return notFound();
  }

  const { title, description, category } = article.metadata;
  return createMetadata({
    description,
    locale: "en",
    ogImageParams: { description, title, type: "blogArticle" },
    path: `/${category}/${slug}`,
    title,
  });
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ArticleView locale="en" slug={slug} />;
};

export default Page;
