import type { Metadata } from "next";
import { cache } from "react";

import { Utils } from "@/components/features/utils/Utils";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { WritingsHeading } from "@/components/features/WritingsHeading";
import { WritingsTags } from "@/components/features/WritingsTags";
import { Divider } from "@/components/primitives/Divider";
import { getContentByCategory } from "@/lib/content";
import { getTime } from "@/lib/date";
import { createMetadata } from "@/lib/metadata";
import { filterByTag } from "@/lib/tags";

import { pageDescription, pageTitle, pageType } from "./_constants";

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
      <WritingsBreadcrumb
        items={[
          { href: "/", label: "Page d'accueil" },
          { label: pageTitle },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <WritingsHeading
        title={pageTitle}
        description={pageDescription}
      />

      <Divider border={false} type="half" />

      <WritingsTags
        activeTag={activeTag}
        tagCounts={tagCounts}
        tags={tags}
      />

      <Divider border={false} type="half" />

      <Utils
        contents={contents.map(
          ({
            metadata: { createdAt, description, isNew, title },
            slug,
          }) => ({
            metadata: {
              createdAt: createdAt.toISOString(),
              description,
              isNew,
              title,
            },
            slug,
          })
        )}
      />
    </div>
  );
};

export default Page;
