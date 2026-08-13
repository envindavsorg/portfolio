import { CheckIcon, InfoIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";

import { ArticleItem } from "@/app/(fr)/(content)/(root)/_components/articles/ArticleItem";
import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/blocks/Terminal";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import {
  WritingsFilterItem,
  WritingsTagFilter,
} from "@/components/features/WritingsTagFilter";
import { WritingsTags } from "@/components/features/WritingsTags";
import { Prose } from "@/components/primitives/Typography";
import type { Content, ContentLocale } from "@/lib/content";
import { getContentByCategory } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import { getTagData } from "@/lib/tags";
import { m } from "@/paraglide/messages";
import { getLocale, localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Ma collection de snippets React réutilisables dans tous vos projets.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Composants React",
    type: "components",
  },
  path: "/components",
  title: "Composants React",
});

export const ComponentsIndex = ({
  locale = "fr",
}: Readonly<{ locale?: ContentLocale }>) => {
  const contents = getContentByCategory("components", locale);
  const { tagCounts, tagLabels, tags } = getTagData(contents, locale);

  return (
    <div className="screen-line-after min-h-svh">
      <WritingsBreadcrumb
        items={[
          {
            href: localizeHref("/"),
            label: m.writings_breadcrumb_home(),
          },
          { label: m.writings_breadcrumb_components() },
        ]}
      />

      <Divider before={false} border={false} type="half" />

      <div className="flex w-full items-center justify-between gap-x-3 px-3">
        <PixelHeading
          autoPlay
          className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
          mode="multi"
        >
          {m.writings_components_heading()}
        </PixelHeading>
      </div>

      <Terminal className="screen-line-before text-xs sm:text-sm">
        <TypingAnimation className="text-theme">
          &gt; pnpm dlx shadcn@latest add @envindavsorg/composant
        </TypingAnimation>
        <AnimatedSpan className="mt-2 flex items-center gap-x-2">
          <CheckIcon className="size-3 text-green-500" />
          <span>
            {getLocale() === "en"
              ? "checking registry ..."
              : "Vérification du registre ..."}
          </span>
        </AnimatedSpan>
        <AnimatedSpan className="mt-2 flex items-center gap-x-2">
          <CheckIcon className="size-3 text-green-500" />
          <span>
            {getLocale() === "en"
              ? "installing your component ..."
              : "Installation de votre composant ..."}
          </span>
        </AnimatedSpan>
        <AnimatedSpan className="mt-2 flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2 text-green-500">
            <InfoIcon className="size-3" />
            <span>
              {m.writings_components_terminal_file_created()}
            </span>
          </div>
          <span className="pl-4 text-muted-foreground">
            - components/ui/composant.tsx
          </span>
        </AnimatedSpan>
      </Terminal>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- speed up your development with a{" "}
              <i>
                complete collection of optimized react components and
                hooks
              </i>
              , built for modern, high-performance applications. --
            </>
          ) : (
            <>
              -- accélérez vos développements avec une{" "}
              <i>
                collection complète de composants et hooks React
                optimisés
              </i>
              , conçus pour des applications modernes et performantes.
              --
            </>
          )}
        </Prose>
        <Prose>
          {getLocale() === "en" ? (
            <>
              -- compatible with <span>App Router</span>,{" "}
              <span>Server Components</span> and{" "}
              <span>Server Actions</span>. seamless integration with
              the latest features of <i>Next.js 16</i> --
            </>
          ) : (
            <>
              -- compatibles <span>App Router</span>,{" "}
              <span>Server Components</span> et{" "}
              <span>Server Actions</span>. Intégration transparente
              avec les dernières fonctionnalités de <i>Next.js 16</i>{" "}
              --
            </>
          )}
        </Prose>
      </PanelContent>

      <WritingsTagFilter>
        <WritingsTags
          labels={tagLabels}
          tagCounts={tagCounts}
          tags={tags}
        />

        <Divider
          after={false}
          before={false}
          border={false}
          type="half"
        />

        <div className="screen-line-before screen-line-after relative py-4">
          <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
            <div className="border-edge border-r" />
            <div className="border-edge border-l" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {contents.map((component: Content) => (
              <WritingsFilterItem
                key={component.slug}
                tags={component.metadata.tags}
              >
                <ArticleItem article={component} noMetadata={true} />
              </WritingsFilterItem>
            ))}
          </div>
        </div>
      </WritingsTagFilter>
    </div>
  );
};

const ComponentsPage = () => <ComponentsIndex />;

export default ComponentsPage;
