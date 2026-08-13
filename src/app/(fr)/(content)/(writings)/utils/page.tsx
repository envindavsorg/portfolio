import type { Metadata } from "next";

import { Divider } from "@/components/base/Divider";
import { Utils } from "@/components/features/utils/Utils";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { WritingsHeading } from "@/components/features/WritingsHeading";
import { WritingsTagFilter } from "@/components/features/WritingsTagFilter";
import { WritingsTags } from "@/components/features/WritingsTags";
import type { ContentLocale } from "@/lib/content";
import { getContentByCategory } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { getTagData } from "@/lib/tags";
import { m } from "@/paraglide/messages";

import { pageDescription, pageTitle, pageType } from "./_constants";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: pageTitle,
    type: pageType,
  },
  path: "/utils",
  title: pageTitle,
});

export const UtilsIndex = ({
  locale = "fr",
}: Readonly<{ locale?: ContentLocale }>) => {
  const contents = getContentByCategory(pageType, locale);
  const { tagCounts, tagLabels, tags } = getTagData(contents, locale);

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          { href: "/", label: m.writings_breadcrumb_home() },
          { label: m.writings_utils_title() },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <WritingsHeading
        title={m.writings_utils_title()}
        description={m.writings_utils_description()}
      />

      <Divider border={false} type="half" />

      <WritingsTagFilter>
        <WritingsTags
          labels={tagLabels}
          tagCounts={tagCounts}
          tags={tags}
        />

        <Divider border={false} type="half" />

        <Utils
          contents={contents.map(
            ({
              metadata: {
                createdAt,
                description,
                isNew,
                tags: itemTags,
                title,
              },
              slug,
            }) => ({
              metadata: {
                createdAt: createdAt.toISOString(),
                description,
                isNew,
                tags: itemTags,
                title,
              },
              slug,
            })
          )}
        />
      </WritingsTagFilter>
    </div>
  );
};

const Page = () => <UtilsIndex />;

export default Page;
