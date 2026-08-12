import { PROJECTS } from "@/app/(fr)/(content)/(root)/_components/projects/content";
import type { AppLocale } from "@/lib/i18n";

/**
 * Le miroir texte est en français, comme /about.md et /experience.md.
 *
 * La locale est passée EXPLICITEMENT à chaque message plutôt que laissée au
 * `getLocale()` implicite : un gestionnaire de route n'est pas rendu à travers un
 * layout, donc personne n'a appelé `setServerLocale` et la valeur ne viendrait que
 * du défaut de `src/lib/i18n.ts`. Dépendre de ce défaut, c'est faire tenir le
 * contenu publié sur un effet de bord invisible.
 */
const MIRROR_LOCALE: AppLocale = "fr";

const options = { locale: MIRROR_LOCALE } as const;

const content = `# Projects

${PROJECTS.map((item) => {
  const skills = `\n\nCompétences: ${item.skills.join(", ")}`;
  // `item.description` est un tableau de MESSAGES : les appeler un par un.
  // `${item.description}` interpolait le code source des fonctions, et c'est
  // littéralement ce que les crawlers recevaient à la place du texte.
  const description = item.description.length
    ? `\n\n${item.description.map((desc) => `- ${desc(undefined, options)}`).join("\n")}`
    : "";

  return `## ${item.title(undefined, options)}\n\nType: ${item.type(undefined, options)}\n\nLien du projet: ${item.link}${skills}${description}`;
}).join("\n\n")}
`;

export const dynamic = "force-static";

export const GET = async (): Promise<Response> =>
  new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
