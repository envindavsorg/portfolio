import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import { ShowcaseDetail } from "@/components/features/ShowcaseDetail";
import { toExperienceEntry } from "@/lib/cv";
import type { AppLocale } from "@/lib/i18n";
import { createMetadata } from "@/lib/metadata";
import {
  experiencePages,
  findBySlug,
  neighbours,
} from "@/lib/showcase";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

/**
 * La fiche d'un poste.
 *
 * La projection vient de `toExperienceEntry`, celle qui construit déjà le CV :
 * un poste affiche donc ici exactement ce qu'il affiche là-bas, y compris la
 * période et l'intitulé. Deux projections auraient fini par se contredire, et
 * c'est le CV qui part en pièce jointe par courriel.
 *
 * Les formations n'ont pas de fiche : sans puces ni compétences, leur page se
 * réduirait à un intitulé et deux dates déjà lisibles sur /cv.
 */

const pages = () => experiencePages(EXPERIENCES);

export const experienceStaticParams = () =>
  pages().map((experience) => ({ slug: experience.id }));

export const generateStaticParams = () => experienceStaticParams();

export const buildExperienceMetadata = async ({
  locale = "fr",
  params,
}: {
  locale?: AppLocale;
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const experience = findBySlug(pages(), slug);

  if (!experience) {
    return {};
  }

  const options = { locale } as const;
  const entry = toExperienceEntry(
    experience,
    locale,
    m.cv_present(undefined, options)
  );
  const title = `${entry.title} · ${entry.company}`;
  const description = `${entry.title} chez ${entry.company} (${entry.period}) — ${entry.skills.slice(0, 6).join(", ")}.`;
  const descriptionEn = `${entry.title} at ${entry.company} (${entry.period}) — ${entry.skills.slice(0, 6).join(", ")}.`;

  return createMetadata({
    description: locale === "en" ? descriptionEn : description,
    locale,
    ogImageParams: {
      description: entry.company,
      // la période passe en tête : le gabarit de fiche de poste l'affiche en
      // grand, c'est l'information qu'on cherche sur un parcours
      meta: [entry.period, entry.type].filter(Boolean).join(" · "),
      title: entry.title,
      type: "experience",
    },
    path: `/experience/${experience.id}`,
    title,
  });
};

export const generateMetadata = (props: {
  params: Promise<{ slug: string }>;
}) => buildExperienceMetadata(props);

export const ExperienceView = async ({
  locale = "fr",
  params,
}: {
  locale?: AppLocale;
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const items = pages();
  const experience = findBySlug(items, slug);

  if (!experience) {
    notFound();
  }

  const options = { locale } as const;
  const entry = toExperienceEntry(
    experience,
    locale,
    m.cv_present(undefined, options)
  );
  const { next, previous } = neighbours(items, slug);

  return (
    <ShowcaseDetail
      breadcrumb={[
        {
          href: localizeHref("/"),
          label: m.writings_breadcrumb_home(undefined, options),
        },
        {
          href: localizeHref("/experience"),
          label: m.showcase_breadcrumb_experience(undefined, options),
        },
        { label: entry.company },
      ]}
      highlights={{
        items: entry.highlights,
        title: m.showcase_experience_highlights(undefined, options),
      }}
      lead={`${entry.title} · ${entry.company}`}
      {...(entry.link && {
        link: {
          href: entry.link,
          label: m.showcase_experience_company(undefined, options),
        },
      })}
      meta={[entry.period, entry.type].filter(
        (value): value is string => Boolean(value)
      )}
      navigation={{
        all: {
          href: localizeHref("/experience"),
          label: m.showcase_all_experience(undefined, options),
        },
        nextLabel: m.showcase_next(undefined, options),
        previousLabel: m.showcase_previous(undefined, options),
        ...(next && {
          next: {
            href: localizeHref(`/experience/${next.id}`),
            label: next.company.trim(),
          },
        }),
        ...(previous && {
          previous: {
            href: localizeHref(`/experience/${previous.id}`),
            label: previous.company.trim(),
          },
        }),
      }}
      skills={{
        items: entry.skills,
        title: m.cv_section_skills(undefined, options),
      }}
      title={entry.company.trim()}
    />
  );
};

const Page = (props: { params: Promise<{ slug: string }> }) => (
  <ExperienceView {...props} />
);

export default Page;
