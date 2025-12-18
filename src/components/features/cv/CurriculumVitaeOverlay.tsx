'use client';

import type { Player } from '@lordicon/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import posthog from 'posthog-js';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/Dialog';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/Drawer';
import { Spinner } from '@/components/ui/Spinner';
import type { EmailFormData } from '@/hooks/use-email-form';
import useEmailForm from '@/hooks/use-email-form';
import useMediaQuery from '@/hooks/use-media-query';
import { CurriculumVitaeForm } from './CurriculumVitaeForm';
import { ErrorMessage } from './states/ErrorMessage';
import { SuccessMessage } from './states/SuccessMessage';

type FormState = 'form' | 'success' | 'error';

export const CurriculumVitaeOverlay = (): React.JSX.Element => {
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [open, setOpen] = useState(false);
	const [formState, setFormState] = useState<FormState>('form');

	const iconRef = useRef<Player>(null);
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
				setFormState('form');
				form.reset();
			}, 600);
		}
	}, [open, form]);

	const handleSubmit = useCallback(
		async (data: EmailFormData) => {
			// Track CV email request submission
			posthog.capture('cv_email_request_submitted', {
				device_type: isDesktop ? 'desktop' : 'mobile',
			});

			const success = await sendEmail(data);
			setFormState(success ? 'success' : 'error');

			// Track success or error outcome
			if (success) {
				posthog.capture('cv_email_request_success', {
					device_type: isDesktop ? 'desktop' : 'mobile',
				});
			} else {
				posthog.capture('cv_email_request_error', {
					device_type: isDesktop ? 'desktop' : 'mobile',
				});
			}
		},
		[sendEmail, isDesktop],
	);

	const handleClose = useCallback(() => setOpen(false), []);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>Recevoir par mail</Button>
				</DialogTrigger>

				<DialogContent
					onInteractOutside={(event) => event.preventDefault()}
				>
					{formState === 'form' && (
						<>
							<DialogHeader>
								<DialogTitle>
									Recevez mon CV <br /> directement dans votre
									boîte mail !
								</DialogTitle>
								<DialogDescription>
									Entrez votre prénom et votre adresse e-mail
									dans le formulaire ci-dessous pour recevoir
									immédiatement mon CV.
								</DialogDescription>
							</DialogHeader>
							<CurriculumVitaeForm
								className="mt-6 space-y-3"
								onSubmitAction={handleSubmit}
								form={form}
								isLoading={isLoading}
							>
								<div className="mt-6 flex flex-row items-center justify-between">
									<DialogClose asChild>
										<Button
											onClick={handleClose}
											variant="outline"
										>
											Annuler
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
								</div>
							</CurriculumVitaeForm>
						</>
					)}

					{formState === 'success' && (
						<>
							<VisuallyHidden asChild>
								<DialogTitle>
									Le mail est en route !
								</DialogTitle>
							</VisuallyHidden>
							<SuccessMessage
								ref={iconRef}
								className="aspect-square"
							>
								<Button onClick={handleClose}>
									D'accord !
								</Button>
							</SuccessMessage>
						</>
					)}

					{formState === 'error' && (
						<>
							<VisuallyHidden asChild>
								<DialogTitle>
									Une erreur est survenue !
								</DialogTitle>
							</VisuallyHidden>
							<ErrorMessage
								ref={iconRef}
								className="aspect-square"
							>
								<Button onClick={handleClose}>
									Je comprends !
								</Button>
							</ErrorMessage>
						</>
					)}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button>Recevoir par mail</Button>
			</DrawerTrigger>

			<DrawerContent
				onInteractOutside={(event) => event.preventDefault()}
			>
				{formState === 'form' && (
					<>
						<DrawerHeader className="!pt-6 text-left">
							<DrawerTitle className="max-w-[18rem] font-semibold text-xl sm:text-2xl">
								Recevez mon CV directement dans votre boîte mail
								!
							</DrawerTitle>

							<DrawerDescription>
								Entrez votre <span>prénom</span> et votre{' '}
								<span>adresse e-mail</span> dans le formulaire
								ci-dessous pour{' '}
								<span className="text-theme">recevoir</span>{' '}
								immédiatement mon CV.
							</DrawerDescription>
						</DrawerHeader>

						<CurriculumVitaeForm
							className="mt-4 space-y-3 px-4"
							onSubmitAction={handleSubmit}
							form={form}
							isLoading={isLoading}
						>
							<DrawerFooter className="!px-0">
								<Button disabled={isLoading} type="submit">
									{isLoading ? (
										<>
											Envoi en cours <Spinner />
										</>
									) : (
										<>Recevoir mon CV maintenant</>
									)}
								</Button>
								<DrawerClose asChild>
									<Button
										onClick={handleClose}
										variant="outline"
									>
										Fermer la fenêtre
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</CurriculumVitaeForm>
					</>
				)}

				{formState === 'success' && (
					<>
						<VisuallyHidden asChild>
							<DrawerTitle>Le mail est en route !</DrawerTitle>
						</VisuallyHidden>
						<SuccessMessage ref={iconRef} className="px-6 py-8">
							<Button onClick={handleClose}>D'accord !</Button>
						</SuccessMessage>
					</>
				)}

				{formState === 'error' && (
					<>
						<VisuallyHidden asChild>
							<DrawerTitle>Une erreur est survenue !</DrawerTitle>
						</VisuallyHidden>
						<ErrorMessage ref={iconRef} className="px-6 py-8">
							<Button onClick={handleClose}>
								Je comprends !
							</Button>
						</ErrorMessage>
					</>
				)}
			</DrawerContent>
		</Drawer>
	);
};
