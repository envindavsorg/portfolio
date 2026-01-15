import Link from 'next/link';
import type React from 'react';
import { lazy } from 'react';
import { Button } from '@/components/Button';

const V0Icon = lazy(() =>
	import('@/components/stack/V0').then((m) => ({
		default: m.V0Icon,
	}))
);

interface OpenInV0Props {
	url: string;
}

export const OpenInV0 = ({ url }: OpenInV0Props): React.JSX.Element => (
	<Button asChild className="not-prose gap-1" variant="outline">
		<Link
			aria-label="Ouvrir dans v0"
			href={`https://v0.app/chat/api/open?url=${url}`}
			rel="noopener noreferrer"
			target="_blank"
		>
			Ouvrir dans
			<V0Icon className="size-5" />
		</Link>
	</Button>
);
