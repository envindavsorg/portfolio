import { WritingsBackToTop } from "./WritingsBackToTop";
import { WritingsProgress } from "./WritingsProgress";

/**
 * Aides à la lecture des pages de contenu (article, composant, outil) :
 * barre de progression et retour en haut de page.
 *
 * Réservé aux pages de détail — sur les index, une progression de lecture ne
 * veut rien dire.
 */
export const WritingsReadingAids = () => (
  <>
    <WritingsProgress />
    <WritingsBackToTop />
  </>
);
