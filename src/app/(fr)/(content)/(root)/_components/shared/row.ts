/**
 * Ce que les rangées de la page d'accueil ont en commun.
 *
 * Articles, certifications, outils, expériences et projets écrivaient ces
 * classes chacun de leur côté, et elles avaient dérivé : trois gouttières
 * (8, 12 et 16 px) pour un même rail, et un survol réduit à `bg-accent2`,
 * soit 1,035:1 en sombre et 1,052:1 en clair — mesuré, donc invisible.
 *
 * Tout s'aligne sur les 12 px des primitives de `Panel` (`px-3`) : le titre de
 * section, le texte d'introduction et les rangées démarrent sur la même
 * verticale, ce qui est la promesse d'une grille de plan.
 */

/**
 * Au survol, le titre se souligne d'un filet d'accent.
 *
 * Pas de `text-theme` : en clair, l'accent bleu sur le fond de survol tombe à
 * 4,28:1, sous le seuil AA, et axe ne scanne que l'état au repos. Le filet
 * donne le signal sans toucher à la couleur du texte.
 */
export const ROW_TITLE_HOVER =
  "decoration-1 decoration-theme underline-offset-4 group-hover/row:underline";

/** la cellule du chevron descend d'un cran au survol : « ça se déplie » */
export const ROW_CHEVRON =
  "relative mx-3 my-4 flex size-6 shrink-0 items-center justify-center transition-transform duration-200 group-hover/row:translate-y-0.5 sm:size-8";

/** la rangée d'ornement et de badges, sous le titre */
export const ROW_META =
  "screen-line-before flex items-center justify-between gap-2 px-3 py-2 sm:gap-4";
