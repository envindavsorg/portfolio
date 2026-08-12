import { notFound } from "next/navigation";

import type { ContentLocale } from "@/lib/content";
import { getAllContent } from "@/lib/content";
import { toSearchDoc } from "@/lib/search";

export const dynamic = "force-static";

const LOCALES: ContentLocale[] = ["fr", "en"];

export const generateStaticParams = () =>
  LOCALES.map((locale) => ({ locale }));

/**
 * L'index de recherche, servi comme un fichier plutôt qu'embarqué dans les pages.
 *
 * La navbar appartient au chrome du site : construire l'index dedans le
 * sérialisait dans le payload RSC de CHAQUE page. Mesuré sur le build : 22
 * occurrences d'`excerpt` dans tags.html, articles.html et index.html — et 44
 * dans search.html, qui l'embarquait DEUX fois (une pour la navbar, une pour les
 * résultats). Autrement dit, ouvrir le code source d'une page du site affichait
 * un extrait de tous les contenus, sur toutes les pages, pour une fonctionnalité
 * que la plupart des visiteurs n'ouvrent jamais.
 *
 * `force-static` : l'index ne dépend que de fichiers sur le disque, il est donc
 * calculé au build comme les flux. `connect-src 'self'` couvre déjà le fetch,
 * aucun changement de CSP.
 */
export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
): Promise<Response> => {
  const { locale } = await params;

  if (!LOCALES.includes(locale as ContentLocale)) {
    notFound();
  }

  const docs = getAllContent(locale as ContentLocale).map(
    toSearchDoc
  );

  return Response.json(docs);
};
