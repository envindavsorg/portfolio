/**
 * `localStorage`, pour un code qui ne doit pas tomber avec lui.
 *
 * Le stockage ne se contente pas d'être vide : il LÈVE. Stockage du site
 * bloqué dans les réglages du navigateur, quota atteint, iframe sans accès —
 * `getItem` comme `setItem` jettent alors une `SecurityError` ou une
 * `QuotaExceededError`. Lue dans un `useEffect` sans garde, une préférence
 * aussi secondaire que le format de l'horloge du pied de page remplaçait
 * CHAQUE page du site par l'écran d'erreur de Next.
 *
 * Une préférence qu'on ne peut ni lire ni écrire n'est pas une erreur : c'est
 * une préférence absente. Les trois fonctions rendent donc leur échec au lieu
 * de le lever.
 */
export const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** `false` quand rien n'a pu être écrit */
export const writeStorage = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

/** `false` quand rien n'a pu être retiré */
export const removeStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
