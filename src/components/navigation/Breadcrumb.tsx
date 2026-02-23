import { CaretRightIcon, DotsThreeIcon } from '@phosphor-icons/react/dist/ssr';
import { Slot } from '@radix-ui/react-slot';
import React from 'react';
import { cn } from '@/lib/utils';

export const Breadcrumb = React.forwardRef<
	HTMLElement,
	React.ComponentPropsWithoutRef<'nav'> & {
		separator?: React.ReactNode;
	}
>(({ ...props }, ref) => (
	<nav aria-label="breadcrumb" className="lowercase" ref={ref} {...props} />
));

export const BreadcrumbList = React.forwardRef<
	HTMLOListElement,
	React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
	<ol
		className={cn(
			'wrap-break-word flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs sm:gap-2.5 sm:text-sm',
			className
		)}
		ref={ref}
		{...props}
	/>
));

export const BreadcrumbItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
	<li
		className={cn('inline-flex items-center gap-1.5', className)}
		ref={ref}
		{...props}
	/>
));

export const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<'a'> & {
		asChild?: boolean;
	}
>(({ asChild, className, ...props }, ref) => {
	const Comp = asChild ? Slot : 'a';

	return (
		<Comp
			className={cn('transition-colors hover:text-foreground', className)}
			ref={ref}
			{...props}
		/>
	);
});

export const BreadcrumbPage = React.forwardRef<
	HTMLSpanElement,
	React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
	<span
		aria-current="page"
		aria-disabled="true"
		className={cn('font-normal text-theme', className)}
		ref={ref}
		role="link"
		{...props}
	/>
));

export const BreadcrumbSeparator = ({
	children,
	className,
	...props
}: React.ComponentProps<'li'>) => (
	<li
		aria-hidden="true"
		className={cn('[&>svg]:h-3.5 [&>svg]:w-3.5', className)}
		role="presentation"
		{...props}
	>
		{children ?? <CaretRightIcon />}
	</li>
);

export const BreadcrumbEllipsis = ({
	className,
	...props
}: React.ComponentProps<'span'>) => (
	<span
		aria-hidden="true"
		className={cn('flex h-9 w-9 items-center justify-center', className)}
		role="presentation"
		{...props}
	>
		<DotsThreeIcon className="h-4 w-4" />
		<span className="sr-only">More</span>
	</span>
);
