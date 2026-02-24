import Link from 'next/link';
import { V0Icon } from '@/components/blocks/icons/stack/V0';
import { Button } from '@/components/primitives/Button';

interface OpenInV0Props {
	url: string;
}

export const OpenInV0 = ({ url }: OpenInV0Props) => (
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
