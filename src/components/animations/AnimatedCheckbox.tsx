'use client';

import { Indicator, Root } from '@radix-ui/react-checkbox';
import { type HTMLMotionProps, motion } from 'motion/react';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

type AnimatedCheckboxProps = React.ComponentProps<typeof Root> &
	HTMLMotionProps<'button'>;

export const AnimatedCheckbox = ({
	className,
	onCheckedChange,
	...props
}: AnimatedCheckboxProps) => {
	const [isChecked, setIsChecked] = React.useState(
		props?.checked ?? props?.defaultChecked ?? false
	);

	useEffect(() => {
		if (props?.checked !== undefined) {
			setIsChecked(props.checked);
		}
	}, [props?.checked]);

	const handleCheckedChange = React.useCallback(
		(checked: boolean) => {
			setIsChecked(checked);
			onCheckedChange?.(checked);
		},
		[onCheckedChange]
	);

	return (
		<Root {...props} asChild onCheckedChange={handleCheckedChange}>
			<motion.button
				className={cn(
					'peer size-4 shrink-0 cursor-pointer rounded-[4px] border border-input outline-none transition-colors duration-500 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-theme data-[state=checked]:bg-theme data-[state=checked]:text-background dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
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
						<title>Checkbox</title>
						<motion.path
							d="M4.5 12.75l6 6 9-13.5"
							strokeLinecap="round"
							strokeLinejoin="round"
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
				</Indicator>
			</motion.button>
		</Root>
	);
};
