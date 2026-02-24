import { Button } from '@/components/primitives/Button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/primitives/Form';
import { Input } from '@/components/primitives/Input';
import { Spinner } from '@/components/primitives/Spinner';
import type useEmailForm from '@/hooks/use-email-form';
import type { EmailFormData } from '@/hooks/use-email-form';

interface CvForm {
	form: ReturnType<typeof useEmailForm>['form'];
	isLoading: boolean;
	onSubmit: (data: EmailFormData) => Promise<void>;
	onCancel: () => void;
}

export const CvForm = ({ form, isLoading, onSubmit, onCancel }: CvForm) => (
	<Form {...form}>
		<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
			<FormField
				control={form.control}
				name="firstName"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="text-muted-foreground">
							votre prénom :
						</FormLabel>
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
						<FormLabel className="text-muted-foreground">
							votre adresse e-mail :
						</FormLabel>
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
					fermer
				</Button>
				<Button disabled={isLoading} type="submit">
					{isLoading ? <Spinner /> : 'recevoir mon CV'}
				</Button>
			</div>
		</form>
	</Form>
);
