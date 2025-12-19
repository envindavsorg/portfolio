'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { type HTMLMotionProps, motion } from 'motion/react';
import React from 'react';
import { cn } from '@/lib/utils';

type AnimatedCheckboxProps = React.ComponentProps<
	typeof CheckboxPrimitive.Root
> &
	HTMLMotionProps<'button'>;

export const AnimatedCheckbox = ({
	className,
	onCheckedChange,
	...props
}: AnimatedCheckboxProps) => {
	const [isChecked, setIsChecked] = React.useState(
		props?.checked ?? props?.defaultChecked ?? false,
	);

	React.useEffect(() => {
		if (props?.checked !== undefined) {
			setIsChecked(props.checked);
		}
	}, [props?.checked]);

	const handleCheckedChange = React.useCallback(
		(checked: boolean) => {
			setIsChecked(checked);
			onCheckedChange?.(checked);
		},
		[onCheckedChange],
	);

	return (
		<CheckboxPrimitive.Root
			{...props}
			onCheckedChange={handleCheckedChange}
			asChild
		>
			<motion.button
				data-slot="checkbox"
				className={cn(
					'peer size-4 shrink-0 cursor-pointer rounded-[4px] border border-input outline-none transition-colors duration-500 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-theme data-[state=checked]:bg-theme data-[state=checked]:text-background dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
					className,
				)}
				whileTap={{ scale: 0.95 }}
				whileHover={{ scale: 1.05 }}
				{...props}
			>
				<CheckboxPrimitive.Indicator forceMount asChild>
					<motion.svg
						data-slot="checkbox-indicator"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="3.5"
						stroke="currentColor"
						className="size-3.5"
						initial="unchecked"
						animate={isChecked ? 'checked' : 'unchecked'}
					>
						<title>Checkbox</title>
						<motion.path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M4.5 12.75l6 6 9-13.5"
							variants={{
								checked: {
									pathLength: 1,
									opacity: 1,
									transition: {
										duration: 0.2,
										delay: 0.2,
									},
								},
								unchecked: {
									pathLength: 0,
									opacity: 0,
									transition: {
										duration: 0.2,
									},
								},
							}}
						/>
					</motion.svg>
				</CheckboxPrimitive.Indicator>
			</motion.button>
		</CheckboxPrimitive.Root>
	);
};
