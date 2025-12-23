import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import emailSchema from '@/schemas/email.schema';

export type EmailFormData = z.infer<typeof emailSchema>;

const useEmailForm = () => {
	const form = useForm<EmailFormData>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			firstName: '',
			recipientEmail: '',
		},
	});

	const sendEmail = useCallback(
		async (data: EmailFormData) => {
			try {
				const response = await fetch('/api/send', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});

				if (!response.ok) {
					return false;
				}

				form.reset();
				return true;
			} catch {
				return false;
			}
		},
		[form]
	);

	return {
		form,
		isLoading: form.formState.isSubmitting,
		sendEmail,
	};
};

export default useEmailForm;
