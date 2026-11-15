/**
 * Met en pause, hors de l'écran, l'animation CSS des éléments qu'on lui confie.
 *
 * Une animation CSS infinie ne s'arrête pas quand sa cible sort de l'écran : le
 * navigateur continue de la faire avancer sur le fil principal. Les quatre
 * halos de l'accueil (`animate-ping`) coûtaient ainsi 21 à 31 recalculs de
 * style par fenêtre de cinq secondes au profil téléphone, page défilée loin
 * d'eux ; en pause, 0 à 1.
 *
 * UN observateur pour toutes les cibles, créé avec la première. La pause est
 * un style en ligne posé hors de React (`animation-play-state`) : rien n'est
 * rendu à nouveau, le HTML servi ne change pas, et l'animation reprend où elle
 * s'était arrêtée.
 *
 * Deux routes sans JavaScript ont été essayées dans la page avant celle-ci.
 * `content-visibility: auto` n'arrête rien là où c'est mesuré : Chromium tient
 * pour proche, donc anime encore, un halo à 1191 px sous une fenêtre de 844
 * (il ne le saute qu'au-delà — vérifié à 1831 px). Une animation `view()` qui
 * piloterait `animation-play-state` par une variable met le halo en pause
 * PARTOUT, à l'écran compris : une variable animée est ignorée dans les
 * propriétés `animation-*`, c'est la règle (« animation-tainted »).
 *
 * À passer en `ref` : React 19 appelle la fonction rendue au démontage.
 */

/** la reprise précède l'entrée à l'écran : aucun halo n'y arrive figé */
const RESUME_MARGIN = "200px";

let sharedObserver: IntersectionObserver | null = null;

const getObserver = () => {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      // plusieurs cibles : tous les changements du lot, dans l'ordre — le
      // dernier seul ne parlerait que d'une cible
      for (const entry of entries) {
        if (entry.target instanceof HTMLElement) {
          entry.target.style.animationPlayState = entry.isIntersecting
            ? ""
            : "paused";
        }
      }
    },
    { rootMargin: RESUME_MARGIN }
  );

  return sharedObserver;
};

export const pauseOffScreen = (element: HTMLElement | null) => {
  if (!element) {
    return;
  }

  const observer = getObserver();
  observer.observe(element);

  return () => {
    observer.unobserve(element);
  };
};
