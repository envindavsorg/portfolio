import { localizeHref } from "@/paraglide/runtime";

// `localizeHref("/")` rend « /en/ » quand `usePathname()` rend « /en » : on
// compare sans la barre finale, et la racine française devient la chaîne vide
const trimSlash = (path: string): string => path.replace(/\/$/u, "");

/**
 * Vrai sur l'accueil des DEUX langues.
 *
 * Le test était `pathname === "/"` à trois endroits : sur `/en`, aucun lien du
 * menu n'était actif, le logo doublait celui de la couverture et la palette
 * rechargeait la page pour atteindre une section pourtant sous les yeux.
 */
export const isHomePath = (pathname: string | null): boolean =>
  trimSlash(pathname ?? "") === trimSlash(localizeHref("/"));

/**
 * `link` est la route SANS préfixe de langue, celle de `NAVIGATION_DATA`. La
 * localisation se fait ici pour que l'accueil reste reconnaissable : une fois
 * localisé il vaut « /en », et tous les chemins anglais commencent par lui.
 */
export const isRouteActive = (
  link: string,
  pathname: string | null
): boolean => {
  const href = trimSlash(localizeHref(link));
  const path = trimSlash(pathname ?? "");

  if (path === href) {
    return true;
  }

  if (link === "/") {
    return false;
  }

  return path.startsWith(`${href}/`);
};
