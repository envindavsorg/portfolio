import { CERTS } from "@/app/(fr)/(content)/(root)/_components/certs/content";
import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import { getContentByCategory } from "@/lib/content";
import { toExperienceEntry } from "@/lib/cv";
import type { AppLocale } from "@/lib/i18n";

/**
 * Miroir texte de /now.
 *
 * Comme la page, il est DÉRIVÉ du dépôt : poste en cours, trois derniers textes,
 * dernière certification. Un miroir écrit à la main se serait périmé sans que rien
 * ne le signale — et c'est précisément ce qu'un agent qui lit cette page ne doit
 * pas recevoir.
 */
const MIRROR_LOCALE: AppLocale = "fr";

const ARTICLE_COUNT = 3;

const buildContent = (): string => {
  const current = EXPERIENCES.find(
    (experience) => experience.isCurrentEmployer
  );
  const role = current
    ? toExperienceEntry(current, MIRROR_LOCALE, "aujourd'hui")
    : null;

  const articles = getContentByCategory("articles", "fr").slice(
    0,
    ARTICLE_COUNT
  );

  const [latestCert] = CERTS.toSorted(
    (left, right) =>
      new Date(right.issueDate).getTime() -
      new Date(left.issueDate).getTime()
  );

  const sections = [
    role
      ? `## Au travail\n\n${role.title} chez ${role.company}, ${role.period}.`
      : "",
    articles.length > 0
      ? `## Ce que je construis\n\n${articles
          .map(
            (article) =>
              `- ${article.metadata.title} (/articles/${article.slug})`
          )
          .join("\n")}`
      : "",
    latestCert
      ? `## Ce que j'apprends\n\nDernière certification: ${latestCert.title} (${latestCert.issuer}), délivrée le ${latestCert.issueDate}.`
      : "",
  ].filter(Boolean);

  return `# En ce moment\n\n${sections.join("\n\n")}\n`;
};

const content = buildContent();

export const dynamic = "force-static";

export const GET = async (): Promise<Response> =>
  new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
