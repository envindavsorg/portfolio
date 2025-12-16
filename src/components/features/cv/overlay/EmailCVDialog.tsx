'use client';

import type { Player } from '@lordicon/react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import useEmailForm, { type EmailFormData } from '@/hooks/use-email-form';
import { cn } from '@/lib/utils';
import { ErrorContent } from '../ErrorContent';
import { EmailFormContent } from '../FormContent';
import { SuccessContent } from '../SuccessContent';

type DialogState = 'form' | 'success' | 'error';

type EmailCVDialogProps = {
	className?: string;
	children: React.ReactNode;
};

export const EmailCVDialog = ({ className, children }: EmailCVDialogProps) => {
	const [open, setOpen] = useState(false);
	const [dialogState, setDialogState] = useState<DialogState>('form');

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

	return (
		<div className={className}>
			<Dialog onOpenChange={setOpen} open={open}>
				<DialogTrigger asChild>{children}</DialogTrigger>

				<DialogContent
					className={cn(
						dialogState !== 'form' &&
							'flex aspect-square items-center justify-center',
					)}
					onInteractOutside={(e) => e.preventDefault()}
				>
					{dialogState === 'success' && (
						<SuccessContent onClose={handleClose} ref={iconRef} />
					)}

					{dialogState === 'error' && (
						<ErrorContent onClose={handleClose} ref={iconRef} />
					)}

					{dialogState === 'form' && (
						<EmailFormContent
							form={form}
							isLoading={isLoading}
							onClose={handleClose}
							onSubmit={handleSubmit}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};
