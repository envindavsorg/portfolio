'use client';

import {
	CheckCircleIcon,
	CircleNotchIcon,
	InfoIcon,
	WarningIcon,
	XSquareIcon,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import type React from 'react';
import type { CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export const Toaster = ({ ...props }: ToasterProps): React.JSX.Element => {
	const { theme = 'system' } = useTheme();

	return (
		<Sonner
			className="toaster group"
			icons={{
				success: (
					<CheckCircleIcon className="size-5 text-green-600 dark:text-green-300" />
				),
				info: <InfoIcon className="size-5 text-blue-600 dark:text-blue-300" />,
				warning: (
					<WarningIcon className="size-5 text-amber-600 dark:text-amber-300" />
				),
				error: <XSquareIcon className="size-5 text-destructive" />,
				loading: <CircleNotchIcon className="size-5 animate-spin text-theme" />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--input)',
					'--border-radius': 'var(--radius-lg)',
				} as CSSProperties
			}
			theme={theme as ToasterProps['theme']}
			{...props}
		/>
	);
};
