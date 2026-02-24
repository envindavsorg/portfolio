'use client';

import {
	CheckCircleIcon,
	CircleNotchIcon,
	InfoIcon,
	WarningIcon,
	XSquareIcon,
} from '@phosphor-icons/react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { useTheme } from 'next-themes';
import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme();
	const isDesktop = useMediaQuery('(min-width: 768px)');

	return (
		<Sonner
			className="toaster group"
			icons={{
				success: (
					<CheckCircleIcon className="size-5 text-green-600 sm:size-6 dark:text-green-300" />
				),
				info: (
					<InfoIcon className="size-5 text-blue-600 sm:size-6 dark:text-blue-300" />
				),
				warning: (
					<WarningIcon className="size-5 text-amber-600 sm:size-6 dark:text-amber-300" />
				),
				error: <XSquareIcon className="size-5 text-destructive sm:size-6" />,
				loading: (
					<CircleNotchIcon className="size-5 animate-spin text-theme sm:size-6" />
				),
			}}
			position={isDesktop ? 'top-right' : 'top-center'}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--input)',
					'--border-radius': 'var(--radius-lg)',
				} as CSSProperties
			}
			theme={theme as ToasterProps['theme']}
			toastOptions={{
				classNames: {
					toast: 'border-edge shadow-lg backdrop-blur-sm',
					title: 'text-sm font-medium text-foreground',
					description: 'ps-1 sm:ps-2 text-xs sm:text-sm text-muted-foreground',
				},
			}}
			{...props}
		/>
	);
};
