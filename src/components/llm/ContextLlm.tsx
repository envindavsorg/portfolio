import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/Button';
import { IconLlm } from './IconLlm';

export const ContextLlm = (): React.JSX.Element => (
	<Link
		aria-label="Contexte essentiel - LLM"
		href="/llms.txt"
		rel="noopener noreferrer"
		target="_blank"
	>
		<Button shadow size="icon" variant="outline">
			<IconLlm className="relative after:absolute after:-inset-2" />
			<span className="sr-only">Contexte essentiel - LLM</span>
		</Button>
	</Link>
);
