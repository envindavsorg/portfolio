'use client';

import NumberFlow from '@number-flow/react';
import type React from 'react';
import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CounterProps {
	value: number;
	children?: React.ReactNode;
	className?: string;
}

export const Counter = memo(({ value, children, className }: CounterProps) => {
	const [displayValue, setDisplayValue] = useState(0);

	useEffect(() => {
		setDisplayValue(value);
	}, [value]);

	return (
		<span className={cn('inline-flex items-center', className)}>
			<NumberFlow respectMotionPreference value={displayValue} />
			{children}
		</span>
	);
});
