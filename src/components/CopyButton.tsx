'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CheckIcon, type CheckIconHandle } from '@/components/icons/animated/CheckIcon';
import { CopyIcon, type CopyIconHandle } from '@/components/icons/animated/CopyIcon';
import { XIcon, type XIconHandle } from '@/components/icons/animated/XIcon';

type CopyState = 'idle' | 'success' | 'fail';
type IconHandle = CopyIconHandle | CheckIconHandle | XIconHandle;

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

const CopyButton = ({
	value,
	className,
	label = 'Copier le texte dans le presse-papier',
	timeout = 2000,
}: CopyButtonProps): React.JSX.Element => {
	const [state, setState] = useState<CopyState>('idle');
	const iconRef = useRef<IconHandle>(null);
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
			variant="copy"
		>
			<Icon ref={iconRef} />
			<span className="sr-only">{label}</span>
		</Button>
	);
};

CopyButton.displayName = 'CopyButton';

export { CopyButton };
