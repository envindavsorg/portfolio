/**
 * Diff ligne à ligne, basé sur la plus longue sous-séquence commune (LCS).
 *
 * La table LCS coûte O(n × m) en mémoire ; au-delà de MAX_LINES on renonce
 * plutôt que de figer l'onglet du visiteur avec une matrice de plusieurs
 * millions de cellules.
 */

export type DiffType = "equal" | "added" | "removed";

export interface DiffLine {
  type: DiffType;
  text: string;
  /** numéro de ligne dans le texte de gauche (null si ajoutée) */
  leftLine: number | null;
  /** numéro de ligne dans le texte de droite (null si supprimée) */
  rightLine: number | null;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: DiffStats;
  /** vrai si l'entrée dépasse la taille traitable */
  truncated: boolean;
}

export const MAX_LINES = 2000;

const splitLines = (value: string): string[] =>
  value.length === 0 ? [] : value.split(/\r\n|\r|\n/u);

/** table des longueurs de LCS, remplie de bas en haut */
const buildLcsTable = (
  left: string[],
  right: string[]
): Uint32Array[] => {
  const table: Uint32Array[] = Array.from(
    { length: left.length + 1 },
    () => new Uint32Array(right.length + 1)
  );

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      table[i][j] =
        left[i] === right[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  return table;
};

export const diffLines = (
  leftText: string,
  rightText: string
): DiffResult => {
  const left = splitLines(leftText);
  const right = splitLines(rightText);

  if (left.length > MAX_LINES || right.length > MAX_LINES) {
    return {
      lines: [],
      stats: { added: 0, removed: 0, unchanged: 0 },
      truncated: true,
    };
  }

  const table = buildLcsTable(left, right);
  const lines: DiffLine[] = [];
  const stats: DiffStats = { added: 0, removed: 0, unchanged: 0 };

  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      lines.push({
        leftLine: i + 1,
        rightLine: j + 1,
        text: left[i],
        type: "equal",
      });
      stats.unchanged += 1;
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      lines.push({
        leftLine: i + 1,
        rightLine: null,
        text: left[i],
        type: "removed",
      });
      stats.removed += 1;
      i += 1;
    } else {
      lines.push({
        leftLine: null,
        rightLine: j + 1,
        text: right[j],
        type: "added",
      });
      stats.added += 1;
      j += 1;
    }
  }

  // reste d'un seul côté : que des suppressions, puis que des ajouts
  while (i < left.length) {
    lines.push({
      leftLine: i + 1,
      rightLine: null,
      text: left[i],
      type: "removed",
    });
    stats.removed += 1;
    i += 1;
  }

  while (j < right.length) {
    lines.push({
      leftLine: null,
      rightLine: j + 1,
      text: right[j],
      type: "added",
    });
    stats.added += 1;
    j += 1;
  }

  return { lines, stats, truncated: false };
};
