import type { Metadata } from "next";
import Link from "next/link";

import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Badge } from "@/components/primitives/Badge";
import { Prose } from "@/components/primitives/Typography";
import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { getTagIndex } from "@/lib/tags";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Tous les sujets abordés sur le site : chaque tag rassemble les articles, composants et outils qui le concernent.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Tous les sujets",
    type: "blog",
  },
  path: "/tags",
  title: "Tous les sujets",
});

export const TagsIndex = ({
  locale = "fr",
}: Readonly<{ locale?: ContentLocale }>) => {
  const tags = getTagIndex(getAllContent(locale));

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(),
          },
          { label: m.writings_breadcrumb_tags() },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.writings_tags_heading()}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>{m.writings_tags_intro()}</Prose>
        <Prose>{m.writings_tags_count({ count: tags.length })}</Prose>
      </PanelContent>

      <ul className="flex flex-wrap gap-2 p-3">
        {tags.map((tag) => (
          <li key={tag.slug}>
            <Link
              className="flex items-center gap-x-2 rounded-full border border-input px-3 py-1.5 text-sm lowercase transition-colors hover:border-theme hover:text-theme focus-visible:border-theme focus-visible:text-theme"
              href={localizeHref(`/tags/${tag.slug}`)}
            >
              {tag.label}
              <span className="text-muted-foreground text-xs">
                {tag.count}
              </span>
              {/* un sujet transversal est l'information que le filtre par
                  catégorie ne pouvait pas donner : on la montre ici */}
              {tag.categories.length > 1 && (
                <Badge
                  className="shrink-0 lowercase"
                  variant="primary"
                >
                  {tag.categories.length}
                </Badge>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TagsPage = () => <TagsIndex />;

export default TagsPage;
