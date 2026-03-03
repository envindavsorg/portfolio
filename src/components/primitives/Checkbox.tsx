'use client';

import { CheckIcon } from '@phosphor-icons/react';
import { Indicator, Root } from '@radix-ui/react-checkbox';
import { type HTMLMotionProps, motion } from 'motion/react';
import {
	type ComponentProps,
	type ComponentPropsWithoutRef,
	type ComponentRef,
	forwardRef,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { cn } from '@/lib/utils';

export const Checkbox = forwardRef<ComponentRef<typeof Root>, ComponentPropsWithoutRef<typeof Root>>(
	({ className, ...props }, ref) => (
		<Root
			className={cn(
				'peer grid size-4 shrink-0 place-content-center rounded-sm',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				'data-[state=checked]:bg-primary',
				'data-[state=checked]:text-primary-foreground',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'border border-primary ring-offset-background',
				className
			)}
			ref={ref}
			{...props}
		>
			<Indicator className={cn('grid place-content-center text-current')}>
				<CheckIcon className="size-4" />
			</Indicator>
		</Root>
	)
);

export const CheckboxAnimated = ({
	className,
	checked: controlledChecked,
	defaultChecked,
	onCheckedChange,
	...props
}: ComponentProps<typeof Root> & HTMLMotionProps<'button'>) => {
	const [isChecked, setIsChecked] = useState(controlledChecked ?? defaultChecked ?? false);

	useEffect(() => {
		if (controlledChecked !== undefined) {
			setIsChecked(controlledChecked);
		}
	}, [controlledChecked]);

	const handleCheckedChange = useCallback(
		(checked: boolean) => {
			setIsChecked(checked);
			onCheckedChange?.(checked);
		},
		[onCheckedChange]
	);

	return (
		<Root asChild checked={controlledChecked} defaultChecked={defaultChecked} onCheckedChange={handleCheckedChange}>
			<motion.button
				className={cn(
					'peer size-4 shrink-0 cursor-pointer rounded-sm border border-input outline-none',
					'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
					'disabled:cursor-not-allowed disabled:opacity-50',
					'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
					'data-[state=checked]:border-theme data-[state=checked]:bg-theme data-[state=checked]:text-background',
					'transition-colors duration-500 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
					className
				)}
				data-slot="checkbox"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				{...props}
			>
				<Indicator asChild forceMount>
					<motion.svg
						animate={isChecked ? 'checked' : 'unchecked'}
						className="size-3.5"
						data-slot="checkbox-indicator"
						fill="none"
						initial="unchecked"
						stroke="currentColor"
						strokeWidth="3.5"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<motion.path
							d="M4.5 12.75l6 6 9-13.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							variants={{
								checked: {
									pathLength: 1,
									opacity: 1,
									transition: { duration: 0.2, delay: 0.2 },
								},
								unchecked: {
									pathLength: 0,
									opacity: 0,
									transition: { duration: 0.2 },
								},
							}}
						/>
					</motion.svg>
				</Indicator>
			</motion.button>
		</Root>
	);
};
