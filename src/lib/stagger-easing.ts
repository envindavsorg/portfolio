/**
 * Un décalé lettre à lettre porté par UNE ligne de temps.
 *
 * Décaler des lettres se fait d'habitude en donnant à chacune son propre
 * départ (un délai). Or chaque départ et chaque arrivée est une frontière de
 * phase que le navigateur doit traiter sur le fil principal : pour 46 lettres
 * étalées sur 0,6 s, il y en a une à chaque image, et chacune refait le
 * découpage en calques de toute la page. Mesuré dans l'accueil (390 px, CPU
 * ×4, fenêtre de 1,5 s) : 670 à 790 ms de fil principal avec un délai par
 * lettre, 230 à 300 avec ce qui suit, pour le même mouvement.
 *
 * Ici toutes les lettres partent et arrivent ENSEMBLE — même durée, aucun
 * délai — et c'est la courbe de chacune qui porte son retard : à plat sur 0
 * jusqu'à son tour, puis l'accélération d'origine, puis à plat sur 1. Deux
 * frontières pour tout le groupe ; entre les deux, le compositeur fait le
 * travail seul.
 */

/**
 * `easeOut` de Motion, soit `cubic-bezier(0, 0, 0.58, 1)`, relevé tous les
 * dixièmes. Reliés par des droites, ces points s'écartent de la courbe de
 * 0,004 au plus — 0,08 px sur un glissement de 20 px.
 */
const EASE_OUT = [
  0, 0.161, 0.308, 0.445, 0.571, 0.685, 0.785, 0.87, 0.938, 0.983, 1,
] as const;

export interface StaggerTimeline {
  /** nombre de segments animés */
  count: number;
  /** attente avant le départ du premier segment, en millisecondes */
  delay: number;
  /** durée de l'animation d'UN segment, en millisecondes */
  duration: number;
  /** le dernier segment part le premier */
  reverse?: boolean;
  /** étalement des départs, en millisecondes : le pas vaut `spread / count` */
  spread: number;
}

const stepOf = ({ count, spread }: StaggerTimeline): number =>
  count > 0 ? spread / count : 0;

/** Durée de la ligne de temps commune : du premier départ à la dernière arrivée. */
export const staggerDuration = (timeline: StaggerTimeline): number =>
  timeline.delay +
  Math.max(timeline.count - 1, 0) * stepOf(timeline) +
  timeline.duration;

const percent = (ratio: number): string =>
  `${Number((ratio * 100).toFixed(2))}%`;

/**
 * La courbe `linear()` du segment `index` sur la ligne de temps commune.
 *
 * Le premier `0` et le dernier `1` ne sont pas décoratifs : sans eux, la
 * fonction prolonge sa première et sa dernière pente au lieu de rester à plat,
 * et une lettre en attente reculerait au lieu de ne pas bouger.
 */
export const staggerEasing = (
  index: number,
  timeline: StaggerTimeline
): string => {
  const total = staggerDuration(timeline);
  const rank = timeline.reverse ? timeline.count - 1 - index : index;
  const start = timeline.delay + rank * stepOf(timeline);
  const last = EASE_OUT.length - 1;

  const stops = EASE_OUT.map(
    (value, sample) =>
      `${value} ${percent((start + (timeline.duration * sample) / last) / total)}`
  );

  return `linear(0, ${stops.join(", ")}, 1)`;
};
