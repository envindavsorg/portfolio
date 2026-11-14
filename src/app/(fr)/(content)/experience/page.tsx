import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import { ROW_TITLE_HOVER } from "@/app/(fr)/(content)/(root)/_components/shared/row";
import { CardLink } from "@/components/base/CardLink";
import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { PageColumn } from "@/components/layout/PageColumn";
import { Badge } from "@/components/primitives/Badge";
import { Tag } from "@/components/primitives/Tag";
import { Prose } from "@/components/primitives/Typography";
import { toExperienceEntry } from "@/lib/cv";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import { experiencePages } from "@/lib/showcase";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Le parcours professionnel de florin cuzeac, poste par poste : le contexte, les responsabilités et la stack de chacun.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Expérience",
    type: "experience",
  },
  path: "/experience",
  title: "Expérience",
});

export const ExperienceIndex = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const options = { locale } as const;
  const present = m.cv_present(undefined, options);
  const entries = experiencePages(EXPERIENCES).map((experience) =>
    toExperienceEntry(experience, locale, present)
  );

  return (
    <PageColumn>
      <div className="screen-line-after min-h-svh">
        <WritingsBreadcrumb
          items={[
            {
              href: localizeHref("/"),
              label: m.writings_breadcrumb_home(undefined, options),
            },
            {
              label: m.showcase_breadcrumb_experience(
                undefined,
                options
              ),
            },
          ]}
        />

        <Divider before={false} border={false} type="half" />

        <div className="flex w-full items-center justify-between gap-x-3 px-3">
          <PixelHeading
            autoPlay
            className="text-balance font-extrabold text-[28px] leading-snug sm:text-4xl"
            mode="multi"
          >
            {m.showcase_experience_heading(undefined, options)}
          </PixelHeading>
        </div>

        <PanelContent className="screen-line-after screen-line-before">
          <Prose>
            {m.showcase_experience_intro(undefined, options)}
          </Prose>
          <Prose>
            {m.showcase_experience_count(
              { count: entries.length },
              options
            )}
          </Prose>
        </PanelContent>

        <ul className="flex flex-col">
          {entries.map((entry) => (
            // le survol n'est pas porté par le fond seul : `bg-accent2` change
            // la rangée de 1,05:1. Le titre se souligne et la flèche avance.
            <li
              className="group/row screen-line-after flex items-stretch transition-colors hover:bg-accent2"
              key={entry.id}
            >
              <div className="min-w-0 flex-1 border-edge border-r px-3 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h2 className="font-pixel-square text-base lowercase sm:text-lg">
                    <CardLink
                      className={ROW_TITLE_HOVER}
                      href={localizeHref(`/experience/${entry.id}`)}
                    >
                      {entry.company}
                    </CardLink>
                  </h2>

                  <span className="text-muted-foreground text-xs tabular-nums">
                    {entry.period}
                  </span>
                </div>

                <p className="pt-1 text-muted-foreground text-sm">
                  {entry.title}
                  {entry.type ? (
                    <Badge className="ml-2 lowercase">
                      {entry.type}
                    </Badge>
                  ) : null}
                </p>

                <ul className="flex flex-wrap gap-1.5 pt-2">
                  {entry.skills.slice(0, 6).map((skill) => (
                    <li className="flex" key={skill}>
                      <Tag>{skill}</Tag>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                aria-hidden="true"
                className="flex shrink-0 items-center px-3 text-muted-foreground transition-[color,translate] duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-theme sm:px-4"
              >
                <ArrowRightIcon className="size-4" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageColumn>
  );
};

const Page = () => <ExperienceIndex />;

export default Page;
