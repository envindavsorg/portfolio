import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { WritingsHeading } from "@/components/features/WritingsHeading";
import { WritingsToC } from "@/components/features/WritingsToC";
import { WritingsTopBar } from "@/components/features/WritingsTopBar";
import { Mdx } from "@/components/markdown/mdx";
import { Divider } from "@/components/primitives/Divider";
import {
  getContentByCategory,
  getContentBySlug,
} from "@/lib/content";
import { getPageJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/metadata";

import { pageTitle } from "../_constants";

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
  return createMetadata({
    description,
    ogImageParams: { description, title, type: "utilsArticle" },
    path: `/${category}/${slug}`,
    title,
  });
};

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

  const {
    content,
    metadata: { category, title, description },
  } = item;
  const utils = category ? getContentByCategory(category) : [];

  return (
    <>
      <WritingsBreadcrumb
        items={[
          { href: "/", label: "Page d'accueil" },
          { href: "/utils", label: pageTitle },
          { label: title },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <WritingsTopBar item={item} items={utils} slug={slug} />

      <Divider border={false} type="half" />

      <WritingsHeading title={title} description={description} />

      <Divider border={false} type="half" />

      <WritingsToC content={content} />

      <Divider border={false} after={false} type="half" />

      <Mdx code={content} />

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
