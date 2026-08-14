import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/auth";
import { locationKey } from "@/lib/admin/paths";
import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Les 44 fichiers, dans les deux langues.
 *
 * La colonne « anglais » ne liste pas des fichiers mais un ÉTAT : un contenu
 * anglais absent retombe sur le français, et c'est `content.locale` qui le dit.
 * Cliquer dessus ouvre malgré tout l'éditeur — c'est ainsi qu'on crée la
 * traduction manquante.
 */
const ContentListPage = async () => {
  await requireAdminSession();

  const french = getAllContent("fr");
  const english = new Map(
    getAllContent("en").map((content) => [
      `${content.metadata.category}/${content.slug}`,
      content.locale,
    ])
  );

  const rows = french.map((content) => {
    const category = content.metadata.category ?? "articles";
    const servedLocale = english.get(`${category}/${content.slug}`);

    return {
      category,
      hasEnglish: servedLocale === "en",
      slug: content.slug,
      title: content.metadata.title,
    };
  });

  const editHref = (
    category: string,
    slug: string,
    locale: ContentLocale
  ) =>
    `/admin/content/${locationKey({
      category: category as never,
      locale,
      slug,
    })}`;

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-1">
        <h1 className="font-semibold text-2xl lowercase">contenu</h1>
        <p className="text-muted-foreground text-sm">
          {rows.length} contenus. Enregistrer crée un commit et
          déclenche un redéploiement.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-input">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-input border-b text-left text-muted-foreground">
              <th className="p-3 font-medium">titre</th>
              <th className="p-3 font-medium">catégorie</th>
              <th className="p-3 font-medium">français</th>
              <th className="p-3 font-medium">anglais</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="border-input border-t"
                key={`${row.category}/${row.slug}`}
              >
                <td className="p-3">
                  <span className="block">{row.title}</span>
                  <span className="block font-mono text-muted-foreground text-xs">
                    {row.slug}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {row.category}
                </td>
                <td className="p-3">
                  <Link
                    className="underline decoration-dotted underline-offset-4 hover:text-theme"
                    href={editHref(row.category, row.slug, "fr")}
                  >
                    éditer
                  </Link>
                </td>
                <td className="p-3">
                  <Link
                    className={cn(
                      "underline decoration-dotted underline-offset-4 hover:text-theme",
                      !row.hasEnglish && "text-muted-foreground"
                    )}
                    href={editHref(row.category, row.slug, "en")}
                  >
                    {row.hasEnglish ? "éditer" : "à traduire"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentListPage;
