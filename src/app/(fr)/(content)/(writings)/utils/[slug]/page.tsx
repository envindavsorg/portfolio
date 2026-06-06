import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Divider } from "@/components/base/Divider";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { WritingsHeading } from "@/components/features/WritingsHeading";
import { WritingsLocaleNotice } from "@/components/features/WritingsLocaleNotice";
import { WritingsToC } from "@/components/features/WritingsToC";
import { WritingsTopBar } from "@/components/features/WritingsTopBar";
import { Mdx } from "@/components/markdown/mdx";
import type { ContentLocale } from "@/lib/content";
import {
  getContentByCategory,
  getContentBySlug,
} from "@/lib/content";
import { getPageJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/metadata";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

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
  const util = getContentBySlug(slug, "utils");
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

export const UtilView = ({
  locale = "fr",
  slug,
}: Readonly<{ locale?: ContentLocale; slug: string }>) => {
  const item = getContentBySlug(slug, "utils", locale);

  if (!item) {
    notFound();
  }

  const {
    content,
    metadata: { title, description },
  } = item;
  const utils = getContentByCategory("utils", locale);

  return (
    <>
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_homepage(),
          },
          {
            href: localizeHref("/utils"),
            label: m.writings_utils_title(),
          },
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
      {locale === "en" && item.locale === "fr" && (
        <WritingsLocaleNotice />
      )}
    </>
  );
};

const Page = async ({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) => {
  const { slug } = await params;
  return <UtilView slug={slug} />;
};

export default Page;
