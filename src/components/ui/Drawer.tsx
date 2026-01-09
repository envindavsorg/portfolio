'use client';

import type React from 'react';
import { forwardRef } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '@/lib/utils';

const Drawer = ({
	shouldScaleBackground = true,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>): React.JSX.Element => (
	<DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(
	({ className, ...props }, ref): React.JSX.Element => (
		<DrawerPrimitive.Overlay
			className={cn('fixed inset-0 z-50 bg-black/80', className)}
			ref={ref}
			{...props}
		/>
	)
);

const DrawerContent = forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(
	({ className, children, ...props }, ref): React.JSX.Element => (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				className={cn(
					'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-0 border bg-background px-5 pb-5',
					className
				)}
				ref={ref}
				{...props}
			>
				<div className="pt-3 pb-6">
					<div className="mx-auto h-0.5 w-[100px] rounded-full bg-muted-foreground" />
				</div>
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	)
);

const DrawerHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
	<div className={cn('mb-4 flex flex-col gap-2 text-left', className)} {...props} />
);

const DrawerFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
	<div className={cn('mt-6 flex flex-row items-center justify-between', className)} {...props} />
);

const DrawerTitle = forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(
	({ className, ...props }, ref): React.JSX.Element => (
		<DrawerPrimitive.Title
			className={cn('font-semibold text-lg text-theme leading-normal', className)}
			ref={ref}
			{...props}
		/>
	)
);

const DrawerDescription = forwardRef<
	React.ComponentRef<typeof DrawerPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(
	({ className, ...props }, ref): React.JSX.Element => (
		<DrawerPrimitive.Description
			className={cn('text-muted-foreground text-sm', className)}
			ref={ref}
			{...props}
		/>
	)
);

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
