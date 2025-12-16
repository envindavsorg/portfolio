'use client';

import type { Player } from '@lordicon/react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTrigger,
} from '@/components/ui/Drawer';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { Prose } from '@/components/ui/Typography';
import useEmailForm, { type EmailFormData } from '@/hooks/use-email-form';
import { cn } from '@/lib/utils';

type DialogState = 'form' | 'success' | 'error';

type EmailCVDrawerProps = {
	className?: string;
	children: React.ReactNode;
};

export const EmailCVDrawer = ({ className, children }: EmailCVDrawerProps) => {
	const [open, setOpen] = useState(false);
	const [dialogState, setDialogState] = useState<DialogState>('form');

	const _iconRef = useRef<Player>(null);
	const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const { form, isLoading, sendEmail } = useEmailForm();

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!open) {
			resetTimeoutRef.current = setTimeout(() => {
				setDialogState('form');
				form.reset();
			}, 600);
		}
	}, [open, form]);

	const handleSubmit = useCallback(
		async (data: EmailFormData) => {
			const success = await sendEmail(data);
			setDialogState(success ? 'success' : 'error');
		},
		[sendEmail],
	);

	const _handleClose = useCallback(() => setOpen(false), []);

	return (
		<div className={className}>
			<Drawer>
				<DrawerTrigger>{children}</DrawerTrigger>

				<DrawerContent className="min-sm:hidden">
					<DrawerHeader>Mon CV dans votre boîte mail !</DrawerHeader>

					<DrawerBody
						className={cn(
							dialogState !== 'form' &&
								'flex aspect-square items-center justify-center',
						)}
					>
						<Prose>
							Entrez <span>votre prénom</span> et{' '}
							<span>votre adresse e-mail</span> dans le formulaire
							ci-dessous pour{' '}
							<span className="text-theme">recevoir</span>{' '}
							immédiatement mon CV.
						</Prose>

						<Form {...form}>
							<form
								className="mt-3 space-y-4"
								onSubmit={form.handleSubmit(handleSubmit)}
							>
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Votre prénom :
											</FormLabel>
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

								<DrawerFooter>
									<DrawerClose asChild>
										<Button variant="outline">
											Cancel
										</Button>
									</DrawerClose>
								</DrawerFooter>
							</form>
						</Form>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</div>
	);
};
