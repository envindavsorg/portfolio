'use client';

import Link from 'next/link';
import type React from 'react';
import { AnimatedGithubIcon } from '@/components/icons/AnimatedGitHubIcon';
import { Button } from '@/components/ui/Button';
import { USER } from '@/lib/user';

export const ToggleGitHub = (): React.JSX.Element => (
	<Link
		aria-label="Mon profil GitHub"
		href={`https://github.com/envindavsorg/${USER.username}`}
		rel="noopener"
		target="_blank"
	>
		<Button
			className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
			size="icon"
			variant="outline"
		>
			<AnimatedGithubIcon className="relative after:absolute after:-inset-2" />
			<span className="sr-only">Mon profil GitHub</span>
		</Button>
	</Link>
);
