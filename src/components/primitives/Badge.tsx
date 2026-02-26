import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const variants = cva(
	[
		'inline-flex items-center justify-center gap-x-1 align-middle',
		'w-fit shrink-0 overflow-hidden rounded-full border border-input px-2 py-1',
		'whitespace-nowrap text-[10px] transition-[color,box-shadow] sm:text-xs',
		'font-pixel-square [&>span]:font-pixel-square [&>span]:text-theme',
		'[&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0',
	],
	{
		variants: {
			variant: {
				default: 'bg-background text-muted-foreground',
				primary: 'border-theme text-theme',
				secondary: 'bg-zinc-50 text-muted-foreground dark:bg-zinc-900',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

type BadgeProps = ComponentProps<'span'> &
	VariantProps<typeof variants> & {
		asChild?: boolean;
	};

export const Badge = ({
	className,
	variant,
	asChild = false,
	...props
}: BadgeProps) => {
	const Comp = asChild ? Slot : 'span';

	return (
		<Comp
			className={cn(variants({ variant }), className)}
			data-slot="badge"
			{...props}
		/>
	);
};
