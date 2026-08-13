import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PROJECTS } from "@/app/(fr)/(content)/(root)/_components/projects/content";
import { ShowcaseDetail } from "@/components/features/ShowcaseDetail";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import {
  findBySlug,
  neighbours,
  projectPages,
  toProjectEntry,
} from "@/lib/showcase";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

/**
 * La fiche d'un projet.
 *
 * Le slug est l'`id` du projet, identique dans les deux langues : l'URL d'un
 * projet est donc la même sous `/` et sous `/en`, et le sitemap peut déclarer la
 * paire hreflang. Un slug traduit aurait forké l'espace d'URL, comme l'avaient
 * fait les tags.
 */

const pages = () => projectPages(PROJECTS);

export const projectStaticParams = () =>
  pages().map((project) => ({ slug: project.id }));

export const generateStaticParams = () => projectStaticParams();

const localeOptions = (locale: AppLocale) =>
  ({ locale }) as { locale: AppLocale };

export const buildProjectMetadata = async ({
  locale = "fr",
  params,
}: {
  locale?: AppLocale;
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const project = findBySlug(pages(), slug);

  if (!project) {
    return {};
  }

  const entry = toProjectEntry(project, locale);
  const description = `${entry.title} ${entry.skills.slice(0, 6).join(", ")}.`;

  return createMetadata({
    description,
    locale,
    ogImageParams: {
      description: entry.title,
      // la stack en pastilles sur la carte : c'est ce qu'on regarde en premier
      // sur un projet partagé
      meta: entry.skills.slice(1, 5).join(", "),
      title: entry.name,
      type: "project",
    },
    path: `/projects/${project.id}`,
    title: entry.name,
  });
};

export const generateMetadata = (props: {
  params: Promise<{ slug: string }>;
}) => buildProjectMetadata(props);

export const ProjectView = async ({
  locale = "fr",
  params,
}: {
  locale?: AppLocale;
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const items = pages();
  const project = findBySlug(items, slug);

  if (!project) {
    notFound();
  }

  const entry = toProjectEntry(project, locale);
  const { next, previous } = neighbours(items, slug);
  const options = localeOptions(locale);

  return (
    <ShowcaseDetail
      breadcrumb={[
        {
          href: localizeHref("/"),
          label: m.writings_breadcrumb_home(undefined, options),
        },
        {
          href: localizeHref("/projects"),
          label: m.showcase_breadcrumb_projects(undefined, options),
        },
        { label: entry.name },
      ]}
      highlights={{
        items: entry.highlights,
        title: m.showcase_project_highlights(undefined, options),
      }}
      lead={entry.title}
      link={{
        href: entry.link,
        label: m.showcase_project_visit(undefined, options),
      }}
      meta={[entry.type]}
      navigation={{
        all: {
          href: localizeHref("/projects"),
          label: m.showcase_all_projects(undefined, options),
        },
        nextLabel: m.showcase_next(undefined, options),
        previousLabel: m.showcase_previous(undefined, options),
        ...(next && {
          next: {
            href: localizeHref(`/projects/${next.id}`),
            label: next.name,
          },
        }),
        ...(previous && {
          previous: {
            href: localizeHref(`/projects/${previous.id}`),
            label: previous.name,
          },
        }),
      }}
      skills={{
        items: entry.skills,
        title: m.cv_section_skills(undefined, options),
      }}
      title={entry.name}
    />
  );
};

const Page = (props: { params: Promise<{ slug: string }> }) => (
  <ProjectView {...props} />
);

export default Page;
