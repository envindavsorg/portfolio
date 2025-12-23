import type React from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<div
		className={cn(
			'flex flex-col gap-6',
			'rounded-xl border border-input bg-card py-6 text-card-foreground',
			className
		)}
		data-slot="card"
		{...props}
	/>
);

export const CardHeader = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<div
		className={cn(
			'@container/card-header border-input px-6',
			'grid auto-rows-min grid-rows-[auto_auto] items-start gap-2',
			'has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
			className
		)}
		data-slot="card-header"
		{...props}
	/>
);

export const CardTitle = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<div
		className={cn('font-semibold leading-none', className)}
		data-slot="card-title"
		{...props}
	/>
);

export const CardDescription = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<div
		className={cn('text-muted-foreground text-sm', className)}
		data-slot="card-description"
		{...props}
	/>
);

export const CardAction = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<div
		className={cn(
			'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
			className
		)}
		data-slot="card-action"
		{...props}
	/>
);

export const CardContent = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<div className={cn('px-6', className)} data-slot="card-content" {...props} />
);

export const CardFooter = ({
	className,
	...props
}: ComponentProps<'div'>): React.JSX.Element => (
	<div
		className={cn(
			'flex items-center',
			'border-input px-6 [.border-t]:pt-6',
			className
		)}
		data-slot="card-footer"
		{...props}
	/>
);
