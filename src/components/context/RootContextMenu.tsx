'use client';

import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { ArrowLeftIcon, type ArrowLeftIconHandle } from '@/components/icons/animated/ArrowLeftIcon';
import { RefreshIcon } from '@/components/icons/animated/RefreshIcon';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/components/ui/ContextMenu';
import useMetaColor from '@/hooks/use-meta-color';
import { soundManager } from '@/lib/sound-manager';
import { META_THEME_COLORS } from '@/lib/theme';

interface RootContextMenuProps {
	children: React.ReactNode;
}

export const RootContextMenu = ({ children }: RootContextMenuProps): React.JSX.Element => {
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
		setMetaColor(resolvedTheme === 'dark' ? META_THEME_COLORS.light : META_THEME_COLORS.dark);
	}, [resolvedTheme, setTheme, setMetaColor]);

	const arrowIconRef = useRef<ArrowLeftIconHandle>(null);
	const refreshIconRef = useRef<ArrowLeftIconHandle>(null);

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

			<ContextMenuContent>
				<ContextMenuItem
					onClick={handleBack}
					onMouseEnter={() => arrowIconRef.current?.startAnimation?.()}
					onMouseLeave={() => arrowIconRef.current?.stopAnimation?.()}
				>
					<ArrowLeftIcon
						className="relative after:absolute after:-inset-2"
						ref={arrowIconRef}
						size={16}
					/>
					Retour
				</ContextMenuItem>

				<ContextMenuItem
					onClick={handleReload}
					onMouseEnter={() => refreshIconRef.current?.startAnimation?.()}
					onMouseLeave={() => refreshIconRef.current?.stopAnimation?.()}
				>
					<RefreshIcon
						className="relative after:absolute after:-inset-2"
						ref={refreshIconRef}
						size={16}
					/>
					Recharger la page
				</ContextMenuItem>

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
