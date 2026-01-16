'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/buttons/Button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/Drawer';
import { PanelFooter } from '@/components/ui/Panel';
import GLOBAL_DATA from '@/content/data/global';
import type { EmailFormData } from '@/hooks/use-email-form';
import useEmailForm from '@/hooks/use-email-form';
import useMediaQuery from '@/hooks/use-media-query';
import { CvError } from './CvError';
import { CvForm } from './CvForm';
import { CvModal } from './CvModal';
import { CvSuccess } from './CvSuccess';

const CvFooter = () => {
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
			const success = await sendEmail(data);
			setFormState(success ? 'success' : 'error');
		},
		[sendEmail, isDesktop]
	);

	const renderContent = () => {
		if (formState === 'success' || formState === 'error') {
			const isSuccess = formState === 'success';
			const FeedbackComponent = isSuccess ? CvSuccess : CvError;
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
					<Description>Entrez votre prénom et votre adresse e-mail pour recevoir immédiatement mon CV.</Description>
				</Header>

				<CvForm form={form} isLoading={isLoading} onCancel={handleClose} onSubmit={handleSubmit} />
			</>
		);
	};

	return (
		<PanelFooter>
			<Button asChild variant="outline">
				<Link aria-label={GLOBAL_DATA.CV.name} href={GLOBAL_DATA.CV.url} rel="noopener noreferrer" target="_blank">
					Voir et télécharger
				</Link>
			</Button>

			<CvModal isDesktop={isDesktop} open={open} setOpen={setOpen}>
				{renderContent()}
			</CvModal>
		</PanelFooter>
	);
};

CvFooter.displayName = 'CVFooter';

export { CvFooter };
