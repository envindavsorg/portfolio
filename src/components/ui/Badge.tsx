import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const variants = cva(
	[
		'inline-flex items-center justify-center gap-1.5 align-middle',
		'w-fit shrink-0 overflow-hidden rounded-lg border px-2 py-1.5',
		'whitespace-nowrap font-medium text-xs transition-[color,box-shadow]',
		'[&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0',
	],
	{
		variants: {
			variant: {
				default: 'bg-background text-foreground',
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
}: BadgeProps): React.JSX.Element => {
	const Comp = asChild ? Slot : 'span';

	return (
		<Comp
			className={cn(variants({ variant }), className)}
			data-slot="badge"
			{...props}
		/>
	);
};
