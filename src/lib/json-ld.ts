import type {
  BlogPosting as PageSchema,
  WithContext,
} from "schema-dts";

import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import GLOBAL_DATA from "@/data/global";
import type { AppLocale } from "@/lib/i18n";
import { m } from "@/paraglide/messages";

import type { Content } from "./content";
import { dayjs } from "./functions";
import { BASE_URL, openGraphImage } from "./metadata";

const CATEGORY_OG_TYPES: Record<string, PageType> = {
  articles: "blogArticle",
  components: "componentsArticle",
  utils: "utilsArticle",
};

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
        worksFor: GLOBAL_DATA.WORK.jobs.map((job) => ({
          "@type": "Organization",
          name: job.company,
          url: job.website,
        })),
      },
    ],
  };
};

export const getPageJsonLd = (
  { locale: fileLocale, metadata, slug }: Content,
  /** locale de la PAGE, pas du fichier servi : /en peut afficher du contenu FR */
  locale: AppLocale = "fr"
): WithContext<PageSchema> => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  // référence au nœud du graphe racine : l'auteur s'appelait « florin » ici et
  // « florin cuzeac » là, donc deux personnes différentes pour un moteur
  author: { "@id": PERSON_ID },
  dateModified: dayjs(metadata.updatedAt).toISOString(),
  datePublished: dayjs(metadata.createdAt).toISOString(),
  description: metadata.description,
  headline: metadata.title,
  image: metadata.image
    ? `${BASE_URL}${metadata.image}`
    : openGraphImage({
        description: metadata.description,
        locale,
        title: metadata.title,
        type: CATEGORY_OG_TYPES[metadata.category ?? "articles"],
      }),
  // la locale du FICHIER, pas celle de la page : une page /en qui retombe sur la
  // source française sert bien du texte français, et l'annoncer en `en-US`
  // trompe autant un moteur qu'un lecteur d'écran (WCAG 3.1.2)
  inLanguage: localeTag(fileLocale),
  isPartOf: { "@id": WEBSITE_ID },
  ...(metadata.tags?.length && {
    keywords: metadata.tags.join(", "),
  }),
  url: `${BASE_URL}${locale === "en" ? "/en" : ""}/${metadata.category}/${slug}`,
});

export { getBreadcrumbJsonLd } from "./breadcrumb-json-ld";
