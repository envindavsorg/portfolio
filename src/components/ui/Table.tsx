import type React from 'react';
import { cn } from '@/lib/utils';

const Table = ({
	className,
	...props
}: React.ComponentProps<'table'>): React.JSX.Element => (
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

const TableHeader = ({
	className,
	...props
}: React.ComponentProps<'thead'>): React.JSX.Element => (
	<thead
		className={cn('[&_tr]:border-b', className)}
		data-slot="table-header"
		{...props}
	/>
);

const TableBody = ({
	className,
	...props
}: React.ComponentProps<'tbody'>): React.JSX.Element => (
	<tbody
		className={cn('[&_tr:last-child]:border-0', className)}
		data-slot="table-body"
		{...props}
	/>
);

const TableRow = ({
	className,
	...props
}: React.ComponentProps<'tr'>): React.JSX.Element => (
	<tr
		className={cn(
			'border-edge border-b transition-colors hover:bg-muted/50',
			className
		)}
		data-slot="table-row"
		{...props}
	/>
);

const TableHead = ({
	className,
	...props
}: React.ComponentProps<'th'>): React.JSX.Element => (
	<th
		className={cn(
			'h-10 whitespace-nowrap px-2 text-left align-middle font-medium font-sans text-muted-foreground',
			className
		)}
		data-slot="table-head"
		{...props}
	/>
);

const TableCell = ({
	className,
	...props
}: React.ComponentProps<'td'>): React.JSX.Element => (
	<td
		className={cn('whitespace-nowrap p-2 align-middle', className)}
		data-slot="table-cell"
		{...props}
	/>
);

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
