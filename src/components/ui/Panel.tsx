import { Slot as SlotPrimitive } from 'radix-ui';
import type React from 'react';
import { cn } from '@/lib/utils';

const Slot = SlotPrimitive.Slot;

export const Panel = ({
	className,
	...props
}: React.ComponentProps<'section'>): React.JSX.Element => (
	<section
		className={cn('screen-line-before screen-line-after border-edge border-x', className)}
		data-slot="panel"
		{...props}
	/>
);

export const PanelHeader = ({
	className,
	...props
}: React.ComponentProps<'div'>): React.JSX.Element => (
	<div className={cn('screen-line-after px-3', className)} data-slot="panel-header" {...props} />
);

export const PanelTitle = ({
	className,
	asChild = false,
	...props
}: React.ComponentProps<'h2'> & { asChild?: boolean }): React.JSX.Element => {
	const Comp = asChild ? Slot : 'h2';

	return (
		<Comp
			className={cn('font-semibold text-xl sm:text-2xl', className)}
			data-slot="panel-title"
			{...props}
		/>
	);
};

export const PanelContent = ({
	className,
	...props
}: React.ComponentProps<'div'>): React.JSX.Element => (
	<div className={cn('p-3', className)} data-slot="panel-body" {...props} />
);

export const PanelFooter = ({
	className,
	...props
}: React.ComponentProps<'div'>): React.JSX.Element => (
	<div
		className={cn(
			'screen-line-before flex justify-between gap-3 px-3 py-2 sm:justify-end',
			className
		)}
		data-slot="panel-footer"
		{...props}
	/>
);
