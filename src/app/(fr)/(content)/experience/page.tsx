import type { Metadata } from "next";
import Link from "next/link";

import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
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
          <li
            className="screen-line-before group relative px-3 py-4 transition-colors hover:bg-accent2"
            key={entry.id}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h2 className="font-pixel-square text-base lowercase">
                <Link
                  className="after:absolute after:inset-0 group-hover:text-theme"
                  href={localizeHref(`/experience/${entry.id}`)}
                >
                  {entry.company}
                </Link>
              </h2>

              <span className="text-muted-foreground text-xs tabular-nums">
                {entry.period}
              </span>
            </div>

            <p className="pt-1 text-muted-foreground text-sm">
              {entry.title}
              {entry.type ? (
                <Badge className="ml-2 lowercase">{entry.type}</Badge>
              ) : null}
            </p>

            <ul className="flex flex-wrap gap-1.5 pt-2">
              {entry.skills.slice(0, 6).map((skill) => (
                <li className="flex" key={skill}>
                  <Tag>{skill}</Tag>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Page = () => <ExperienceIndex />;

export default Page;
