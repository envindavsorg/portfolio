import type { Metadata } from "next";
import Link from "next/link";

import { PROJECTS } from "@/app/(fr)/(content)/(root)/_components/projects/content";
import { Divider } from "@/components/base/Divider";
import { PanelContent } from "@/components/base/Panel";
import { PixelHeading } from "@/components/blocks/PixelHeading";
import { WritingsBreadcrumb } from "@/components/features/WritingsBreadcrumb";
import { Badge } from "@/components/primitives/Badge";
import { Tag } from "@/components/primitives/Tag";
import { Prose } from "@/components/primitives/Typography";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import { projectPages, toProjectEntry } from "@/lib/showcase";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

const pageDescription =
  "Les projets de florin cuzeac, un par un : ce qu'ils font, pourquoi ils existent et avec quoi ils sont construits.";

export const metadata: Metadata = createMetadata({
  description: pageDescription,
  ogImageParams: {
    description: pageDescription,
    title: "Projets",
    type: "project",
  },
  path: "/projects",
  title: "Projets",
});

export const ProjectsIndex = ({
  locale = "fr",
}: Readonly<{ locale?: AppLocale }>) => {
  const options = { locale } as const;
  const projects = projectPages(PROJECTS).map((project) =>
    toProjectEntry(project, locale)
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
            label: m.showcase_breadcrumb_projects(undefined, options),
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
          {m.showcase_project_heading(undefined, options)}
        </PixelHeading>
      </div>

      <PanelContent className="screen-line-after screen-line-before">
        <Prose>{m.showcase_project_intro(undefined, options)}</Prose>
        <Prose>
          {m.showcase_project_count(
            { count: projects.length },
            options
          )}
        </Prose>
      </PanelContent>

      <ul className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li className="flex" key={project.id}>
            <article className="group relative flex flex-1 flex-col gap-y-2 rounded-xl border border-input bg-background p-4 transition-colors hover:bg-accent2 focus-within:border-theme">
              <div className="flex items-start justify-between gap-x-2">
                <h2 className="font-pixel-square text-base lowercase">
                  <Link
                    className="after:absolute after:inset-0 after:rounded-xl group-hover:text-theme"
                    href={localizeHref(`/projects/${project.id}`)}
                  >
                    {project.name}
                  </Link>
                </h2>

                <Badge className="shrink-0 lowercase">
                  {project.type}
                </Badge>
              </div>

              <p className="text-muted-foreground text-sm">
                {project.title}
              </p>

              <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
                {project.skills.slice(0, 4).map((skill) => (
                  <li className="flex" key={skill}>
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Page = () => <ProjectsIndex />;

export default Page;
