/**
 * Exécution d'une expression régulière sur un texte, pour l'outil /utils.
 *
 * Le résultat est renvoyé sous forme de segments plutôt que de HTML : surligner
 * les correspondances en concaténant des balises obligerait le composant à
 * injecter du HTML brut, avec le texte du visiteur à l'intérieur.
 */

export const REGEX_FLAGS = ["g", "i", "m", "s", "u", "y"] as const;

export type RegexFlag = (typeof REGEX_FLAGS)[number];

export interface RegexMatch {
  /** position du début de la correspondance dans le texte */
  index: number;
  value: string;
  /** groupes numérotés, dans l'ordre ; `undefined` pour un groupe non participant */
  groups: (string | undefined)[];
  named: Record<string, string | undefined>;
}

export type CompileResult =
  | { ok: true; regex: RegExp }
  | { ok: false; message: string };

/**
 * Compile le motif en forçant le drapeau `g`.
 *
 * Sans lui, `exec` repart de zéro à chaque appel et la recherche de toutes les
 * correspondances boucle sur la première. Le drapeau choisi par le visiteur reste
 * affiché tel quel : c'est un détail d'implémentation, pas une modification de
 * son expression.
 */
export const compileRegex = (
  pattern: string,
  flags: string
): CompileResult => {
  const withGlobal = flags.includes("g") ? flags : `${flags}g`;

  try {
    return { ok: true, regex: new RegExp(pattern, withGlobal) };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "motif invalide",
      ok: false,
    };
  }
};

export const MAX_MATCHES = 500;
/**
 * Un motif comme `(a+)+b` sur une longue chaîne provoque un retour sur trace
 * exponentiel, et JavaScript n'offre aucun moyen d'interrompre une exécution de
 * regex. Borner l'entrée est la seule protection possible côté navigateur.
 */
export const MAX_TEXT_LENGTH = 20_000;

export interface RegexRun {
  matches: RegexMatch[];
  /** la recherche s'est arrêtée à MAX_MATCHES */
  truncated: boolean;
}

export const findMatches = (
  regex: RegExp,
  text: string
): RegexRun => {
  const matches: RegexMatch[] = [];
  const search = new RegExp(regex.source, regex.flags);
  search.lastIndex = 0;

  let truncated = false;
  let current = search.exec(text);

  while (current !== null) {
    const [value, ...groups] = current;

    matches.push({
      groups,
      index: current.index,
      named: { ...current.groups },
      value,
    });

    if (matches.length >= MAX_MATCHES) {
      truncated = true;
      break;
    }

    // une correspondance vide ne fait pas avancer lastIndex : sans ce coup de
    // pouce, un motif comme `a*` boucle indéfiniment sur la même position
    if (value === "") {
      search.lastIndex += 1;
    }

    current = search.exec(text);
  }

  return { matches, truncated };
};

export interface TextSegment {
  text: string;
  isMatch: boolean;
  /** rang de la correspondance, pour alterner les couleurs */
  matchIndex?: number;
}

/**
 * Découpe le texte en segments correspondants et non correspondants.
 *
 * Les correspondances vides sont ignorées ici : elles n'ont rien à surligner et
 * produiraient des segments de longueur nulle.
 */
export const toSegments = (
  text: string,
  matches: RegexMatch[]
): TextSegment[] => {
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const [rank, match] of matches.entries()) {
    if (match.value === "" || match.index < cursor) {
      continue;
    }

    if (match.index > cursor) {
      segments.push({
        isMatch: false,
        text: text.slice(cursor, match.index),
      });
    }

    segments.push({
      isMatch: true,
      matchIndex: rank,
      text: match.value,
    });

    cursor = match.index + match.value.length;
  }

  if (cursor < text.length) {
    segments.push({ isMatch: false, text: text.slice(cursor) });
  }

  return segments;
};

/**
 * Applique un remplacement, avec la syntaxe `$1`, `$<nom>` de JavaScript.
 *
 * Attention à une subtilité de la spécification : `$<nom>` qui ne désigne aucun
 * groupe existant ne lève rien, il produit une chaîne vide. Et si le motif ne
 * contient AUCUN groupe nommé, `$<nom>` est recopié littéralement. Il n'y a donc
 * pas d'erreur à intercepter dans ce cas — le try/catch reste là pour les échecs
 * réels du moteur, pas pour valider le remplacement.
 */
export const applyReplacement = (
  regex: RegExp,
  text: string,
  replacement: string
): { ok: true; result: string } | { ok: false; message: string } => {
  try {
    return {
      ok: true,
      result: text.replace(
        new RegExp(regex.source, regex.flags),
        replacement
      ),
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "remplacement invalide",
      ok: false,
    };
  }
};

export const REGEX_PRESETS = [
  { flags: "gi", pattern: "\\b[\\w.%+-]+@[\\w.-]+\\.[a-z]{2,}\\b" },
  { flags: "gm", pattern: "^#{1,6}\\s+(?<titre>.+)$" },
  {
    flags: "g",
    pattern: "(?<annee>\\d{4})-(?<mois>\\d{2})-(?<jour>\\d{2})",
  },
  { flags: "g", pattern: "https?://[^\\s)]+" },
] as const;
