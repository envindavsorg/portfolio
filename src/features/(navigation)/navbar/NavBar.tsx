import { NAVIGATION_DATA } from '@/content/data/navigation';
import { getAllPosts } from '@/lib/blog/posts';
import { cn } from '@/lib/utils';
import { NavBarContent } from './NavBarContent';
import { NavBarMark } from './NavBarMark';
import { NavBarWrapper } from './NavBarWrapper';
import { NavBarLinksCommand, NavBarLinksGitHub, NavBarLinksLLM, NavBarLinksRSS, NavBarLinksTheme } from './NavbarLinks';

export const NavBar = () => {
	const posts: Post[] = getAllPosts();

	return (
		<NavBarWrapper>
			<div
				className={cn(
					'screen-line-before screen-line-after border-edge border-x',
					'mx-auto flex h-12 max-w-3xl items-center justify-between px-2 sm:gap-x-4'
				)}
			>
				<NavBarMark />

				<NavBarContent links={NAVIGATION_DATA} variant="desktop" />

				<div className="flex items-center gap-x-2 sm:border-edge sm:border-l sm:pl-4">
					<NavBarLinksCommand posts={posts} />
					<NavBarLinksGitHub />
					<NavBarLinksTheme />
					<NavBarLinksRSS />
					<NavBarLinksLLM />

					<NavBarContent links={NAVIGATION_DATA} variant="mobile" />
				</div>
			</div>
		</NavBarWrapper>
	);
};
