import { z } from "zod";

const FIRST_NAME_REGEX = /^[\p{L}\p{M}' -]+$/u;

export const emailSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis !")
    .min(2, "Le prénom doit contenir au moins 2 caractères !")
    .max(20, "Le prénom doit contenir moins de 20 caractères !")
    .regex(
      FIRST_NAME_REGEX,
      "Le prénom contient des caractères non autorisés !"
    ),
  recipientEmail: z
    .email("Adresse e-mail obligatoire !")
    .max(254, "L'adresse e-mail est trop longue !"),
});

export type EmailFormData = z.infer<typeof emailSchema>;
