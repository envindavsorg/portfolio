'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import posthog from 'posthog-js';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/Button';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LlmIcon } from '@/components/icons/LlmIcon';
import { MoonIcon } from '@/components/icons/MoonIcon';
import { RssIcon } from '@/components/icons/RssIcon';
import { SunIcon } from '@/components/icons/SunIcon';
import { Kbd } from '@/components/ui/Kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import useMetaColor from '@/hooks/use-meta-color';
import { soundManager } from '@/lib/sound-manager';
import { META_THEME_COLORS } from '@/lib/theme';
import { USER } from '@/lib/user';

export const NavBarLinksGitHub = (): React.JSX.Element => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Link aria-label="Mon profil GitHub" href={USER.social.github} rel="noopener" target="_blank">
				<GitHubIcon ref={iconRef} />
				<span className="sr-only">Mon profil GitHub</span>
			</Link>
		</Button>
	);
};

export const NavBarLinksRSS = (): React.JSX.Element => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Link aria-label="Flux RSS" href="/api/rss" rel="noopener noreferrer" target="_blank">
				<RssIcon ref={iconRef} />
				<span className="sr-only">Flux RSS</span>
			</Link>
		</Button>
	);
};

export const NavBarLinksLLM = (): React.JSX.Element => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Link aria-label="Contexte essentiel" href="/llms.txt" rel="noopener noreferrer" target="_blank">
				<LlmIcon ref={iconRef} />
				<span className="sr-only">Contexte essentiel</span>
			</Link>
		</Button>
	);
};

export const NavBarLinksTheme = (): React.JSX.Element => {
	const { resolvedTheme, setTheme } = useTheme();
	const { setMetaColor } = useMetaColor();

	const sunIconRef = useRef<AnimatedIconHandle>(null);
	const moonIconRef = useRef<AnimatedIconHandle>(null);

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
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					onClick={viewTransition}
					onMouseEnter={() => {
						sunIconRef.current?.startAnimation();
						moonIconRef.current?.startAnimation();
					}}
					onMouseLeave={() => {
						sunIconRef.current?.stopAnimation();
						moonIconRef.current?.stopAnimation();
					}}
					size="icon"
					variant="outline"
				>
					<MoonIcon className="hidden [html.dark_&]:block" ref={moonIconRef} />
					<SunIcon className="hidden [html.light_&]:block" ref={sunIconRef} />
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
	);
};
