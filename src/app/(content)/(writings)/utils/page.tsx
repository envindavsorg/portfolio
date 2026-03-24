import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";

import { PixelHeading } from "@/components/blocks/PixelHeading";
import { PageTags } from "@/components/features/PageTags";
import { NavBreadcrumb } from "@/components/layout/NavBreadcrumb";
import { Divider } from "@/components/primitives/Divider";
import { PanelContent } from "@/components/primitives/Panel";
import { PulsatingCircle } from "@/components/primitives/PulsatingCircle";
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

      {contents.map((item, idx) => (
        <Link
          aria-label={item.metadata.title}
          href={`/utils/${item.slug}`}
          prefetch={false}
          key={item.slug}
        >
          <article className="group/article screen-line-after flex flex-col cursor-pointer select-none">
            <div className="w-full p-3 flex items-center justify-between group-hover/article:bg-accent2">
              <h2 className="text-base sm:text-xl font-pixel-square lowercase group-hover/article:text-theme transition-colors">
                <span>{idx + 1}. </span>
                {item.metadata.title}
              </h2>
              {item.metadata.isNew && (
                <div className="flex items-center gap-x-2">
                  <PulsatingCircle />
                  <span className="max-md:hidden text-sm text-theme">
                    Nouveau
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-edge px-3 py-1.5">
              <Prose className="lowercase">
                -- {item.metadata.description} --
              </Prose>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
};

export default Page;
