import type { Experience } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import type { Project } from "@/app/(fr)/(content)/(root)/_components/projects/content";
import { slugify } from "@/lib/case";
import type { AppLocale } from "@/lib/i18n";

/**
 * Les réalisations qui ont désormais leur propre URL.
 *
 * Projets et postes n'existaient qu'en accordéon sur la page d'accueil : aucun
 * lien ne pouvait désigner UNE réalisation. C'est la pièce qui manque à un
 * portfolio — on envoie un lien vers un projet, pas vers une page d'accueil en
 * demandant de dérouler le troisième bloc.
 *
 * Les données arrivent en PARAMÈTRE, comme dans `cv.ts` : le module reste
 * testable sans traîner le graphe des composants.
 *
 * L'`id` déjà présent dans les données sert de slug. C'est un choix, pas une
 * commodité : cet identifiant est le même dans les deux langues, donc l'URL
 * d'une fiche est la même sous `/` et sous `/en`, et un lien partagé retombe sur
 * la même réalisation. C'est la leçon des tags, dont la clé traduite avait forké
 * l'espace d'URL.
 */

export interface ProjectEntry {
  id: string;
  name: string;
  type: string;
  title: string;
  link: string;
  skills: string[];
  highlights: string[];
}

/** une entrée adressable : celle dont l'`id` peut devenir un segment d'URL */
interface Identified {
  id: string;
}

/**
 * Un `id` qui ne survit pas à la slugification ne peut pas produire de page.
 *
 * Le filtre est appliqué au même endroit pour `generateStaticParams`, le sitemap
 * et les liens : une entrée mal nommée disparaît partout à la fois, au lieu
 * d'être annoncée quelque part et de répondre 404 ailleurs.
 */
const isAddressable = (item: Identified): boolean =>
  Boolean(item.id) && slugify(item.id) === item.id;

/**
 * Une expérience mérite une fiche si elle a quelque chose à y mettre.
 *
 * Les trois formations n'ont ni puces ni compétences : leur fiche se réduirait à
 * un intitulé et deux dates, déjà lisibles sur le CV et sur la page d'accueil.
 * Publier une page vide par entrée gonfle le sitemap sans rien donner à lire.
 */
const hasSubstance = (experience: Experience): boolean =>
  (experience.description?.length ?? 0) > 0 ||
  (experience.skills?.length ?? 0) > 0;

/** les projets qui ont une fiche, dans l'ordre où ils sont déclarés */
export const projectPages = (projects: Project[]): Project[] =>
  projects.filter(isAddressable);

/** les expériences qui ont une fiche, dans l'ordre où elles sont déclarées */
export const experiencePages = (
  experiences: Experience[]
): Experience[] =>
  experiences.filter(
    (experience) =>
      isAddressable(experience) && hasSubstance(experience)
  );

export const findBySlug = <T extends Identified>(
  items: T[],
  slug: string
): T | null => items.find((item) => item.id === slug) ?? null;

/**
 * Fiches précédente et suivante, dans l'ordre de déclaration.
 *
 * Pas de bouclage : arrivé à la dernière fiche, « suivant » est absent plutôt
 * que de renvoyer à la première. Un anneau donne l'illusion d'une liste infinie
 * et empêche de savoir qu'on a tout vu.
 */
export const neighbours = <T extends Identified>(
  items: T[],
  slug: string
): { previous: T | null; next: T | null } => {
  const index = items.findIndex((item) => item.id === slug);

  if (index === -1) {
    return { next: null, previous: null };
  }

  return {
    next: items[index + 1] ?? null,
    previous: items[index - 1] ?? null,
  };
};

/**
 * Les `id` en doublon, s'il y en a.
 *
 * Deux entrées partageant un `id` produiraient une seule page, et la seconde
 * serait injoignable sans que rien ne le signale — ni le build, ni un test de
 * rendu. C'est vérifié sur les données réelles par un test.
 */
export const duplicateIds = (items: Identified[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const { id } of items) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }

  return [...duplicates].toSorted();
};

export const toProjectEntry = (
  project: Project,
  locale: AppLocale
): ProjectEntry => {
  // les messages sont APPELÉS avec une locale explicite : `${message}`
  // interpolerait le code source de la fonction, sans le moindre avertissement
  const options = { locale } as const;

  return {
    highlights: project.description.map((line) =>
      line(undefined, options)
    ),
    id: project.id,
    link: project.link,
    name: project.name,
    skills: project.skills,
    title: project.title(undefined, options),
    type: project.type(undefined, options),
  };
};
