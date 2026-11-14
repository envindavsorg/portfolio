import { config } from "zod/mini";

/**
 * Les constructeurs de schéma destinés au NAVIGATEUR, un par un.
 *
 * Deux problèmes distincts se règlent ici.
 *
 * 1. Le poids. Ce module faisait `export { z }` : l'espace de noms de Zod
 *    circulait comme une VALEUR, et un bundler ne sait plus quelles propriétés
 *    d'un objet qui voyage seront lues. Il gardait donc tout — chaque type,
 *    chaque format, et les messages d'une soixantaine de langues — pour valider
 *    un formulaire de deux champs. Mesuré sur le fichier qui porte ce
 *    formulaire, le plus gros de la page d'accueil, tel qu'il passe sur le
 *    réseau : 125 Kio avec ce `z` réexporté ; 66 Kio en important `z` de "zod"
 *    sans intermédiaire (les langues partent, mais l'API chaînée accroche
 *    toutes ses méthodes à chaque schéma, donc le reste ne s'élague pas) ;
 *    52 Kio avec `zod/mini`, qui expose la même validation sous forme de
 *    fonctions — `string().check(minLength(2))` au lieu de `.string().min(2)`.
 *    Une fonction qu'on n'importe pas n'est pas livrée. D'où la liste nommée
 *    ci-dessous plutôt qu'un `export *` : `zod/mini` exporte lui aussi un `z`,
 *    et le laisser passer rouvrirait la porte qu'on vient de fermer. Un schéma
 *    client qui a besoin d'un constructeur de plus l'ajoute à cette liste.
 *
 * 2. La CSP. Le `z.object()` de l'API classique compile son validateur avec
 *    `new Function` et, pour savoir s'il en a le droit, tente un
 *    `new Function("")` dans un try/catch. Le catch avale l'erreur, mais le
 *    navigateur signale quand même la tentative comme une violation
 *    `script-src`. L'`object()` de `zod/mini` n'a pas ce chemin : dans zod
 *    4.6.7, `ZodMiniObject` s'initialise sur `$ZodObject`, pas sur
 *    `$ZodObjectJIT`, et la mesure le confirme — zéro tentative avec ou sans
 *    `jitless`, une sans lui pour l'API classique. Le réglage ne change donc
 *    plus rien aujourd'hui. Il reste posé parce que cette absence est un détail
 *    d'implémentation de Zod, pas un engagement : le jour où elle disparaît,
 *    c'est lui qui évite d'ouvrir `'unsafe-eval'`. `emailSchema.test.ts` piège
 *    le constructeur `Function` pour le constater en une seconde,
 *    `e2e/csp.spec.ts` le constate dans un vrai navigateur.
 *
 * Les constructeurs sont réexportés d'ici au lieu de laisser les schémas les
 * prendre dans "zod/mini" : `jitless` est lu à la CONSTRUCTION du schéma, pas à
 * la validation. Un module qui importe ses constructeurs d'ici ne peut être
 * évalué qu'après celui-ci — l'ordre est garanti par le graphe d'imports, pas
 * par la discipline de celui qui écrit le schéma.
 *
 * Le réglage vit sur `globalThis` : il vaut pour toute instance de Zod du même
 * processus. Les modules purement serveur (`env.ts`, `content.ts`, les actions
 * d'administration) importent "zod" directement — aucune CSP ne s'applique au
 * code qu'on exécute soi-même, et l'API chaînée y coûte zéro octet au visiteur.
 */
config({ jitless: true });

export type { infer } from "zod/mini";
export {
  _default,
  email,
  enum,
  extend,
  maxLength,
  minLength,
  object,
  string,
} from "zod/mini";
