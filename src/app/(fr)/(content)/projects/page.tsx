import type { Metadata } from "next";

import { PROJECTS } from "@/app/(fr)/(content)/(root)/_components/projects/content";
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
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import { projectPages, toProjectEntry } from "@/lib/showcase";
import * as m from "@/paraglide/messages";
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
    <PageColumn>
      <div className="screen-line-after min-h-svh">
        <WritingsBreadcrumb
          items={[
            {
              href: localizeHref("/"),
              label: m.writings_breadcrumb_home(undefined, options),
            },
            {
              label: m.showcase_breadcrumb_projects(
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
            {m.showcase_project_heading(undefined, options)}
          </PixelHeading>
        </div>

        <PanelContent className="screen-line-after screen-line-before">
          <Prose>
            {m.showcase_project_intro(undefined, options)}
          </Prose>
          <Prose>
            {m.showcase_project_count(
              { count: projects.length },
              options
            )}
          </Prose>
        </PanelContent>

        {/* des cellules à filet, comme la grille du pied de page, plutôt que
            des cartouches arrondis posés dans la colonne. Le survol passe par
            le soulignement du titre : le fond seul change de 1,04:1. */}
        <ul className="grid sm:grid-cols-2">
          {projects.map((project) => (
            <li
              className="screen-line-after flex border-edge sm:odd:border-r"
              key={project.id}
            >
              <article className="group/row relative flex flex-1 flex-col gap-y-2 px-3 py-4 transition-colors hover:bg-accent2">
                <div className="flex items-start justify-between gap-x-2">
                  <h2 className="font-pixel-square text-base lowercase sm:text-lg">
                    <CardLink
                      className={ROW_TITLE_HOVER}
                      href={localizeHref(`/projects/${project.id}`)}
                    >
                      {project.name}
                    </CardLink>
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
    </PageColumn>
  );
};

const Page = () => <ProjectsIndex />;

export default Page;
