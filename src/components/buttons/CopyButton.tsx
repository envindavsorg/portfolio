'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/buttons/Button';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { CopyIcon } from '@/components/icons/CopyIcon';
import { XIcon } from '@/components/icons/XIcon';

type CopyState = 'idle' | 'success' | 'fail';

const ICONS = {
	idle: CopyIcon,
	success: CheckIcon,
	fail: XIcon,
} as const;

interface CopyButtonProps {
	value: string;
	className?: string;
	label?: string;
	timeout?: number;
}

export const CopyButton = ({
	value,
	className,
	label = 'copier le texte dans le presse-papier',
	timeout = 2000,
}: CopyButtonProps) => {
	const [state, setState] = useState<CopyState>('idle');
	const iconRef = useRef<AnimatedIconHandle>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleCopy = async () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		try {
			await navigator.clipboard.writeText(value);
			setState('success');
		} catch {
			setState('fail');
		}

		timeoutRef.current = setTimeout(() => {
			setState('idle');
		}, timeout);
	};

	const Icon = ICONS[state];

	return (
		<Button
			aria-label={label}
			className={className}
			onClick={handleCopy}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Icon ref={iconRef} />
			<span className="sr-only">{label}</span>
		</Button>
	);
};
