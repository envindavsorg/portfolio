import { EXPERIENCES } from "@/app/(fr)/(content)/(root)/_components/experiences/content";
import type { AppLocale } from "@/lib/i18n";

/** Voir projects.md/route.ts : locale explicite, pas de `getLocale()` implicite. */
const MIRROR_LOCALE: AppLocale = "fr";

const options = { locale: MIRROR_LOCALE } as const;

const content = `
# Mes expériences professionnelles

${EXPERIENCES.map((item) => {
  const skills = item.skills?.join(", ") || "N/A";
  // titre, type et puces sont tous des MESSAGES, pas des chaînes : sans l'appel,
  // le miroir publiait `(e={},l={})=>"en"===(t.experimentalStaticLocale??…` à la
  // place de chaque intitulé de poste et de chaque puce
  const description = item.description
    ?.map((desc) => `- ${desc(undefined, options)}`)
    .join("\n");
  const period = `${item.period.start} - ${item.period.end || "Maintenant"}`;
  const type = item.type
    ? ` | **Type:** ${item.type(undefined, options)}`
    : "";
  const link = item.link ? `\n**Lien:** ${item.link}` : "";

  return `## ${item.title(undefined, options)} | ${item.company}

**Durée:** ${period}${type}${link}

**Compétences:** ${skills}

${description ?? ""}`;
}).join("\n\n---\n\n")}
`;

export const dynamic = "force-static";

export const GET = async (): Promise<Response> =>
  new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
