import type React from 'react';
import { cn } from '@/lib/utils';

export const Table = ({
	className,
	...props
}: React.ComponentProps<'table'>) => (
	<div
		className="not-prose my-6 w-full overflow-y-auto rounded-lg border"
		data-slot="table-container"
	>
		<table
			className={cn(
				'relative w-full overflow-hidden border-none text-sm',
				className
			)}
			data-slot="table"
			{...props}
		/>
	</div>
);

export const TableHeader = ({
	className,
	...props
}: React.ComponentProps<'thead'>) => (
	<thead
		className={cn('[&_tr]:border-b', className)}
		data-slot="table-header"
		{...props}
	/>
);

export const TableBody = ({
	className,
	...props
}: React.ComponentProps<'tbody'>) => (
	<tbody
		className={cn('[&_tr:last-child]:border-0', className)}
		data-slot="table-body"
		{...props}
	/>
);

export const TableRow = ({
	className,
	...props
}: React.ComponentProps<'tr'>) => (
	<tr
		className={cn(
			'border-edge border-b transition-colors hover:bg-muted/50',
			className
		)}
		data-slot="table-row"
		{...props}
	/>
);

export const TableHead = ({
	className,
	...props
}: React.ComponentProps<'th'>) => (
	<th
		className={cn(
			'h-10 whitespace-nowrap px-2 text-start align-middle font-medium text-muted-foreground',
			className
		)}
		data-slot="table-head"
		{...props}
	/>
);

export const TableCell = ({
	className,
	...props
}: React.ComponentProps<'td'>) => (
	<td
		className={cn('whitespace-nowrap p-2 align-middle', className)}
		data-slot="table-cell"
		{...props}
	/>
);
