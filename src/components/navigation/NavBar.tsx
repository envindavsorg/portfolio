import type React from 'react';
import { NavBarMobile } from '@/components/navigation/elements/NavBarMobile';
import { cn } from '@/lib/utils';
import { ToggleGitHub } from './actions/ToggleGitHub';
import { ToggleRss } from './actions/ToggleRss';
import { ToggleSearch } from './actions/ToggleSearch';
import { ToggleTheme } from './actions/ToggleTheme';
import { NavBarDesktop } from './elements/NavBarDesktop';
import { NavBarMark } from './elements/NavBarMark';
import { NavBarWrapper } from './elements/NavBarWrapper';

const MAIN_NAV: NavigationItem[] = [
	{ title: 'Accueil', href: '/' },
	{ title: 'Blog', href: '/blog' },
	{ title: 'Composants', href: '/components' },
	{ title: 'Outils', href: '/utils' },
];

type NavBarProps = {
	posts: Post[];
};

export const NavBar = ({ posts }: NavBarProps): React.JSX.Element => (
	<NavBarWrapper
		className={cn(
			'sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background px-2 pt-2',
			'not-dark:data-[affix=true]:**:data-header-container:after:bg-border'
		)}
	>
		<div
			className={cn(
				'screen-line-before screen-line-after mx-auto',
				'flex items-center justify-between gap-2',
				'h-12 border-edge border-x px-2 sm:gap-4 md:max-w-3xl',
				'after:z-1 after:transition-[background-color]'
			)}
			data-header-container
		>
			<NavBarMark />

			<div className="flex-1" />

			<NavBarDesktop items={MAIN_NAV} />

			<div className="flex items-center gap-2">
				<ToggleSearch posts={posts} />
				<ToggleGitHub />
				<ToggleTheme />
				<ToggleRss />

				<NavBarMobile items={MAIN_NAV} />
			</div>
		</div>
	</NavBarWrapper>
);
