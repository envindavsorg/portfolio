import type { Metadata } from "next";
import { cache } from "react";

import { PixelHeading } from "@/components/blocks/PixelHeading";
import { PageTags } from "@/components/features/PageTags";
import { Utils } from "@/components/features/utils/Utils";
import { NavBreadcrumb } from "@/components/layout/NavBreadcrumb";
import { Divider } from "@/components/primitives/Divider";
import { PanelContent } from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";
import { getContentByCategory } from "@/lib/content";
import { getTime } from "@/lib/date";
import { createMetadata } from "@/lib/metadata";
import { filterByTag } from "@/lib/tags";

const pageType = "utils";
const pageTitle = "Suite d'outils web";
const pageDescription =
  "Une suite d'outils web gratuits conçus pour optimiser votre workflow et booster votre productivité";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: pageTitle,
    type: pageType,
  },
  title: pageTitle,
});

const getCachedUtils = cache(() =>
  getContentByCategory(pageType).sort(
    (a, b) =>
      getTime(b.metadata.createdAt) - getTime(a.metadata.createdAt)
  )
);

const Page = async ({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    tag?: string;
  }>;
}>) => {
  const { tag } = await searchParams;
  const { contents, activeTag, tagCounts, tags } = filterByTag(
    getCachedUtils(),
    tag
  );

  return (
    <div className="screen-line-after min-h-svh">
      <NavBreadcrumb
        items={[
          { href: "/", label: "Page d'accueil" },
          { label: pageTitle },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <PixelHeading
        autoPlay
        className="text-3xl sm:text-4xl px-3 py-1 text-theme"
        mode="multi"
      >
        {pageTitle}
      </PixelHeading>
      <PanelContent className="screen-line-before">
        <Prose>-- {pageDescription} --</Prose>
      </PanelContent>

      <Divider border={false} type="half" />

      <PanelContent className="space-y-0">
        <PageTags
          activeTag={activeTag}
          tagCounts={tagCounts}
          tags={tags}
        />
      </PanelContent>

      <Divider border={false} type="half" />

      <Utils
        contents={contents.map((item) => ({
          metadata: {
            createdAt: item.metadata.createdAt.toISOString(),
            description: item.metadata.description,
            isNew: item.metadata.isNew,
            title: item.metadata.title,
          },
          slug: item.slug,
        }))}
      />
    </div>
  );
};

export default Page;
