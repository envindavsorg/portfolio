import type { Metadata } from "next";
import { cache } from "react";

import { ToolItem } from "@/app/(content)/(root)/_components/tools/ToolItem";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { filterByTag } from "@/components/blog/filter/filterByTag";
import { TagsFilter } from "@/components/blog/filter/TagsFilter";
import { NavBreadcrumb } from "@/components/layout/NavBreadcrumb";
import { Divider } from "@/components/primitives/Divider";
import { PanelContent } from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";
import { getContentByCategory } from "@/lib/content";
import type { Content } from "@/lib/content";
import { dayjs } from "@/lib/functions";
import { buildContentMetadata } from "@/lib/open-graph";

const getCachedUtils = cache(() =>
  getContentByCategory("utils").sort((a, b) =>
    dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
  )
);

export const generateMetadata = async (): Promise<Metadata> =>
  buildContentMetadata({
    description:
      "Optimisez votre workflow avec cette suite d'outils web gratuits pour développeurs.",
    ogImageParams: {
      description:
        "Optimisez votre workflow avec cette suite d'outils web gratuits pour développeurs.",
      title: "Outils pour développeurs",
      type: "utils",
    },
    title: "Outils pour développeurs",
  });

type UtilsPageProps = Readonly<{
  searchParams: Promise<{
    tag?: string;
  }>;
}>;

const UtilsPage = async ({ searchParams }: UtilsPageProps) => {
  const { tag } = await searchParams;
  const allUtils = getCachedUtils();
  const { tags, tagCounts, filtered, selectedTag } = filterByTag(allUtils, tag);

  return (
    <div className="screen-line-after min-h-svh">
      <NavBreadcrumb
        items={[
          { href: "/", label: "page d'accueil" },
          { href: "/utils", label: "suite d'outils web" },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <PixelHeading
        autoPlay
        className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl px-3"
        mode="multi"
      >
        suite d'outils web
      </PixelHeading>

      <PanelContent className="screen-line-before">
        <Prose>
          -- optimisez votre workflow avec cette{" "}
          <span className="font-bold text-theme">suite d'outils web</span>{" "}
          gratuits pour développeurs --
        </Prose>
        <Prose>
          -- tous les outils sont{" "}
          <span className="font-bold text-theme">conçus pour vous aider</span> à
          gagner du temps et à améliorer votre productivité --
        </Prose>
      </PanelContent>

      <Divider border={false} type="half" />

      <TagsFilter selectedTag={selectedTag} tagCounts={tagCounts} tags={tags} />

      <Divider after={false} before={false} border={false} type="half" />

      {filtered.map((util: Content) => (
        <ToolItem isDescription key={util.slug} tool={util} />
      ))}
    </div>
  );
};

export default UtilsPage;
