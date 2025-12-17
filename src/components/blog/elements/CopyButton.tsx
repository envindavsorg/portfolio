'use client';

import { CheckIcon, CopyIcon, XCircleIcon } from '@phosphor-icons/react';
import { useMemo, useOptimistic, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ICONS = {
	idle: CopyIcon,
	copied: CheckIcon,
	failed: XCircleIcon,
} as const;

type CopyButtonProps = {
	value: string;
	className?: string;
};

export const CopyButton = ({ value, className, ...props }: CopyButtonProps) => {
	const [state, setState] = useOptimistic<'idle' | 'copied' | 'failed'>(
		'idle',
	);
	const [, startTransition] = useTransition();

	const Icon = useMemo(() => ICONS[state], [state]);

	return (
		<Button
			className={cn('z-10 size-6 rounded-md', className)}
			onClick={() => {
				startTransition(async () => {
					try {
						await navigator.clipboard.writeText(value);
						setState('copied');
					} catch {
						setState('failed');
					}
					await new Promise((resolve) => setTimeout(resolve, 2000));
				});
			}}
			size="icon"
			variant="secondary"
			{...props}
		>
			<Icon className="size-3" />
			<span className="sr-only">Copy</span>
		</Button>
	);
};
