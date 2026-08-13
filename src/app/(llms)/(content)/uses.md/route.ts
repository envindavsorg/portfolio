import { usesGroups } from "@/data/uses";
import type { AppLocale } from "@/lib/i18n";

/**
 * Miroir texte de /uses, en français comme les autres.
 *
 * La locale est passée EXPLICITEMENT à chaque message : un gestionnaire de route
 * n'est pas rendu à travers un layout, donc personne n'a appelé
 * `setServerLocale`. Et les messages sont APPELÉS — `${message}` interpole le code
 * source de la fonction, ce que ce miroir a déjà servi aux crawlers.
 */
const MIRROR_LOCALE: AppLocale = "fr";

const options = { locale: MIRROR_LOCALE } as const;

const content = `# Ce que j'utilise

${usesGroups()
  .map((group) => {
    const items = group.items
      .map((item) =>
        item.link ? `- ${item.name} (${item.link})` : `- ${item.name}`
      )
      .join("\n");

    return `## ${group.title(undefined, options)}\n\n${group.note(undefined, options)}\n\n${items}`;
  })
  .join("\n\n")}
`;

export const dynamic = "force-static";

export const GET = async (): Promise<Response> =>
  new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  });
