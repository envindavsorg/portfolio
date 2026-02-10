import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

const buttonVariants = cva(
	[
		'inline-flex items-center justify-center gap-2 rounded-full font-medium text-sm',
		'cursor-pointer select-none whitespace-nowrap outline-none focus-visible:ring-0',
		"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	{
		variants: {
			variant: {
				default: [
					'bg-linear-to-b',
					'text-shadow-xs text-white',
					'from-zinc-700 dark:from-zinc-600',
					'to-zinc-800 dark:to-zinc-700',
					'hover:to-zinc-700 dark:hover:to-zinc-600',
					'dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/20',
				],
				outline: [
					'border border-input hover:text-accent-foreground',
					'bg-background hover:bg-accent',
					'dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15',
				],
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-foreground underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-8 px-4',
				icon: 'size-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

type ButtonProps = ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

const Button = ({
	className,
	variant,
	size,
	asChild = false,
	...props
}: ButtonProps) => {
	const Comp = asChild ? Slot : 'button';

	return (
		<Comp
			className={buttonVariants({ variant, size, className })}
			data-slot="button"
			{...props}
		/>
	);
};

Button.displayName = 'Button';

export { Button, buttonVariants };
