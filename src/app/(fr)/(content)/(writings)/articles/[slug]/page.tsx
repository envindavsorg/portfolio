import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Divider } from "@/components/base/Divider";
import { ArticleTitle } from "@/components/blog/ArticleTitle";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { WritingsByline } from "@/components/features/WritingsByline";
import { WritingsLocaleNotice } from "@/components/features/WritingsLocaleNotice";
import { WritingsPrevNext } from "@/components/features/WritingsPrevNext";
import { WritingsReadingAids } from "@/components/features/WritingsReadingAids";
import { WritingsRelated } from "@/components/features/WritingsRelated";
import { WritingsSeries } from "@/components/features/WritingsSeries";
import { WritingsTagLinks } from "@/components/features/WritingsTagLinks";
import { WritingsToC } from "@/components/features/WritingsToC";
import { WritingsTopBar } from "@/components/features/WritingsTopBar";
import { Mdx } from "@/components/markdown/mdx";
import type { ContentLocale } from "@/lib/content";
import {
  getAllContent,
  getContentByCategory,
  getContentBySlug,
} from "@/lib/content";
import { getContentToc } from "@/lib/content-toc";
import { getPageJsonLd } from "@/lib/json-ld";
import { createContentMetadata } from "@/lib/metadata";
import { m } from "@/paraglide/messages";

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

  return createContentMetadata(article);
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
          __html: JSON.stringify(
            getPageJsonLd(article, locale)
          ).replaceAll("<", "\\u003c"),
        }}
        type="application/ld+json"
      />
      {/* Le fil d'Ariane n'existait que sur les pages d'outil : depuis un
          article ou un composant, rien dans la page ne ramenait à la liste. */}
      <WritingsBreadcrumb
        items={[
          { href: "/", label: m.writings_breadcrumb_home() },
          {
            href: "/articles",
            label: m.writings_breadcrumb_articles(),
          },
          { label: metadata.title },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      {locale === "en" && article.locale === "fr" && (
        <WritingsLocaleNotice />
      )}
      <WritingsTopBar item={article} items={articles} slug={slug} />
      <ArticleTitle title={metadata.title} />
      <WritingsByline item={article} />
      <WritingsSeries all={getAllContent(locale)} current={article} />
      <WritingsToC items={getContentToc(content)} />
      <WritingsReadingAids />
      <Mdx code={content} />

      <WritingsPrevNext item={article} items={articles} />

      <WritingsTagLinks current={article} />

      <WritingsRelated
        all={getAllContent(locale)}
        current={article}
      />
    </>
  );
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ArticleView slug={slug} />;
};

export default Page;
