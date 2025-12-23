'use client';

import type React from 'react';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import type useEmailForm from '@/hooks/use-email-form';
import type { EmailFormData } from '@/hooks/use-email-form';

interface CurriculumVitaeFormProps {
	form: ReturnType<typeof useEmailForm>['form'];
	isLoading: boolean;
	onSubmitAction: (data: EmailFormData) => Promise<void>;
	className?: string;
	children?: React.ReactNode;
}

export const CurriculumVitaeForm = ({
	form,
	isLoading,
	onSubmitAction,
	className,
	children,
}: CurriculumVitaeFormProps): React.JSX.Element => (
	<Form {...form}>
		<form className={className} onSubmit={form.handleSubmit(onSubmitAction)}>
			<FormField
				control={form.control}
				name="firstName"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Votre prénom :</FormLabel>
						<FormControl>
							<Input disabled={isLoading} placeholder="..." {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="recipientEmail"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-xs">Votre adresse e-mail :</FormLabel>
						<FormControl>
							<Input
								disabled={isLoading}
								placeholder="..."
								type="email"
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{children}
		</form>
	</Form>
);
