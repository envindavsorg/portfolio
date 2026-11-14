/**
 * Un pas dans une liste de `count` éléments, en avant ou en arrière.
 *
 * `loop` fait tourner en rond ; sans lui, l'indice bute aux extrémités et y
 * reste.
 */
export const stepIndex = (
  index: number,
  offset: 1 | -1,
  count: number,
  loop: boolean
): number => {
  const next = index + offset;

  if (next < 0) {
    return loop ? count - 1 : 0;
  }
  if (next >= count) {
    return loop ? 0 : count - 1;
  }
  return next;
};

/** faux aux extrémités d'une liste qui ne tourne pas en rond */
export const canStep = (
  index: number,
  offset: 1 | -1,
  count: number,
  loop: boolean
): boolean => loop || stepIndex(index, offset, count, loop) !== index;
