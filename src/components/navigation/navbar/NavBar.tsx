import type React from 'react';
import { memo } from 'react';
import { CommandContent } from '@/components/command/CommandContent';
import { ActionGitHub } from '@/components/github/ActionGitHub';
import { ContextLlm } from '@/components/llm/ContextLlm';
import { Mark } from '@/components/mark/Mark';
import { FeedRss } from '@/components/rss/FeedRss';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { NAVIGATION_DATA } from '@/data/navbar';
import { getAllPosts } from '@/lib/blog/posts';
import { cn } from '@/lib/utils';
import { NavBarContent } from './NavBarContent';
import { NavBarWrapper } from './NavBarWrapper';

export const NavBar = memo((): React.JSX.Element => {
	const posts = getAllPosts();

	return (
		<NavBarWrapper>
			<div
				className={cn(
					'screen-line-before screen-line-after border-edge border-x',
					'mx-auto flex h-12 max-w-3xl items-center justify-between px-2 sm:gap-x-4'
				)}
			>
				<Mark />

				<NavBarContent links={NAVIGATION_DATA} variant="desktop" />

				<div className="flex items-center gap-x-2 sm:border-edge sm:border-l sm:pl-4">
					<CommandContent posts={posts} />

					<ActionGitHub />

					<ThemeSwitcher />

					<FeedRss />

					<ContextLlm />

					<NavBarContent links={NAVIGATION_DATA} variant="mobile" />
				</div>
			</div>
		</NavBarWrapper>
	);
});
