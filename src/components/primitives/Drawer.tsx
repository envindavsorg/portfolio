'use client';

import {
	type ComponentProps,
	type ComponentPropsWithoutRef,
	type ComponentRef,
	forwardRef,
	type HTMLAttributes,
} from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '@/lib/utils';

export const Drawer = ({
	shouldScaleBackground = true,
	...props
}: ComponentProps<typeof DrawerPrimitive.Root>) => (
	<DrawerPrimitive.Root
		shouldScaleBackground={shouldScaleBackground}
		{...props}
	/>
);

export const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

export const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = forwardRef<
	ComponentRef<typeof DrawerPrimitive.Overlay>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Overlay
		className={cn('fixed inset-0 z-50 backdrop-blur-lg', className)}
		ref={ref}
		{...props}
	/>
));

export const DrawerContent = forwardRef<
	ComponentRef<typeof DrawerPrimitive.Content>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DrawerPortal>
		<DrawerOverlay />

		<DrawerPrimitive.Content
			className={cn('fixed inset-x-0 bottom-0 z-50 h-auto', className)}
			ref={ref}
			{...props}
		>
			<div className="flex h-6 items-center justify-center border-edge border-t">
				<div className="h-1.25 w-10 rounded-full bg-muted-foreground/25 shadow-[0_0_4px_rgba(0,0,0,0.05)]" />
			</div>

			{children}
		</DrawerPrimitive.Content>
	</DrawerPortal>
));

export const DrawerHeader = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn('mb-4 flex flex-col gap-2 text-left', className)}
		{...props}
	/>
);

export const DrawerFooter = ({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn('mt-6 flex flex-row items-center justify-between', className)}
		{...props}
	/>
);

export const DrawerTitle = forwardRef<
	ComponentRef<typeof DrawerPrimitive.Title>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Title
		className={cn('font-semibold text-lg text-theme leading-normal', className)}
		ref={ref}
		{...props}
	/>
));

export const DrawerDescription = forwardRef<
	ComponentRef<typeof DrawerPrimitive.Description>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Description
		className={cn('text-muted-foreground text-sm', className)}
		ref={ref}
		{...props}
	/>
));
