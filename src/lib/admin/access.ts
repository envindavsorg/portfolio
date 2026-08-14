/**
 * Qui a le droit d'entrer dans l'espace d'administration.
 *
 * Module PUR : aucune dépendance à la base, au réseau ni à better-auth, donc la
 * décision d'autorisation se teste seule. C'est le seul endroit du dépôt où une
 * erreur donne à quelqu'un d'autre le droit d'écrire dans le dépôt GitHub, et
 * c'est précisément pour ça qu'il ne dépend de rien.
 *
 * ⚠️ L'IDENTITÉ RETENUE EST L'IDENTIFIANT NUMÉRIQUE, pas le pseudo.
 *
 * Un pseudo GitHub est renommable, et une fois libéré il peut être réenregistré
 * par n'importe qui. Autoriser « envindavsorg » plutôt que « 12345678 » ferait
 * donc dépendre l'accès d'un nom que le propriétaire peut abandonner sans y
 * penser — et que quelqu'un d'autre peut ensuite reprendre. L'identifiant
 * numérique, lui, est attribué une fois pour toutes.
 *
 * Le pseudo n'est gardé que pour l'affichage et les traces.
 */

export interface AdminIdentity {
  /** identifiant numérique GitHub, tel que renvoyé par le fournisseur */
  githubId?: string | number | null;
  /** pseudo, pour l'affichage uniquement */
  githubLogin?: string | null;
}

/**
 * Le TYPE est vérifié avant la conversion, pas après.
 *
 * `String(["42424242"])` vaut `"42424242"` : un tableau à un seul élément se
 * stringifie en son élément et franchissait le contrôle numérique. Le test de ce
 * module l'a attrapé sur la première version. Un contrôle d'accès ne doit pas
 * reposer sur « en pratique le fournisseur rend une chaîne » — il doit refuser
 * tout ce qui n'est pas exactement une chaîne ou un nombre.
 */
const normalizeId = (value: unknown): string | null => {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0
      ? String(value)
      : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  // un identifiant GitHub est un entier positif : tout le reste est refusé
  // plutôt qu'interprété
  return /^\d+$/u.test(text) ? text : null;
};

/**
 * L'autorisation ÉCHOUE FERMÉE.
 *
 * Sans `ADMIN_GITHUB_ID` configuré, personne n'entre — pas même le
 * propriétaire. C'est volontaire : une variable d'environnement oubliée en
 * production doit fermer la porte, jamais l'ouvrir. La plupart des accidents
 * d'autorisation viennent d'un test qui laisse passer quand la configuration
 * manque.
 */
export const isAdmin = (
  identity: AdminIdentity | null | undefined,
  allowedGithubId: string | null | undefined
): boolean => {
  const allowed = normalizeId(allowedGithubId);

  if (allowed === null) {
    return false;
  }

  const candidate = normalizeId(identity?.githubId);

  return candidate !== null && candidate === allowed;
};

/** libellé lisible pour les traces, sans jamais inventer de valeur */
export const describeIdentity = (
  identity: AdminIdentity | null | undefined
): string => {
  const login = identity?.githubLogin?.trim();
  const id = normalizeId(identity?.githubId);

  if (login && id) {
    return `${login} (#${id})`;
  }
  if (id) {
    return `#${id}`;
  }
  if (login) {
    return login;
  }

  return "identité inconnue";
};
