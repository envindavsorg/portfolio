import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const Panel = ({ className, ...props }: ComponentProps<'section'>) => (
	<section
		className={cn(' border-edge border-x', className)}
		data-slot="panel"
		{...props}
	/>
);

const PanelHeader = ({ className, ...props }: ComponentProps<'div'>) => (
	<div
		className={cn('screen-line-after px-3', className)}
		data-slot="panel-header"
		{...props}
	/>
);

const PanelTitle = ({ className, ...props }: ComponentProps<'h2'>) => (
	<h2
		className={cn('font-semibold text-xl sm:text-2xl', className)}
		data-slot="panel-title"
		{...props}
	/>
);

const PanelContent = ({ className, ...props }: ComponentProps<'div'>) => (
	<div className={cn('p-3', className)} data-slot="panel-body" {...props} />
);

const PanelFooter = ({ className, ...props }: ComponentProps<'div'>) => (
	<div
		className={cn(
			'screen-line-before flex justify-between gap-3 px-3 py-2 sm:justify-end',
			className
		)}
		data-slot="panel-footer"
		{...props}
	/>
);

export { Panel, PanelHeader, PanelTitle, PanelContent, PanelFooter };
