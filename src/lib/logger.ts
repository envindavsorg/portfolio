import { Logger } from "tslog";

/**
 * Journal du SERVEUR : actions, routes d'API, greffons rehype et remark.
 *
 * Ne jamais l'importer depuis un module qui atteint le navigateur. tslog fait
 * référence à `Buffer`, que Turbopack remplace alors par un polyfill : 86 Ko
 * (27 Kio gzip) dans un chunk partagé par toutes les pages. Quatre appels
 * suffisaient à le faire venir ; côté client, `console.warn` et
 * `console.error` font le travail. `e2e/widget-isolation.spec.ts` échoue si
 * tslog réapparaît dans un script téléchargé.
 */

export const logger = new Logger({
  minLevel: process.env.NODE_ENV === "production" ? 3 : 0,
  name: "mon portfolio",
  type: "pretty",
});
