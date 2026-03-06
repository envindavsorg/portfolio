'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { LlmIcon } from '@/components/icons/LlmIcon';
import { Button } from '@/components/primitives/Button';

export const NavBarLlm = () => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Link
				aria-label="Contexte essentiel"
				href="/llms.txt"
				rel="noopener noreferrer"
				target="_blank"
			>
				<LlmIcon ref={iconRef} />
				<span className="sr-only">Contexte essentiel</span>
			</Link>
		</Button>
	);
};
