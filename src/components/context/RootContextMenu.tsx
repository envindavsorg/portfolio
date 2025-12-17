'use client';

import {
	ArrowLeftIcon,
	ArrowsClockwiseIcon,
	MoonIcon,
	SunIcon,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useCallback } from 'react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/ContextMenu';
import { META_THEME_COLORS } from '@/config/site';
import useMetaColor from '@/hooks/use-meta-color';
import { soundManager } from '@/lib/sound-manager';

type RootContextMenuProps = {
	children: React.ReactNode;
};

export const RootContextMenu = ({ children }: RootContextMenuProps) => {
	const router = useRouter();
	const { resolvedTheme, setTheme } = useTheme();
	const { setMetaColor } = useMetaColor();

	const handleReload = useCallback((): void => {
		window.location.reload();
	}, []);

	const handleBack = useCallback((): void => {
		router.back();
	}, [router.back]);

	const handleTheme = useCallback(() => {
		soundManager.playThemeSound();
		setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
		setMetaColor(
			resolvedTheme === 'dark'
				? META_THEME_COLORS.light
				: META_THEME_COLORS.dark,
		);
	}, [resolvedTheme, setTheme, setMetaColor]);

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

			<ContextMenuContent className="w-64">
				<ContextMenuItem onClick={handleBack}>
					<ArrowLeftIcon className="size-5" />
					Retour
				</ContextMenuItem>

				<ContextMenuItem onClick={handleReload}>
					<ArrowsClockwiseIcon className="size-5" />
					Recharger la page
				</ContextMenuItem>

				<ContextMenuSeparator />

				<ContextMenuItem
					onClick={() => {
						if (!document.startViewTransition) {
							handleTheme();
						}

						document.startViewTransition(handleTheme);
					}}
				>
					<SunIcon className="hidden size-5 [html.dark_&]:block" />
					<MoonIcon className="hidden size-5 [html.light_&]:block" />
					{resolvedTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
