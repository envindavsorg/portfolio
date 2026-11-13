// Les constructeurs viennent d'ici et non de "zod" : le schéma part dans le
// bundle client, où l'objet `z` entier pesait 74 Kio de plus qu'eux. Voir
// zod-config.ts.
import type { infer as Infer } from "@/lib/zod-config";
import {
  _default,
  email,
  extend,
  maxLength,
  minLength,
  object,
  enum as oneOf,
  string,
} from "@/lib/zod-config";
import { m } from "@/paraglide/messages";

/**
 * Les messages passent par une fonction `error` et non par une chaîne : Zod
 * n'évalue la fonction qu'au moment de la validation. Une chaîne serait figée à
 * la construction du schéma — donc au chargement du module, avec la locale de ce
 * moment-là — et les visiteurs de /en voyaient des erreurs en français.
 *
 * L'ordre des contrôles compte : ils s'exécutent tous, et le formulaire affiche
 * le PREMIER signalement d'un champ. Un prénom vide doit dire « requis », pas
 * « au moins 2 caractères ».
 */
export const emailSchema = object({
  firstName: string().check(
    minLength(1, { error: () => m.form_first_name_required() }),
    minLength(2, { error: () => m.form_first_name_too_short() }),
    maxLength(20, { error: () => m.form_first_name_too_long() })
  ),
  recipientEmail: email({ error: () => m.form_email_invalid() }),
});

export type EmailFormData = Infer<typeof emailSchema>;

/**
 * Entrée de l'action serveur : le formulaire, plus la locale de la page.
 *
 * Elle n'est pas dans `emailSchema` pour ne pas apparaître comme un champ à
 * valider côté formulaire. Elle en est en revanche DÉRIVÉE : le navigateur et
 * le serveur valident les deux champs avec le même objet, ils ne peuvent pas
 * diverger.
 */
export const sendCvInputSchema = extend(emailSchema, {
  locale: _default(oneOf(["fr", "en"]), "fr"),
});
