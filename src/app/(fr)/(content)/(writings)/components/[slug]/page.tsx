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
import { COMPONENT_DOCS } from "@/components/markdown/component-docs";
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

  return createContentMetadata(component);
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
      <WritingsBreadcrumb
        items={[
          { href: "/", label: m.writings_breadcrumb_home() },
          {
            href: "/components",
            label: m.writings_breadcrumb_components(),
          },
          { label: metadata.title },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      {locale === "en" && component.locale === "fr" && (
        <WritingsLocaleNotice />
      )}
      <WritingsTopBar
        item={component}
        items={components}
        slug={slug}
      />
      <ArticleTitle title={metadata.title} />
      <WritingsByline item={component} />
      <WritingsSeries
        all={getAllContent(locale)}
        current={component}
      />
      <WritingsToC items={getContentToc(content)} />
      <WritingsReadingAids />
      <Mdx
        code={content}
        components={COMPONENT_DOCS}
        locale={component.locale}
      />

      <WritingsPrevNext item={component} items={components} />

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
