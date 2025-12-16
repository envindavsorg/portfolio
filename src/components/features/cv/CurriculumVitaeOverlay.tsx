'use client';

import type { Player } from '@lordicon/react';
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
import type { EmailFormData } from '@/hooks/use-email-form';
import useEmailForm from '@/hooks/use-email-form';
import useMediaQuery from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

type SendFormProps = {
	form: ReturnType<typeof useEmailForm>['form'];
	isLoading: boolean;
	onSubmit: (data: EmailFormData) => Promise<void>;
	className?: string;
	children?: React.ReactNode;
};

const SendForm = ({
	form,
	isLoading,
	onSubmit,
	className,
	children,
}: SendFormProps): React.JSX.Element => (
	<Form {...form}>
		<form className={className} onSubmit={form.handleSubmit(onSubmit)}>
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

			<div className="mt-6 flex flex-row items-center justify-between">
				{children}
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
		</form>
	</Form>
);

type DialogState = 'form' | 'success' | 'error';

export const CurriculumVitaeOverlay = () => {
	const isDesktop = useMediaQuery('(min-width: 768px)');
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

	const handleClose = useCallback(() => setOpen(false), []);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>Recevoir par mail</Button>
				</DialogTrigger>

				<DialogContent
					className={cn(
						dialogState !== 'form' &&
							'flex aspect-square items-center justify-center',
					)}
					onInteractOutside={(event) => event.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle>
							Recevez mon CV <br /> directement dans votre boîte
							mail !
						</DialogTitle>
						<DialogDescription>
							Entrez votre prénom et votre adresse e-mail dans le
							formulaire ci-dessous pour recevoir immédiatement
							mon CV.
						</DialogDescription>
					</DialogHeader>

					<SendForm
						className="mt-6 space-y-3"
						onSubmit={handleSubmit}
						form={form}
						isLoading={isLoading}
					>
						<DialogClose asChild>
							<Button onClick={handleClose} variant="outline">
								Fermer
							</Button>
						</DialogClose>
					</SendForm>
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
				<DrawerHeader className="text-left">
					<DrawerTitle className="max-w-[18rem] font-semibold text-xl sm:text-2xl">
						Recevez mon CV directement dans votre boîte mail !
					</DrawerTitle>

					<DrawerDescription>
						Entrez votre <span>prénom</span> et votre{' '}
						<span>adresse e-mail</span> dans le formulaire
						ci-dessous pour{' '}
						<span className="text-theme">recevoir</span>{' '}
						immédiatement mon CV.
					</DrawerDescription>
				</DrawerHeader>

				<SendForm
					className="mt-6 space-y-3 px-4"
					onSubmit={handleSubmit}
					form={form}
					isLoading={isLoading}
				>
					<DrawerFooter>
						<DrawerClose asChild>
							<Button onClick={handleClose} variant="outline">
								Fermer
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</SendForm>
			</DrawerContent>
		</Drawer>
	);
};
