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
          __html: JSON.stringify(getPageJsonLd(component)).replaceAll(
            "<",
            "\\u003c"
          ),
        }}
        type="application/ld+json"
      />
      {locale === "en" && component.locale === "fr" && (
        <WritingsLocaleNotice />
      )}
      <WritingsProgress />
      <WritingsTopBar
        item={component}
        items={components}
        slug={slug}
      />
      <ArticleTitle title={metadata.title}>
        <WritingsViews category="components" slug={slug} />
      </ArticleTitle>
      <WritingsToC content={content} />
      <Mdx code={content} />
      <WritingsRelated current={component} items={components} />
    </>
  );
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ComponentView slug={slug} />;
};

export default Page;
