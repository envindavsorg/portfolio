import { Button } from '@/components/buttons/Button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import type useEmailForm from '@/hooks/use-email-form';
import type { EmailFormData } from '@/hooks/use-email-form';

interface CvForm {
	form: ReturnType<typeof useEmailForm>['form'];
	isLoading: boolean;
	onSubmit: (data: EmailFormData) => Promise<void>;
	onCancel: () => void;
}

const CvForm = ({ form, isLoading, onSubmit, onCancel }: CvForm) => (
	<Form {...form}>
		<form onSubmit={form.handleSubmit(onSubmit)}>
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

			<div className="flex flex-row justify-between">
				<Button onClick={onCancel} type="button" variant="outline">
					Fermer
				</Button>
				<Button disabled={isLoading} type="submit">
					{isLoading ? <Spinner /> : 'Recevoir mon CV'}
				</Button>
			</div>
		</form>
	</Form>
);

CvForm.displayName = 'CurriculumVitaeForm';

export { CvForm };
