/**
 * Vrai quand `count` appelle le pluriel dans la locale donnée.
 *
 * `count > 1` ne vaut que pour le français, où zéro reste au singulier
 * (« 0 ligne ajoutée »). L'anglais écrit « 0 lines added » : les compteurs des
 * outils passent souvent par zéro, et l'ancien « line(s) » masquait la
 * différence au lieu de la régler. `Intl.PluralRules` connaît les deux règles
 * et ne pèse rien dans le bundle.
 */
export const isPlural = (count: number, locale: string): boolean =>
  new Intl.PluralRules(locale).select(count) !== "one";
