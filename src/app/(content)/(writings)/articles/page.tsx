import type { Metadata } from "next";
import { cache } from "react";

import { PixelHeading } from "@/components/blocks/PixelHeading";
import { ArticleItem } from "@/components/blog/ArticleItem";
import { filterByTag } from "@/components/blog/filter/filterByTag";
import { TagsFilter } from "@/components/blog/filter/TagsFilter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/primitives/Breadcrumb";
import { Divider } from "@/components/primitives/Divider";
import { PanelContent } from "@/components/primitives/Panel";
import { Prose } from "@/components/primitives/Typography";
import { getContentByCategory } from "@/lib/content";
import { dayjs } from "@/lib/functions";
import { buildContentMetadata } from "@/lib/open-graph";

const getCachedArticles = cache(() =>
  getContentByCategory("articles").sort((a, b) =>
    dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
  )
);

export const generateMetadata = async (): Promise<Metadata> =>
  buildContentMetadata({
    description:
      "Retrouvez tous mes articles de blog où je partage mon expérience en développement web.",
    ogImageParams: {
      description:
        "Retrouvez tous mes articles de blog où je partage mon expérience en développement web.",
      title: "Mes articles de blog",
      type: "blog",
    },
    title: "Mes articles de blog",
  });

type BlogPageProps = Readonly<{
  searchParams: Promise<{
    tag?: string;
  }>;
}>;

const ArticlesPage = async ({ searchParams }: BlogPageProps) => {
  const { tag } = await searchParams;
  const allArticles = getCachedArticles();
  const { tags, tagCounts, filtered, selectedTag } = filterByTag(
    allArticles,
    tag
  );

  return (
    <div className="screen-line-after min-h-svh">
      <div className="screen-line-after px-3 py-0.5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">accueil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>articles de blog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          mes articles de blog
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>
          -- retrouvez tous mes <span>articles de blog</span> où je partage mon
          expérience en développement web --
        </Prose>
        <Prose>
          -- j'y aborde les <i>bonnes pratiques</i>, les{" "}
          <i>patterns modernes</i>, les solutions aux problèmes techniques du
          quotidien, et mes découvertes sur l'écosystème <i>JavaScript</i> --
        </Prose>
      </PanelContent>

      <TagsFilter selectedTag={selectedTag} tagCounts={tagCounts} tags={tags} />

      <Divider before={false} border={false} type="half" />

      <div className="flex flex-col">
        {filtered.map(({ metadata, slug, reading, content }) => {
          const {
            category,
            image,
            title,
            description,
            cover,
            author,
            createdAt,
            tags,
          } = metadata;
          return (
            <div key={slug}>
              <ArticleItem
                author={author}
                category={category}
                content={content}
                cover={cover}
                createdAt={createdAt}
                description={description}
                image={image}
                reading={reading}
                slug={slug}
                tags={tags}
                title={title}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArticlesPage;
