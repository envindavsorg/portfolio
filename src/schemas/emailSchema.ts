import { z } from "zod";

import { m } from "@/paraglide/messages";

/**
 * Les messages passent par une fonction `error` et non par une chaîne : Zod
 * n'évalue la fonction qu'au moment de la validation. Une chaîne serait figée à
 * la construction du schéma — donc au chargement du module, avec la locale de ce
 * moment-là — et les visiteurs de /en voyaient des erreurs en français.
 */
export const emailSchema = z.object({
  firstName: z
    .string()
    .min(1, { error: () => m.form_first_name_required() })
    .min(2, { error: () => m.form_first_name_too_short() })
    .max(20, { error: () => m.form_first_name_too_long() }),
  recipientEmail: z.email({ error: () => m.form_email_invalid() }),
});

export type EmailFormData = z.infer<typeof emailSchema>;

/**
 * Entrée de l'action serveur : le formulaire, plus la locale de la page.
 *
 * Elle n'est pas dans `emailSchema` pour ne pas apparaître comme un champ à
 * valider côté formulaire.
 */
export const sendCvInputSchema = emailSchema.extend({
  locale: z.enum(["fr", "en"]).default("fr"),
});
