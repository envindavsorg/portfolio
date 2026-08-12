/**
 * Contraste WCAG entre deux couleurs.
 *
 * Les formules viennent de WCAG 2.1 (luminance relative et rapport de
 * contraste). Elles sont reproduites telles quelles, sans « simplification » :
 * la linéarisation par canal n'est pas une simple division, et l'approximation
 * qu'on croise souvent (moyenne des canaux) fait passer des paires qui échouent.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const HEX_SHORT = /^#?([\da-f])([\da-f])([\da-f])([\da-f])?$/iu;
const HEX_LONG =
  /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})(?:[\da-f]{2})?$/iu;
const RGB_FUNCTION =
  /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/iu;

const MAX_CHANNEL = 255;

const inRange = (value: number): boolean =>
  Number.isInteger(value) && value >= 0 && value <= MAX_CHANNEL;

/**
 * Lit une couleur écrite en hexadécimal (3, 4, 6 ou 8 chiffres) ou en `rgb()`.
 *
 * Le canal alpha est accepté puis ignoré : composer une couleur transparente
 * demande de connaître ce qu'il y a derrière, ce que l'outil ne peut pas savoir.
 * Mieux vaut l'ignorer explicitement que de renvoyer un rapport faux.
 */
export const parseColor = (input: string): Rgb | null => {
  const value = input.trim();

  const short = HEX_SHORT.exec(value);
  if (short) {
    const [, r = "", g = "", b = ""] = short;
    return {
      b: Number.parseInt(b + b, 16),
      g: Number.parseInt(g + g, 16),
      r: Number.parseInt(r + r, 16),
    };
  }

  const long = HEX_LONG.exec(value);
  if (long) {
    const [, r = "", g = "", b = ""] = long;
    return {
      b: Number.parseInt(b, 16),
      g: Number.parseInt(g, 16),
      r: Number.parseInt(r, 16),
    };
  }

  const rgb = RGB_FUNCTION.exec(value);
  if (rgb) {
    const [, r = "", g = "", b = ""] = rgb;
    const parsed = {
      b: Number.parseInt(b, 10),
      g: Number.parseInt(g, 10),
      r: Number.parseInt(r, 10),
    };

    return inRange(parsed.r) && inRange(parsed.g) && inRange(parsed.b)
      ? parsed
      : null;
  }

  return null;
};

export const toHexColor = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;

const LINEAR_THRESHOLD = 0.03928;
const LINEAR_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;

const linearize = (channel: number): number => {
  const ratio = channel / MAX_CHANNEL;
  return ratio <= LINEAR_THRESHOLD
    ? ratio / LINEAR_DIVISOR
    : ((ratio + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA_EXPONENT;
};

const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;

export const relativeLuminance = ({ r, g, b }: Rgb): number =>
  RED_WEIGHT * linearize(r) +
  GREEN_WEIGHT * linearize(g) +
  BLUE_WEIGHT * linearize(b);

const CONTRAST_OFFSET = 0.05;

/** rapport de contraste, entre 1 (identiques) et 21 (noir sur blanc) */
export const contrastRatio = (left: Rgb, right: Rgb): number => {
  const a = relativeLuminance(left);
  const b = relativeLuminance(right);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);

  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
};

export const THRESHOLDS = {
  /** texte à partir de 18,66 px gras ou 24 px, niveau AA */
  largeAA: 3,
  /** texte large, niveau AAA */
  largeAAA: 4.5,
  /** 1.4.3 — texte normal, niveau AA */
  normalAA: 4.5,
  /** 1.4.6 — texte normal, niveau AAA */
  normalAAA: 7,
  /** 1.4.11 — bordures de champs, icônes porteuses de sens */
  uiComponent: 3,
} as const;

export interface ContrastVerdict {
  ratio: number;
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
  uiComponent: boolean;
}

export const evaluateContrast = (
  foreground: Rgb,
  background: Rgb
): ContrastVerdict => {
  const ratio = contrastRatio(foreground, background);

  return {
    largeAA: ratio >= THRESHOLDS.largeAA,
    largeAAA: ratio >= THRESHOLDS.largeAAA,
    normalAA: ratio >= THRESHOLDS.normalAA,
    normalAAA: ratio >= THRESHOLDS.normalAAA,
    ratio,
    uiComponent: ratio >= THRESHOLDS.uiComponent,
  };
};

/** arrondi d'affichage : deux décimales, comme les rapports publiés par WCAG */
export const formatRatio = (ratio: number): string =>
  `${ratio.toFixed(2)}:1`;

const SEARCH_STEPS = 256;

/**
 * Cherche, dans la même teinte, la variante la plus proche qui atteint le seuil.
 *
 * Un outil qui se contente de dire « échec » laisse le lecteur bricoler au
 * hasard. On assombrit puis on éclaircit progressivement le premier plan, et on
 * renvoie la première variante conforme — donc celle qui s'écarte le moins de
 * l'intention de départ.
 */
export const suggestForeground = (
  foreground: Rgb,
  background: Rgb,
  target: number
): Rgb | null => {
  if (contrastRatio(foreground, background) >= target) {
    return foreground;
  }

  const scale = (color: Rgb, factor: number): Rgb => ({
    b: Math.round(
      Math.min(MAX_CHANNEL, Math.max(0, color.b * factor))
    ),
    g: Math.round(
      Math.min(MAX_CHANNEL, Math.max(0, color.g * factor))
    ),
    r: Math.round(
      Math.min(MAX_CHANNEL, Math.max(0, color.r * factor))
    ),
  });

  const towardsWhite = (color: Rgb, amount: number): Rgb => ({
    b: Math.round(color.b + (MAX_CHANNEL - color.b) * amount),
    g: Math.round(color.g + (MAX_CHANNEL - color.g) * amount),
    r: Math.round(color.r + (MAX_CHANNEL - color.r) * amount),
  });

  for (let step = 1; step <= SEARCH_STEPS; step += 1) {
    const amount = step / SEARCH_STEPS;

    const darker = scale(foreground, 1 - amount);
    if (contrastRatio(darker, background) >= target) {
      return darker;
    }

    const lighter = towardsWhite(foreground, amount);
    if (contrastRatio(lighter, background) >= target) {
      return lighter;
    }
  }

  return null;
};
