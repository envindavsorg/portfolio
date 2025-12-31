import Link from 'next/link';
import type React from 'react';
import { Button } from '@/components/ui/Button';
import { USER } from '@/lib/user';
import { IconGitHub } from './IconGitHub';

export const ActionGitHub = (): React.JSX.Element => (
	<Link
		aria-label="Mon profil GitHub"
		href={`https://github.com/${USER.username}`}
		rel="noopener"
		target="_blank"
	>
		<Button shadow size="icon" variant="outline">
			<IconGitHub className="relative after:absolute after:-inset-2" />
			<span className="sr-only">Mon profil GitHub</span>
		</Button>
	</Link>
);
