'use client';

import { useTheme } from 'next-themes';
import posthog from 'posthog-js';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/ui/Button';
import { Kbd } from '@/components/ui/Kbd';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/Tooltip';
import useMetaColor from '@/hooks/use-meta-color';
import { soundManager } from '@/lib/sound-manager';
import { META_THEME_COLORS } from '@/lib/theme';
import { AnimatedMoonIcon } from '../../icons/AnimatedMoonIcon';
import { AnimatedSunIcon } from '../../icons/AnimatedSunIcon';

export const ToggleTheme = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const { setMetaColor } = useMetaColor();

	const switchTheme = useCallback(() => {
		const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
		soundManager.playThemeSound();
		setTheme(newTheme);
		setMetaColor(
			resolvedTheme === 'dark'
				? META_THEME_COLORS.light
				: META_THEME_COLORS.dark
		);

		posthog.capture('theme_changed', {
			from_theme: resolvedTheme,
			to_theme: newTheme,
		});
	}, [resolvedTheme, setTheme, setMetaColor]);

	const viewTransition = () => {
		if (!document.startViewTransition) {
			switchTheme();
		}
		document.startViewTransition(switchTheme);
	};

	useHotkeys('d', viewTransition);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
					onClick={viewTransition}
					size="icon"
					variant="outline"
				>
					<AnimatedMoonIcon className="relative hidden after:absolute after:-inset-2 [html.dark_&]:block" />
					<AnimatedSunIcon className="relative hidden after:absolute after:-inset-2 [html.light_&]:block" />
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
