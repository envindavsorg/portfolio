'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { GitHubIcon } from '@/components/blocks/icons/GitHubIcon';
import { Button } from '@/components/primitives/Button';
import GLOBAL_DATA from '@/content/data/global';

export const NavBarGitHub = () => {
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
				aria-label="Mon profil GitHub"
				href={GLOBAL_DATA.SOCIAL.github}
				rel="noopener noreferrer"
				target="_blank"
			>
				<GitHubIcon ref={iconRef} />
				<span className="sr-only">Mon profil GitHub</span>
			</Link>
		</Button>
	);
};
