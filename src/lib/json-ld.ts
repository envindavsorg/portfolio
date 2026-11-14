import type {
  BlogPosting,
  TechArticle,
  WithContext,
} from "schema-dts";

import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import GLOBAL_DATA from "@/data/global";
import type { AppLocale } from "@/lib/i18n";
import * as m from "@/paraglide/messages";

import type { Content } from "./content";
import { dayjs } from "./functions";
import {
  BASE_URL,
  contentOgImageParams,
  openGraphImage,
} from "./metadata";
import { tagLabel } from "./tags";

/**
 * Identifiants stables des nœuds du graphe.
 *
 * Sans `@id`, les deux nœuds du graphe racine étaient deux objets anonymes : rien
 * ne reliait le site à la personne, et l'auteur de chaque article était une
 * TROISIÈME personne, distincte, dupliquée sur chaque page. Un fragment d'URL
 * comme identifiant est la convention schema.org, et il reste stable entre les
 * locales — l'entité ne change pas de langue, seule sa description le fait.
 */
export const WEBSITE_ID = `${BASE_URL}/#website`;
export const PERSON_ID = `${BASE_URL}/#person`;

const localeTag = (locale: AppLocale): string =>
  locale === "en" ? "en-US" : "fr-FR";

/**
 * Les employeurs, lus dans `EXPERIENCES` et non dans `GLOBAL_DATA.WORK.jobs`.
 *
 * `worksFor` publiait les trois entrées de `WORK.jobs` : SpinalCom et l'Économat
 * des Armées y étaient déclarés employeurs ACTUELS sur chacune des pages, alors
 * que les fiches du site les datent 2019 — 2020 et 2017 — 2019. `WORK.jobs` ne
 * porte aucune période ; `EXPERIENCES` si, et c'est déjà la source du CV. Un
 * poste sans `period.end` est en cours : lui seul va dans `worksFor`, les autres
 * dans `alumniOf`.
 */
const employers = EXPERIENCES.filter((entry) => entry.kind === "job");

const isCurrent = (job: (typeof EXPERIENCES)[number]): boolean =>
  !job.period.end;

const toOrganization = (job: (typeof EXPERIENCES)[number]) => ({
  "@type": "Organization",
  name: job.company,
  ...(job.link && { url: job.link }),
});

/**
 * Le graphe du site, rendu une fois par le layout racine de chaque arbre.
 *
 * Il vivait dans RootDocument.tsx, sans test, et publiait la bio et le titre de
 * poste EN FRANÇAIS sur toutes les pages anglaises — qui se déclaraient pourtant
 * `inLanguage: en-US`.
 */
export const getSiteJsonLd = (locale: AppLocale = "fr") => {
  // la locale est passée EXPLICITEMENT aux messages, et pas laissée au
  // `getLocale()` ambiant. Prendre un paramètre `locale` pour n'en servir qu'à
  // remplir `inLanguage`, en laissant le texte suivre un état global, c'est
  // précisément l'incohérence qui a fait publier du français sous `en-US`.
  const t = { locale } as const;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": WEBSITE_ID,
        "@type": "WebSite",
        alternateName: [GLOBAL_DATA.USER.username],
        description: m.user_bio(undefined, t),
        inLanguage: localeTag(locale),
        name: GLOBAL_DATA.USER.fullName,
        // le nœud du site pointe vers celui de la personne, au lieu de le répéter
        publisher: { "@id": PERSON_ID },
        url: GLOBAL_DATA.SOCIAL.portfolio,
      },
      {
        "@id": PERSON_ID,
        "@type": "Person",
        address: {
          "@type": "PostalAddress",
          addressLocality: GLOBAL_DATA.USER.location.city,
        },
        alumniOf: employers
          .filter((job) => !isCurrent(job))
          .map(toOrganization),
        description: m.user_description(undefined, t),
        email: GLOBAL_DATA.USER.emailAddress,
        // les quatre certifications portent une URL de vérification publique :
        // c'est ce qui distingue une compétence déclarée d'une compétence prouvée
        hasCredential: CERTS.map((cert) => ({
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "certificate",
          name: cert.title,
          recognizedBy: {
            "@type": "Organization",
            name: cert.issuer,
          },
          url: cert.credentialURL,
        })),
        image: `${BASE_URL}${GLOBAL_DATA.USER.avatar}`,
        jobTitle: m.user_job_title(undefined, t),
        // `knowsAbout` était figé à trois entrées écrites à la main, alors que la
        // liste de mots-clés du site existe et est maintenue
        knowsAbout: GLOBAL_DATA.keywords,
        name: GLOBAL_DATA.USER.fullName,
        sameAs: [
          GLOBAL_DATA.SOCIAL.github,
          GLOBAL_DATA.SOCIAL.linkedin,
        ].filter(Boolean),
        url: GLOBAL_DATA.SOCIAL.portfolio,
        worksFor: employers.filter(isCurrent).map(toOrganization),
      },
    ],
  };
};

