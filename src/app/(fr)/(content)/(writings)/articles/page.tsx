import type { Metadata } from "next";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { ArticleItem } from "@/components/blog/ArticleItem";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import {
  WritingsFilterItem,
  WritingsTagFilter,
} from "@/components/features/WritingsTagFilter";
import { WritingsTags } from "@/components/features/WritingsTags";
import { Prose } from "@/components/primitives/Typography";
import type { ContentLocale } from "@/lib/content";
import { getContentByCategory } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { getTagData } from "@/lib/tags";
import { m } from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Retrouvez tous mes articles de blog où je partage mon expérience en développement web.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Mes articles de blog",
    type: "blog",
  },
  path: "/articles",
  title: "Mes articles de blog",
});

export const ArticlesIndex = ({
  locale = "fr",
}: Readonly<{ locale?: ContentLocale }>) => {
  const contents = getContentByCategory("articles", locale);
  const { tagCounts, tags } = getTagData(contents);

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(),
          },
          { label: m.writings_breadcrumb_articles() },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.writings_articles_heading()}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- find all my <span>blog articles</span> where i share
              my experience in web development --
            </>
          ) : (
            <>
              -- retrouvez tous mes <span>articles de blog</span> où
              je partage mon expérience en développement web --
            </>
          )}
        </Prose>
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- i cover <i>best practices</i>, <i>modern patterns</i>
              , solutions to everyday technical problems, and my
              discoveries about the <i>JavaScript</i> ecosystem --
            </>
          ) : (
            <>
              -- j'y aborde les <i>bonnes pratiques</i>, les{" "}
              <i>patterns modernes</i>, les solutions aux problèmes
              techniques du quotidien, et mes découvertes sur
              l'écosystème <i>JavaScript</i> --
            </>
          )}
        </Prose>
      </PanelContent>

      <WritingsTagFilter>
        <WritingsTags tagCounts={tagCounts} tags={tags} />

        <Divider before={false} border={false} type="half" />

        <div className="flex flex-col">
          {contents.map(
            ({ metadata: itemMetadata, slug, reading, content }) => {
              const {
                category,
                image,
                title,
                description,
                cover,
                author,
                createdAt,
                tags: itemTags,
              } = itemMetadata;
              return (
                <WritingsFilterItem key={slug} tags={itemTags}>
                  <div>
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
                      tags={itemTags}
                      title={title}
                    />
                  </div>
                </WritingsFilterItem>
              );
            }
          )}
        </div>
      </WritingsTagFilter>
    </div>
  );
};

const ArticlesPage = () => <ArticlesIndex />;

export default ArticlesPage;
