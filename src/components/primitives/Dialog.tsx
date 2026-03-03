'use client';

import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = ({ ...props }: ComponentProps<typeof DialogPrimitive.Root>) => (
	<DialogPrimitive.Root data-slot="dialog" {...props} />
);

export const DialogTrigger = ({ ...props }: ComponentProps<typeof DialogPrimitive.Trigger>) => (
	<DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
);

export const DialogPortal = ({ ...props }: ComponentProps<typeof DialogPrimitive.Portal>) => (
	<DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
);

export const DialogClose = ({ ...props }: ComponentProps<typeof DialogPrimitive.Close>) => (
	<DialogPrimitive.Close data-slot="dialog-close" {...props} />
);

export const DialogOverlay = ({ ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) => (
	<DialogPrimitive.Overlay
		className={cn(
			'pointer-events-none fixed inset-0 z-50 select-none',
			'hidden bg-background/50 backdrop-blur-xs sm:block',
			'data-[state=closed]:fade-out-0 data-[state=closed]:animate-out',
			'data-[state=open]:fade-in-0 data-[state=open]:animate-in'
		)}
		data-slot="dialog-overlay"
		{...props}
	/>
);

export const DialogContent = ({
	className,
	overlay = true,
	children,
	...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
	overlay?: boolean;
}) => (
	<DialogPortal data-slot="dialog-portal">
		{overlay && <DialogOverlay />}
		<DialogPrimitive.Content
			className={cn(
				'fixed sm:top-auto sm:right-0 sm:bottom-0 sm:left-auto sm:m-6 sm:translate-x-0 sm:translate-y-0',
				'rounded-md border border-input p-5 outline-none focus:outline-none',
				'z-50 hidden w-full max-w-[calc(100%-2rem)] sm:grid sm:max-w-100',
				'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-100 data-[state=open]:slide-in-from-bottom-20 data-[state=open]:animate-in data-[state=open]:duration-600',
				'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:slide-out-to-top-20 data-[state=closed]:animate-out data-[state=closed]:duration-300',
				className
			)}
			data-slot="dialog-content"
			{...props}
		>
			{children}
		</DialogPrimitive.Content>
	</DialogPortal>
);

export const DialogHeader = ({ className, ...props }: ComponentProps<'div'>) => (
	<div className={cn('mb-4 flex flex-col gap-2 text-left', className)} data-slot="dialog-header" {...props} />
);

export const DialogFooter = ({ className, ...props }: ComponentProps<'div'>) => (
	<div
		className={cn('mt-6 flex flex-row items-center justify-between', className)}
		data-slot="dialog-footer"
		{...props}
	/>
);

export const DialogTitle = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => (
	<DialogPrimitive.Title
		className={cn('font-semibold text-lg text-theme leading-normal', className)}
		data-slot="dialog-title"
		{...props}
	/>
);

export const DialogDescription = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) => (
	<DialogPrimitive.Description
		className={cn('text-muted-foreground text-sm', className)}
		data-slot="dialog-description"
		{...props}
	/>
);