/**
 * « 8 min » → « PT8M » : la durée de lecture en ISO 8601.
 *
 * `content.ts` la produit déjà pour la signature de l'article ; rien si la
 * chaîne ne commence pas par un nombre.
 */
const toIsoDuration = (time: string): string | undefined => {
  const minutes = Number.parseInt(time, 10);

  return Number.isFinite(minutes) ? `PT${minutes}M` : undefined;
};

/**
 * Le nœud d'une page de contenu.
 *
 * Il se limitait à un titre, deux dates et un auteur, sans identifiant, et
 * typait `BlogPosting` la documentation d'un composant comme un billet. Il
 * porte maintenant un `@id`, se déclare entité principale de sa page, et publie
 * ce que `content.ts` calcule déjà : le nombre de mots et la durée de lecture.
 * Un composant est un `TechArticle`. Les outils restent `BlogPosting` :
 * `WebApplication` serait plus juste, mais le résultat enrichi que Google en
 * tire exige une note ou un avis (`aggregateRating` ou `review`), que le site
 * n'a pas — les 28 pages d'outils sortiraient en erreur dans la Search Console.
 */
export const getPageJsonLd = (
  content: Content,
  /** locale de la PAGE, pas du fichier servi : /en peut afficher du contenu FR */
  locale: AppLocale = "fr"
): WithContext<BlogPosting> | WithContext<TechArticle> => {
  const { locale: fileLocale, metadata, reading, slug } = content;
  const url = `${BASE_URL}${locale === "en" ? "/en" : ""}/${metadata.category}/${slug}`;
  const timeRequired = toIsoDuration(reading.time);

  const node = {
    "@context": "https://schema.org",
    "@id": `${url}#article`,
    // référence au nœud du graphe racine : l'auteur s'appelait « florin » ici et
    // « florin cuzeac » là, donc deux personnes différentes pour un moteur
    author: { "@id": PERSON_ID },
    dateModified: dayjs(metadata.updatedAt).toISOString(),
    datePublished: dayjs(metadata.createdAt).toISOString(),
    description: metadata.description,
    headline: metadata.title,
    // sans image de couverture, la carte sociale — la MÊME URL que `og:image`
    image: metadata.image
      ? `${BASE_URL}${metadata.image}`
      : openGraphImage({ locale, ...contentOgImageParams(content) }),
    // la locale du FICHIER, pas celle de la page : une page /en qui retombe sur
    // la source française sert bien du texte français, et l'annoncer en `en-US`
    // trompe autant un moteur qu'un lecteur d'écran (WCAG 3.1.2)
    inLanguage: localeTag(fileLocale),
    isPartOf: { "@id": WEBSITE_ID },
    // le LIBELLÉ dans la langue du fichier servi, comme `article:tag` : un tag
    // est une clé écrite en français, et les pages /en annonçaient
    // « retour d'expérience » à côté d'un `article:tag` « lessons learned »
    ...(metadata.tags?.length && {
      keywords: metadata.tags
        .map((tag) => tagLabel(tag, fileLocale))
        .join(", "),
    }),
    mainEntityOfPage: url,
    publisher: { "@id": PERSON_ID },
    ...(timeRequired && { timeRequired }),
    url,
    wordCount: reading.words,
  } as const;

  return metadata.category === "components"
    ? { ...node, "@type": "TechArticle" }
    : { ...node, "@type": "BlogPosting" };
};

export { getBreadcrumbJsonLd } from "./breadcrumb-json-ld";
