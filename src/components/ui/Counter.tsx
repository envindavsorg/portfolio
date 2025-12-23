'use client';

import NumberFlow from '@number-flow/react';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type CounterProps = {
	value: number;
	interval?: number;
	step?: number;
	children?: React.ReactNode;
	className?: string;
};

export const Counter = memo(
	({
		value,
		interval = 150,
		step = 1,
		children,
		className,
	}: CounterProps): React.JSX.Element => {
		const [displayValue, setDisplayValue] = useState(0);

		useEffect(() => {
			let current = 0;
			let timeoutId: NodeJS.Timeout;
			setDisplayValue(0);

			if (value > 0) {
				const totalSteps = Math.ceil(value / step);
				const actualStep = value / totalSteps;

				const tick = () => {
					current += actualStep;

					if (current >= value) {
						setDisplayValue(value);
						return;
					}

					setDisplayValue(Math.round(current));
					timeoutId = setTimeout(tick, interval);
				};

				timeoutId = setTimeout(tick, 100);
			}

			return () => {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
			};
		}, [value, interval, step]);

		return (
			<span className={cn(className)}>
				<NumberFlow respectMotionPreference value={displayValue} /> {children}
			</span>
		);
	}
);
