/**
 * Les 627 messages, et ce qui peut mal tourner en les éditant.
 *
 * Module PUR : il prend deux dictionnaires et rend une chaîne ou des
 * signalements. Aucune lecture de disque, aucun appel réseau.
 *
 * L'intérêt n'est pas de reformater du JSON — `JSON.stringify` sait le faire.
 * C'est de rattraper les deux erreurs qu'une édition à la main produit sans
 * jamais rien casser bruyamment :
 *
 * 1. une INTERPOLATION perdue. `home_articles_item_words` vaut « {words} mots »
 *    en français ; si la traduction anglaise devient « words » sans accolades,
 *    Paraglide rend la phrase sans le nombre. Rien n'échoue, la page affiche
 *    juste une phrase incomplète.
 * 2. une clé AJOUTÉE dans une seule locale. `compile-i18n.mts` compare le nombre
 *    de messages compilés aux clés de `messages/fr.json` et sort en 1 sur un
 *    écart — donc une clé ajoutée côté anglais seulement casse le build, pas
 *    l'inverse. Autant le dire avant d'enregistrer.
 */

export type MessageBundle = Record<string, string>;

/** la clé de schéma inlang, qui n'est pas un message */
export const SCHEMA_KEY = "$schema";

/**
 * Le fichier, tel que le dépôt l'écrit : clés triées, deux espaces, saut de
 * ligne final.
 *
 * Le tri n'est pas cosmétique. Sans lui, une clé ajoutée atterrirait en fin de
 * fichier et le diff mélangerait « ajout » et « déplacement » à chaque
 * enregistrement. `$schema` reste en tête naturellement : `$` précède les
 * lettres.
 */
export const serializeMessages = (bundle: MessageBundle): string => {
  const sorted = Object.fromEntries(
    Object.keys(bundle)
      .sort((left, right) => left.localeCompare(right, "en"))
      .map((key) => [key, bundle[key]])
  );

  return `${JSON.stringify(sorted, null, 2)}\n`;
};

/**
 * Les noms d'interpolation d'un message, dans l'ordre d'apparition mais
 * dédoublonnés.
 *
 * On ne cherche que `{nom}` : le format inlang n'a pas d'expression, et accepter
 * n'importe quelle accolade ferait passer pour une interpolation un `{` littéral
 * d'un exemple de code.
 */
export const placeholders = (message: string): string[] => {
  const found = message.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/gu);

  return [...new Set([...found].map((match) => match[1]))];
};

export interface MessageFinding {
  kind:
    | "interpolation-manquante"
    | "interpolation-inconnue"
    | "cle-absente-en-francais"
    | "traduction-absente";
  key: string;
  detail: string;
}

/**
 * Ce qui empêcherait d'enregistrer sereinement.
 *
 * Le français est la RÉFÉRENCE : c'est la locale de base, celle dont
 * `compile-i18n.mts` compte les clés. Une clé anglaise sans équivalent français
 * est donc un problème ; l'inverse est seulement une traduction à faire.
 */
export const checkMessages = (
  french: MessageBundle,
  english: MessageBundle
): MessageFinding[] => {
  const findings: MessageFinding[] = [];

  for (const key of Object.keys(english)) {
    if (key === SCHEMA_KEY) {
      continue;
    }

    if (!Object.hasOwn(french, key)) {
      findings.push({
        detail:
          "présente en anglais seulement : la compilation i18n compte les clés françaises et échouerait",
        key,
        kind: "cle-absente-en-francais",
      });
    }
  }

  for (const key of Object.keys(french)) {
    if (key === SCHEMA_KEY) {
      continue;
    }

    const source = french[key];
    const target = english[key];

    if (target === undefined) {
      findings.push({
        detail: "aucune traduction anglaise",
        key,
        kind: "traduction-absente",
      });
      continue;
    }

    const expected = placeholders(source);
    const actual = placeholders(target);

    for (const name of expected) {
      if (!actual.includes(name)) {
        findings.push({
          detail: `la traduction anglaise ne reprend pas {${name}}`,
          key,
          kind: "interpolation-manquante",
        });
      }
    }

    for (const name of actual) {
      if (!expected.includes(name)) {
        findings.push({
          detail: `la traduction anglaise ajoute {${name}}, absent du français`,
          key,
          kind: "interpolation-inconnue",
        });
      }
    }
  }

  return findings;
};

/** ce qui bloque un enregistrement, par opposition à ce qui mérite un avis */
export const isBlocking = (finding: MessageFinding): boolean =>
  finding.kind === "cle-absente-en-francais" ||
  finding.kind === "interpolation-manquante" ||
  finding.kind === "interpolation-inconnue";
