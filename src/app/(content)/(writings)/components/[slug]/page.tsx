import { getTableOfContents } from "fumadocs-core/content/toc";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type {
  BlogPosting as PageSchema,
  WithContext,
} from "schema-dts";

import { ArticleTitle } from "@/components/blog/ArticleTitle";
import { TableOfContents } from "@/components/features/WritingsToC";
import { ArticleNavBar } from "@/components/features/WritingsTopBar";
import { MDX } from "@/components/markdown/mdx";
import GLOBAL_DATA from "@/data/global";
import type { Content } from "@/lib/content";
import {
  getContentByCategory,
  getContentBySlug,
} from "@/lib/content";
import { dayjs } from "@/lib/functions";
import { buildContentMetadata } from "@/lib/open-graph";

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
  const component = getContentBySlug(slug);
  if (!component) {
    return notFound();
  }

  const { title, description, category } = component.metadata;
  return {
    ...buildContentMetadata({
      description,
      ogImageParams: {
        description,
        title,
        type: "componentsArticle",
      },
      title,
    }),
    alternates: {
      canonical: `https://cuzeacflorin.fr/${category}/${slug}`,
    },
  };
};

const getPageJsonLd = ({
  metadata,
  slug,
}: Content): WithContext<PageSchema> => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  author: {
    "@type": "Person",
    identifier: GLOBAL_DATA.USER.username,
    image: GLOBAL_DATA.USER.avatar,
    name: GLOBAL_DATA.USER.firstName,
  },
  dateModified: dayjs(metadata.updatedAt).toISOString(),
  datePublished: dayjs(metadata.createdAt).toISOString(),
  description: metadata.description,
  headline: metadata.title,
  image:
    metadata.image ||
    `/og/simple?title=${encodeURIComponent(metadata.title)}`,
  url: `https://cuzeacflorin.fr/${metadata.category}/${slug}`,
});

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  const component = getContentBySlug(slug);

  if (!component) {
    notFound();
  }

  const { content, metadata } = component;
  const toc = getTableOfContents(content);
  const components = metadata.category
    ? getContentByCategory(metadata.category)
    : [];

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
      <ArticleNavBar
        description="tous les composants"
        item={component}
        items={components}
        slug={slug}
        useLlm={false}
      />
      <ArticleTitle title={metadata.title} />
      <TableOfContents items={toc} />
      <MDX code={content} />
    </>
  );
};

export default Page;
