import type { Cert } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import type { Experience } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import type { AppLocale } from "@/lib/i18n";

/**
 * Le CV, projeté depuis les données déjà présentes dans le dépôt.
 *
 * Rien n'est inventé ici : les postes, les diplômes et les certifications
 * existent déjà, avec leurs dates, leurs compétences et leurs descriptions
 * bilingues. Ils n'étaient simplement lisibles nulle part sur le domaine —
 * `GLOBAL_DATA.CV.url` pointe vers un blob hors domaine, en une seule langue et
 * absent du sitemap.
 *
 * Les données arrivent en PARAMÈTRE et ne sont pas importées : le module reste
 * ainsi testable sans traîner le graphe des composants, comme `search.ts`.
 *
 * ⚠️ Les intitulés de poste viennent d'`EXPERIENCES`, jamais de `WORK.jobs`.
 * Les deux sources divergent — WeFix y est « Développeur Front-End Senior » d'un
 * côté et « Lead Développeur Front-End » de l'autre — et `WORK.jobs` n'existe
 * qu'en français : l'utiliser afficherait des intitulés français sur /en/cv.
 */

export interface CvEntry {
  id: string;
  title: string;
  company: string;
  /** « 2020 — aujourd'hui » ; le libellé de fin est fourni par l'appelant */
  period: string;
  type?: string;
  link?: string;
  skills: string[];
  highlights: string[];
}

export interface CvCredential {
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  url: string;
}

export interface CvDocument {
  jobs: CvEntry[];
  education: CvEntry[];
  credentials: CvCredential[];
  /** toutes les compétences citées, dédoublonnées, dans l'ordre d'apparition */
  skills: string[];
}

interface BuildCvInput {
  experiences: Experience[];
  certs: Cert[];
  locale: AppLocale;
  /** « aujourd'hui » / « present », traduit par l'appelant */
  presentLabel: string;
}

const toEntry = (
  experience: Experience,
  locale: AppLocale,
  presentLabel: string
): CvEntry => {
  // les messages sont APPELÉS, avec une locale explicite. `${message}` compile
  // sans bruit et interpole le code source de la fonction : c'est exactement ce
  // que /projects.md a servi aux crawlers pendant des mois.
  const options = { locale } as const;
  const { end, start } = experience.period;

  return {
    company: experience.company.trim(),
    highlights: (experience.description ?? []).map((line) =>
      line(undefined, options)
    ),
    id: experience.id,
    ...(experience.link && { link: experience.link }),
    period: `${start} — ${end ?? presentLabel}`,
    skills: experience.skills ?? [],
    title: experience.title(undefined, options),
    ...(experience.type && {
      type: experience.type(undefined, options),
    }),
  };
};

export const buildCv = ({
  certs,
  experiences,
  locale,
  presentLabel,
}: BuildCvInput): CvDocument => {
  const entries = experiences.map((experience) =>
    toEntry(experience, locale, presentLabel)
  );

  const jobs = experiences
    .map((experience, index) => ({
      entry: entries[index],
      experience,
    }))
    .filter(({ experience }) => experience.kind === "job")
    .map(({ entry }) => entry);

  const education = experiences
    .map((experience, index) => ({
      entry: entries[index],
      experience,
    }))
    .filter(({ experience }) => experience.kind === "education")
    .map(({ entry }) => entry);

  // dédoublonnage en gardant l'ordre d'apparition : un CV qui liste « React »
  // trois fois se lit comme une liste non relue
  const skills = [...new Set(jobs.flatMap((job) => job.skills))];

  return {
    credentials: certs.map((cert) => ({
      credentialId: cert.credentialID,
      issueDate: cert.issueDate,
      issuer: cert.issuer,
      name: cert.title,
      url: cert.credentialURL,
    })),
    education,
    jobs,
    skills,
  };
};
