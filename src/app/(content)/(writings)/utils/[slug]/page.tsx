import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type {
  BlogPosting as PageSchema,
  WithContext,
} from "schema-dts";

import { PixelHeading } from "@/components/blocks/PixelHeading";
import { PageNav } from "@/components/features/PageNav";
import { PageToC } from "@/components/features/PageToC";
import { NavBreadcrumb } from "@/components/layout/NavBreadcrumb";
import { Mdx } from "@/components/markdown/mdx";
import { Divider } from "@/components/primitives/Divider";
import { PanelContent } from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";
import GLOBAL_DATA from "@/data/global";
import type { Content } from "@/lib/content";
import {
  getContentByCategory,
  getContentBySlug,
} from "@/lib/content";
import { dayjs } from "@/lib/functions";
import { buildContentMetadata } from "@/lib/open-graph";

export const generateStaticParams = async () => {
  const utils = getContentByCategory("utils");
  return utils.map(({ slug }) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>): Promise<Metadata> => {
  const { slug } = await params;
  const util = getContentBySlug(slug);
  if (!util) {
    return notFound();
  }

  const { title, description, category } = util.metadata;
  return {
    ...buildContentMetadata({
      description,
      ogImageParams: { description, title, type: "utilsArticle" },
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

const Page = async ({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) => {
  const { slug } = await params;
  const item = getContentBySlug(slug);

  if (!item) {
    notFound();
  }

  const { content, metadata } = item;

  const utils = metadata.category
    ? getContentByCategory(metadata.category)
    : [];

  return (
    <>
      <NavBreadcrumb
        items={[
          { href: "/", label: "Page d'accueil" },
          { href: "/utils", label: "Suite d'outils web" },
          { label: item.metadata.title },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <PixelHeading
        autoPlay
        className="text-3xl sm:text-4xl px-3 py-1 text-theme"
        mode="multi"
      >
        {metadata.title}
      </PixelHeading>
      <PanelContent className="screen-line-before">
        <Prose>-- {metadata.description} --</Prose>
      </PanelContent>

      <Divider border={false} type="half" />

      <PageToC content={content} />

      <Divider border={false} after={false} type="half" />

      <Mdx code={content} />

      <PageNav item={item} items={utils} slug={slug} />

      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getPageJsonLd(item)).replaceAll(
            "<",
            "\\u003c"
          ),
        }}
        type="application/ld+json"
      />
    </>
  );
};

export default Page;
