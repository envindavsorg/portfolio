'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, useCallback, useEffect, useRef, useState } from 'react';
import { CheckIcon } from '@/components/blocks/icons/CheckIcon';
import { CopyIcon } from '@/components/blocks/icons/CopyIcon';
import { XIcon } from '@/components/blocks/icons/XIcon';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
	[
		'inline-flex items-center justify-center gap-2 rounded-full font-medium text-sm',
		'cursor-pointer select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
		"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	{
		variants: {
			variant: {
				default: [
					'bg-linear-to-b',
					'text-shadow-xs text-white',
					'from-zinc-700 dark:from-zinc-600',
					'to-zinc-800 dark:to-zinc-700',
					'hover:to-zinc-700 dark:hover:to-zinc-600',
					'dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/20',
				],
				outline: [
					'border border-input hover:text-accent-foreground',
					'bg-background hover:bg-accent',
					'dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15',
				],
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-foreground underline-offset-2 transition-colors hover:bg-transparent hover:text-theme hover:underline',
			},
			size: {
				default: 'h-8 px-4',
				icon: 'size-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export const Button = ({
	className,
	variant,
	size,
	asChild = false,
	...props
}: ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) => {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }), 'font-pixel-square')}
			data-slot="button"
			{...props}
		/>
	);
};

type CopyState = 'idle' | 'success' | 'fail';

const ICONS = {
	idle: CopyIcon,
	success: CheckIcon,
	fail: XIcon,
} as const;

interface CopyButtonProps {
	value?: string;
	getValueAction?: () => Promise<string>;
	variant?: 'default' | 'outline' | 'link' | 'ghost';
	className?: string;
	label?: string;
	timeout?: number;
}

export const CopyButton = ({
	value,
	getValueAction,
	variant = 'outline',
	className,
	label = 'copier le texte dans le presse-papier',
	timeout = 2000,
}: CopyButtonProps) => {
	const [state, setState] = useState<CopyState>('idle');
	const iconRef = useRef<AnimatedIconHandle>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleCopy = useCallback(async () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		try {
			const text = getValueAction ? await getValueAction() : (value ?? '');
			await navigator.clipboard.writeText(text);
			setState('success');
		} catch {
			setState('fail');
		}

		timeoutRef.current = setTimeout(() => setState('idle'), timeout);
	}, [value, getValueAction, timeout]);

	const handleMouseEnter = useCallback(() => {
		iconRef.current?.startAnimation();
	}, []);

	const handleMouseLeave = useCallback(() => {
		iconRef.current?.stopAnimation();
	}, []);

	const Icon = ICONS[state];

	return (
		<Button
			aria-label={label}
			className={cn(className, variant === 'ghost' && 'hover:bg-background!')}
			onClick={handleCopy}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			size="icon"
			variant={variant}
		>
			<Icon ref={iconRef} size={22} />
		</Button>
	);
};
