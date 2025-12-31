import Link from 'next/link';
import type React from 'react';
import { IconRss } from '@/components/rss/IconRss';
import { Button } from '@/components/ui/Button';

export const FeedRss = (): React.JSX.Element => (
	<Link
		aria-label="Flux RSS"
		href="/api/rss"
		rel="noopener noreferrer"
		target="_blank"
	>
		<Button shadow size="icon" variant="outline">
			<IconRss className="relative after:absolute after:-inset-2" />
			<span className="sr-only">Flux RSS</span>
		</Button>
	</Link>
);
