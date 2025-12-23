'use client';

import Link from 'next/link';
import type React from 'react';
import { AnimatedRssIcon } from '@/components/icons/AnimatedRssIcon';
import { Button } from '@/components/ui/Button';

export const ToggleRss = (): React.JSX.Element => (
	<Link
		aria-label="Flux RSS"
		href="/api/rss"
		rel="noopener noreferrer"
		target="_blank"
	>
		<Button
			className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
			size="icon"
			variant="outline"
		>
			<AnimatedRssIcon className="relative after:absolute after:-inset-2" />
			<span className="sr-only">Flux RSS</span>
		</Button>
	</Link>
);
