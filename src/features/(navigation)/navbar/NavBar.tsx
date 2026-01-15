'use client';

import dynamic from 'next/dynamic';
import type React from 'react';
import { memo } from 'react';
import type { NavigationItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { NavBarContent } from './NavBarContent';
import { NavBarMark } from './NavBarMark';
import { NavBarWrapper } from './NavBarWrapper';
import { NavBarLinksGitHub, NavBarLinksLLM, NavBarLinksRSS, NavBarLinksTheme } from './NavbarLinks';

const CommandContent = dynamic(
	() => import('@/components/navigation/command/CommandContent').then((mod) => mod.CommandContent),
	{ ssr: false }
);

interface NavBarProps {
	content: NavigationItem[];
	posts: Post[];
}

export const NavBar = memo(({ content, posts }: NavBarProps): React.JSX.Element => {
	return (
		<NavBarWrapper>
			<div
				className={cn(
					'screen-line-before screen-line-after border-edge border-x',
					'mx-auto flex h-12 max-w-3xl items-center justify-between px-2 sm:gap-x-4'
				)}
			>
				<NavBarMark />

				<NavBarContent links={content} variant="desktop" />

				<div className="flex items-center gap-x-2 sm:border-edge sm:border-l sm:pl-4">
					<CommandContent posts={posts} />

					<NavBarLinksGitHub />
					<NavBarLinksTheme />
					<NavBarLinksRSS />
					<NavBarLinksLLM />

					<NavBarContent links={content} variant="mobile" />
				</div>
			</div>
		</NavBarWrapper>
	);
});
