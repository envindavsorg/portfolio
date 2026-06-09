import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleTitle } from "@/components/blog/ArticleTitle";
import { WritingsLocaleNotice } from "@/components/features/WritingsLocaleNotice";
import { WritingsProgress } from "@/components/features/WritingsProgress";
import { WritingsRelated } from "@/components/features/WritingsRelated";
import { WritingsToC } from "@/components/features/WritingsToC";
import { WritingsTopBar } from "@/components/features/WritingsTopBar";
import { WritingsViews } from "@/components/features/WritingsViews";
import { Mdx } from "@/components/markdown/mdx";
import type { ContentLocale } from "@/lib/content";
import {
  getContentByCategory,
  getContentBySlug,
} from "@/lib/content";
import { getPageJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export const generateStaticParams = async () => {
  const articles = getContentByCategory("articles");
  return articles.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const article = getContentBySlug(slug, "articles");
  if (!article) {
    return notFound();
  }

  const { title, description, category } = article.metadata;
  return createMetadata({
    description,
    ogImageParams: { description, title, type: "blogArticle" },
    path: `/${category}/${slug}`,
    title,
  });
};

export const ArticleView = ({
  locale = "fr",
  slug,
}: Readonly<{ locale?: ContentLocale; slug: string }>) => {
  const article = getContentBySlug(slug, "articles", locale);

  if (!article) {
    notFound();
  }

  const { content, metadata } = article;
  const articles = getContentByCategory("articles", locale);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPageJsonLd(article)).replaceAll(
            "<",
            "\\u003c"
          ),
        }}
        type="application/ld+json"
      />
      {locale === "en" && article.locale === "fr" && (
        <WritingsLocaleNotice />
      )}
      <WritingsProgress />
      <WritingsTopBar item={article} items={articles} slug={slug} />
      <ArticleTitle title={metadata.title}>
        <WritingsViews category="articles" slug={slug} />
      </ArticleTitle>
      <WritingsToC content={content} />
      <Mdx code={content} />
      <WritingsRelated current={article} items={articles} />
    </>
  );
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
};

export default Page;
