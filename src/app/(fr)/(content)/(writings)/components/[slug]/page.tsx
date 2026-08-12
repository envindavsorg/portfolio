import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleTitle } from "@/components/blog/ArticleTitle";
import { WritingsLocaleNotice } from "@/components/features/WritingsLocaleNotice";
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
import { getPageJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/metadata";
import { getContentToc } from "@/lib/toc";

interface Props {
  params: Promise<{ slug: string }>;
}

export const generateStaticParams = async () => {
  const components = getContentByCategory("components");
  return components.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const component = getContentBySlug(slug, "components");
  if (!component) {
    return notFound();
  }

  const { title, description, category } = component.metadata;
  return createMetadata({
    description,
    ogImageParams: {
      description,
      title,
      type: "componentsArticle",
    },
    path: `/${category}/${slug}`,
    title,
  });
};

export const ComponentView = ({
  locale = "fr",
  slug,
}: Readonly<{ locale?: ContentLocale; slug: string }>) => {
  const component = getContentBySlug(slug, "components", locale);

  if (!component) {
    notFound();
  }

  const { content, metadata } = component;
  const components = getContentByCategory("components", locale);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getPageJsonLd(component, locale)
          ).replaceAll("<", "\\u003c"),
        }}
        type="application/ld+json"
      />
      {locale === "en" && component.locale === "fr" && (
        <WritingsLocaleNotice />
      )}
      <WritingsTopBar
        item={component}
        items={components}
        slug={slug}
      />
      <ArticleTitle title={metadata.title} />
      <WritingsSeries
        all={getAllContent(locale)}
        current={component}
      />
      <WritingsToC items={getContentToc(content)} />
      <WritingsReadingAids />
      <Mdx code={content} />

      <WritingsTagLinks current={component} />

      <WritingsRelated
        all={getAllContent(locale)}
        current={component}
      />
    </>
  );
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ComponentView slug={slug} />;
};

export default Page;
