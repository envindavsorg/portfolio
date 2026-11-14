import { getAllContent } from "@/lib/content";
import { feedMeta, rssResponse } from "@/lib/feed-routes";
import { feedTitle } from "@/lib/metadata";
import * as m from "@/paraglide/messages";

export const dynamic = "force-static";

/**
 * Le flux de l'arbre anglais.
 *
 * Chaque page /en annonçait /api/rss sous le libellé « all content » : 22
 * éléments en français, aucun lien vers /en. Un segment statique passe avant
 * `[category]`, donc « en » n'est pas pris pour une catégorie inconnue. Le
 * titre est celui que le `<head>` annonce, mot pour mot.
 */
export const GET = (): Response =>
  rssResponse(
    getAllContent("en"),
    feedMeta({
      description: m.user_bio(undefined, { locale: "en" }),
      locale: "en",
      path: "/api/rss/en",
      title: feedTitle("en", "all"),
    })
  );
