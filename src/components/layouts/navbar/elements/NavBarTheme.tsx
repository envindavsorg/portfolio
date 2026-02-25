'use client';

import { useTheme } from 'next-themes';
import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { MoonIcon } from '@/components/blocks/icons/MoonIcon';
import { SunIcon } from '@/components/blocks/icons/SunIcon';
import { Button } from '@/components/primitives/Button';
import { META_THEME_COLORS } from '@/data/theme';
import useMetaColor from '@/hooks/useMetaColor';
import { soundManager } from '@/lib/sound-manager';

export const NavBarTheme = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const { setMetaColor } = useMetaColor();

	const sunIconRef = useRef<AnimatedIconHandle>(null);
	const moonIconRef = useRef<AnimatedIconHandle>(null);

	const switchTheme = () => {
		const isDark = resolvedTheme === 'dark';
		soundManager.playThemeSound();
		setTheme(isDark ? 'light' : 'dark');
		setMetaColor(isDark ? META_THEME_COLORS.light : META_THEME_COLORS.dark);
	};

	const handleClick = () => {
		document.startViewTransition
			? document.startViewTransition(switchTheme)
			: switchTheme();
	};

	const handleMouseEnter = () => {
		sunIconRef.current?.startAnimation();
		moonIconRef.current?.startAnimation();
	};

	const handleMouseLeave = () => {
		sunIconRef.current?.stopAnimation();
		moonIconRef.current?.stopAnimation();
	};

	useHotkeys('d', handleClick);

	return (
		<Button
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			size="icon"
			variant="outline"
		>
			<MoonIcon className="hidden [html.dark_&]:block" ref={moonIconRef} />
			<SunIcon className="hidden [html.light_&]:block" ref={sunIconRef} />
			<span className="sr-only">Changer de thème</span>
		</Button>
	);
};
