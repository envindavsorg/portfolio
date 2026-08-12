import { z } from "zod";

/**
 * Zod 4 compile ses validateurs d'objet à la volée avec `new Function` (le
 * chemin « fastpass » de `$ZodObjectJIT`) et, pour savoir s'il en a le droit, il
 * tente un `new Function("")` dans un try/catch. Le catch avale bien l'erreur,
 * mais le navigateur signale quand même la tentative comme une violation
 * `script-src` : sans ce réglage, la CSP du site devrait ouvrir `'unsafe-eval'`
 * juste pour valider un formulaire de deux champs.
 *
 * `jitless` coupe à la fois la compilation et la sonde. Le coût est nul à notre
 * échelle : le mode sans JIT n'est plus lent que sur des validations en masse.
 *
 * Le module réexporte `z` au lieu de se contenter d'un effet de bord, pour deux
 * raisons : un `import "…"` isolé peut être élagué par le bundler, et surtout le
 * réglage doit être posé AVANT la construction des schémas — `jitless` est lu au
 * moment où `z.object()` s'exécute, pas à la validation. Importer `z` d'ici
 * garantit cet ordre.
 *
 * À réserver aux modules chargés côté client : côté serveur, aucune CSP ne
 * s'applique au code qu'on exécute soi-même, autant y garder le JIT.
 */
z.config({ jitless: true });

export { z };
