import { memo } from 'react';
import { Button } from '@/components/ui/Button';
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/Dialog';
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

type EmailFormContentProps = {
	form: ReturnType<typeof useEmailForm>['form'];
	isLoading: boolean;
	onSubmit: (data: EmailFormData) => Promise<void>;
	onClose: () => void;
};

export const EmailFormContent = memo(
	({ form, isLoading, onSubmit, onClose }: EmailFormContentProps) => (
		<>
			<DialogHeader className="text-start">
				<DialogTitle>
					Recevez mon CV <br /> directement dans votre boîte mail !
				</DialogTitle>
				<DialogDescription>
					Entrez votre prénom et votre adresse e-mail dans le
					formulaire ci-dessous pour recevoir immédiatement mon CV.
				</DialogDescription>
			</DialogHeader>

			<Form {...form}>
				<form
					className="mt-3 space-y-4"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Votre prénom :</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										placeholder="..."
										{...field}
									/>
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
								<FormLabel className="text-xs">
									Votre adresse e-mail :
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

					<DialogFooter>
						<DialogClose asChild>
							<Button onClick={onClose} variant="outline">
								Fermer
							</Button>
						</DialogClose>

						<Button disabled={isLoading} type="submit">
							{isLoading ? (
								<>
									Envoi <Spinner />
								</>
							) : (
								<>Recevoir</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</>
	),
);
