'use client';

import { DownloadIcon, FilePngIcon, FileSvgIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import type React from 'react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/ContextMenu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { GREETINGS_CONFIG } from './constants/constants';

type GreetingsContextProps = {
	children: React.ReactNode;
};

export const Context = ({
	children,
}: GreetingsContextProps): React.JSX.Element => {
	const { resolvedTheme } = useTheme();

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent>
				<Tabs defaultValue="french">
					<TabsList>
						{GREETINGS_CONFIG.map(({ id, flag: Flag }) => (
							<TabsTrigger key={id} value={id}>
								<Flag />
							</TabsTrigger>
						))}
					</TabsList>

					{GREETINGS_CONFIG.map(({ id, asset, label }) => (
						<TabsContent key={id} value={id}>
							<ContextMenuItem
								onClick={() => {
									const link = document.createElement('a');
									link.href = `/assets/${asset}/svg/${asset}-${resolvedTheme}.svg`;
									link.download = `${asset}-${resolvedTheme}.svg`;
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
								}}
							>
								<FileSvgIcon className="size-5" />
								<p className="text-sm">
									Télécharger au format SVG
								</p>
							</ContextMenuItem>
							<ContextMenuItem asChild className="cursor-pointer">
								<Link
									aria-label={label}
									download
									href={`/assets/${asset}/png/${asset}-${resolvedTheme}.png`}
								>
									<FilePngIcon className="size-5" />
									<p className="text-sm">
										Télécharger au format PNG
									</p>
								</Link>
							</ContextMenuItem>
						</TabsContent>
					))}
				</Tabs>

				<ContextMenuSeparator />

				<ContextMenuItem asChild className="cursor-pointer">
					<Link download href="/assets/all-effects.zip">
						<DownloadIcon className="size-5" />
						Télécharger tous les assets
					</Link>
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
};
