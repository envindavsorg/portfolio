import { z } from 'zod';

const emailSchema = z.object({
	firstName: z
		.string()
		.min(1, 'Le prénom est requis !')
		.min(2, 'Le prénom doit contenir au moins 2 caractères !')
		.max(20, 'Le prénom doit contenir moins de 20 caractères !'),
	recipientEmail: z.email('Adresse e-mail obligatoire !'),
});

export default emailSchema;
