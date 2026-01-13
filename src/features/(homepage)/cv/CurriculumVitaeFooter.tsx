'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Link from 'next/link';
import posthog from 'posthog-js';
import type React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/Button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/Dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
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
import { PanelFooter } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { Prose } from '@/components/ui/Typography';
import type { EmailFormData } from '@/hooks/use-email-form';
import useEmailForm from '@/hooks/use-email-form';
import useMediaQuery from '@/hooks/use-media-query';
import { USER } from '@/lib/user';

interface CVForm {
	form: ReturnType<typeof useEmailForm>['form'];
	isLoading: boolean;
	onSubmit: (data: EmailFormData) => Promise<void>;
	onCancel: () => void;
}

const CVForm = ({ form, isLoading, onSubmit, onCancel }: CVForm): React.JSX.Element => (
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
							<Input disabled={isLoading} placeholder="..." type="email" {...field} />
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

interface CVResponsiveModalProps {
	children: React.ReactNode;
	open: boolean;
	setOpen: (open: boolean) => void;
	isDesktop: boolean;
}

const CVResponsiveModal = ({
	children,
	open,
	setOpen,
	isDesktop,
}: CVResponsiveModalProps): React.JSX.Element => {
	const Container = isDesktop ? Dialog : Drawer;
	const Content = isDesktop ? DialogContent : DrawerContent;
	const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;

	return (
		<Container onOpenChange={setOpen} open={open}>
			<Trigger asChild>
				<Button>Recevoir par mail</Button>
			</Trigger>
			<Content onInteractOutside={(event) => event.preventDefault()}>{children}</Content>
		</Container>
	);
};

interface CVSuccessMessageProps {
	children?: React.ReactNode;
}

const CVSuccessMessage = memo(
	({ children }: CVSuccessMessageProps): React.JSX.Element => (
		<div className="flex aspect-square flex-col items-center justify-center gap-y-2 text-center">
			<Confetti
				className="size-full"
				gravity={0.1}
				initialVelocityX={2}
				initialVelocityY={2}
				numberOfPieces={25}
				opacity={1}
				recycle
				run
				wind={0.01}
			/>

			<h3 className="font-semibold text-lg leading-normal">Le mail est en route !</h3>
			<Prose>Vous devriez le recevoir dans quelques instants.</Prose>

			{children}
		</div>
	)
);

interface CVErrorMessageProps {
	children?: React.ReactNode;
}

const CVErrorMessage = memo(
	({ children }: CVErrorMessageProps): React.JSX.Element => (
		<div className="flex aspect-square flex-col items-center justify-center gap-y-2 text-center">
			<h3 className="font-semibold text-lg leading-normal">Une erreur est survenue !</h3>
			<Prose>Oups, veuillez réessayer plus tard.</Prose>

			{children}
		</div>
	)
);

const CurriculumVitaeFooter = (): React.JSX.Element => {
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [open, setOpen] = useState(false);
	const [formState, setFormState] = useState<'form' | 'success' | 'error'>('form');

	const { form, isLoading, sendEmail } = useEmailForm();
	const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!open) {
			resetTimeoutRef.current = setTimeout(() => {
				setFormState('form');
				form.reset();
			}, 600);
		}

		return () => {
			if (resetTimeoutRef.current) {
				clearTimeout(resetTimeoutRef.current);
			}
		};
	}, [open, form]);

	const handleClose = useCallback(() => setOpen(false), []);

	const handleSubmit = useCallback(
		async (data: EmailFormData) => {
			const deviceType = isDesktop ? 'desktop' : 'mobile';
			posthog.capture('cv_email_request_submitted', { device_type: deviceType });

			const success = await sendEmail(data);
			setFormState(success ? 'success' : 'error');

			posthog.capture(success ? 'cv_email_request_success' : 'cv_email_request_error', {
				device_type: deviceType,
			});
		},
		[sendEmail, isDesktop]
	);

	const renderContent = () => {
		if (formState === 'success' || formState === 'error') {
			const isSuccess = formState === 'success';
			const FeedbackComponent = isSuccess ? CVSuccessMessage : CVErrorMessage;
			const title = isSuccess ? 'Le mail est en route !' : 'Une erreur est survenue !';
			const buttonText = isSuccess ? "D'accord !" : 'Je comprends !';
			const HeaderComp = isDesktop ? DialogTitle : DrawerTitle;

			return (
				<>
					<VisuallyHidden asChild>
						<HeaderComp>{title}</HeaderComp>
					</VisuallyHidden>

					<FeedbackComponent>
						<Button className="mt-4" onClick={handleClose}>
							{buttonText}
						</Button>
					</FeedbackComponent>
				</>
			);
		}

		const Header = isDesktop ? DialogHeader : DrawerHeader;
		const Title = isDesktop ? DialogTitle : DrawerTitle;
		const Description = isDesktop ? DialogDescription : DrawerDescription;

		return (
			<>
				<Header>
					<Title>Recevez maintenant mon CV !</Title>
					<Description>
						Entrez votre prénom et votre adresse e-mail pour recevoir immédiatement mon CV.
					</Description>
				</Header>

				<CVForm form={form} isLoading={isLoading} onCancel={handleClose} onSubmit={handleSubmit} />
			</>
		);
	};

	return (
		<PanelFooter>
			<Button asChild variant="outline">
				<Link
					href={USER.documents.cv.url}
					onClick={() => {
						posthog.capture('cv_download_clicked', {
							cv_url: USER.documents.cv.url,
						});
					}}
					rel="noopener noreferrer"
					target="_blank"
				>
					Voir et télécharger
				</Link>
			</Button>

			<CVResponsiveModal isDesktop={isDesktop} open={open} setOpen={setOpen}>
				{renderContent()}
			</CVResponsiveModal>
		</PanelFooter>
	);
};

CurriculumVitaeFooter.displayName = 'CVFooter';

export { CurriculumVitaeFooter };
