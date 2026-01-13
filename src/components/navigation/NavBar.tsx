'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import posthog from 'posthog-js';
import type React from 'react';
import { memo, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { GitHubIcon } from '@/components/icons/animated/GitHubIcon';
import { LlmIcon } from '@/components/icons/animated/LlmIcon';
import { MoonIcon } from '@/components/icons/animated/MoonIcon';
import { RssIcon } from '@/components/icons/animated/RssIcon';
import { SunIcon } from '@/components/icons/animated/SunIcon';
import { Mark } from '@/components/navigation/mark/Mark';
import { Button } from '@/components/ui/Button';
import { Kbd } from '@/components/ui/Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import useMetaColor from '@/hooks/use-meta-color';
import { soundManager } from '@/lib/sound-manager';
import { META_THEME_COLORS } from '@/lib/theme';
import { USER } from '@/lib/user';
import { cn } from '@/lib/utils';
import { NavBarContent } from './NavBarContent';
import { NavBarWrapper } from './NavBarWrapper';

const CommandContent = dynamic(
	() => import('@/components/navigation/command/CommandContent').then((mod) => mod.CommandContent),
	{ ssr: false }
);

const NAVIGATION_DATA: NavigationItem[] = [
	{
		title: 'Accueil',
		description: "Retour à l'accueil",
		href: '/',
	},
	{
		title: 'Blog',
		description: 'Mes articles de blog',
		href: '/blog',
	},
	{
		title: 'Composants',
		description: 'Bibliothèque de composants UI',
		href: '/components',
	},
	{
		title: 'Outils',
		description: 'Outils et utilitaires',
		href: '/utils',
	},
];

interface NavBarProps {
	posts: Post[];
}

export const NavBar = memo(({ posts }: NavBarProps): React.JSX.Element => {
	const { resolvedTheme, setTheme } = useTheme();
	const { setMetaColor } = useMetaColor();

	const switchTheme = useCallback(() => {
		const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
		soundManager.playThemeSound();
		setTheme(newTheme);
		setMetaColor(resolvedTheme === 'dark' ? META_THEME_COLORS.light : META_THEME_COLORS.dark);

		posthog.capture('theme_changed', {
			from_theme: resolvedTheme,
			to_theme: newTheme,
		});
	}, [resolvedTheme, setTheme, setMetaColor]);

	const viewTransition = useCallback(() => {
		if (!document.startViewTransition) {
			switchTheme();
			return;
		}

		document.startViewTransition(switchTheme);
	}, [switchTheme]);

	useHotkeys('d', viewTransition, [viewTransition]);

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

					<Link
						aria-label="Mon profil GitHub"
						href={`https://github.com/${USER.username}`}
						rel="noopener"
						target="_blank"
					>
						<Button shadow size="icon" variant="outline">
							<GitHubIcon className="relative after:absolute after:-inset-2" />
							<span className="sr-only">Mon profil GitHub</span>
						</Button>
					</Link>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
								onClick={viewTransition}
								size="icon"
								variant="outline"
							>
								<MoonIcon className="relative hidden after:absolute after:-inset-2 [html.dark_&]:block" />
								<SunIcon className="relative hidden after:absolute after:-inset-2 [html.light_&]:block" />
								<span className="sr-only">Changer de thème</span>
							</Button>
						</TooltipTrigger>

						<TooltipContent className="pr-2 pl-3">
							<div className="flex items-center gap-3">
								Changer de thème
								<Kbd>D</Kbd>
							</div>
						</TooltipContent>
					</Tooltip>

					<Link aria-label="Flux RSS" href="/api/rss" rel="noopener noreferrer" target="_blank">
						<Button shadow size="icon" variant="outline">
							<RssIcon className="relative after:absolute after:-inset-2" />
							<span className="sr-only">Flux RSS</span>
						</Button>
					</Link>

					<Link aria-label="Contexte essentiel - LLM" href="/llms.txt" rel="noopener noreferrer" target="_blank">
						<Button shadow size="icon" variant="outline">
							<LlmIcon className="relative after:absolute after:-inset-2" />
							<span className="sr-only">Contexte essentiel - LLM</span>
						</Button>
					</Link>

					<NavBarContent links={NAVIGATION_DATA} variant="mobile" />
				</div>
			</div>
		</NavBarWrapper>
	);
});
