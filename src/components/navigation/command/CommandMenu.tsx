'use client';

import { CodeBlockIcon, GearSixIcon, PenNibIcon } from '@phosphor-icons/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandMenuTrigger } from '@/components/navigation/command/CommandMenuTrigger';
import { CommandsOnTheme } from '@/components/navigation/command/cmd/CommandsOnTheme';
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandList,
	CommandSeparator,
} from '@/components/ui/Command';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/Dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerTitle,
} from '@/components/ui/Drawer';
import useMediaQuery from '@/hooks/use-media-query';
import { CommandLinkGroup } from './CommandLinkGroup';
import { CommandMenuFooter } from './CommandMenuFooter';
import {
	DOCUMENTS_LINKS,
	MAIN_LINKS,
	MENU_LINKS,
	SOCIAL_LINK_ITEMS,
} from './data/data';
import type { CommandLinkItem } from './types/types';
import { postToCommandLinkItem } from './utils/utils';

type CommandMenuProps = {
	posts: Post[];
};

export const CommandMenu = ({ posts = [] }: CommandMenuProps) => {
	const router = useRouter();
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.isContentEditable ||
				target.matches('input, textarea, select')
			) {
				return;
			}

			if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};

		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, []);

	const handleOpenLink = useCallback(
		(href: string, openInNewTab = false) => {
			setOpen(false);
			if (openInNewTab) {
				window.open(href, '_blank', 'noopener');
			} else {
				router.push(href);
			}
		},
		[router],
	);

	const { articlesLinks, componentLinks, utilsLinks } = useMemo(() => {
		const acc = {
			articlesLinks: [] as CommandLinkItem[],
			componentLinks: [] as CommandLinkItem[],
			utilsLinks: [] as CommandLinkItem[],
		};

		posts.forEach((post) => {
			const item = postToCommandLinkItem(post);
			const category = post.metadata?.category;

			if (category === 'article') {
				acc.articlesLinks.push(item);
			} else if (category === 'components') {
				acc.componentLinks.push(item);
			} else if (category === 'utils') {
				acc.utilsLinks.push(item);
			}
		});

		return acc;
	}, [posts]);

	if (!mounted) {
		return null;
	}

	const commandContent = (
		<>
			<CommandInput placeholder="Tapez une commande ou recherchez ..." />

			<CommandList className="min-h-[460px]">
				<CommandEmpty>Aucun résultat ...</CommandEmpty>

				<CommandLinkGroup
					heading="Menu principal :"
					links={MENU_LINKS}
					onLinkSelect={handleOpenLink}
				/>
				<CommandSeparator />

				<CommandLinkGroup
					heading="Contenu de mon portfolio :"
					links={MAIN_LINKS}
					onLinkSelect={handleOpenLink}
				/>
				<CommandSeparator />

				<CommandLinkGroup
					heading="Documents à télécharger :"
					links={DOCUMENTS_LINKS}
					onLinkSelect={handleOpenLink}
				/>
				<CommandSeparator />

				{articlesLinks.length > 0 && (
					<>
						<CommandLinkGroup
							fallbackIcon={PenNibIcon}
							heading="Derniers articles de blog :"
							links={articlesLinks}
							onLinkSelect={handleOpenLink}
						/>
						<CommandSeparator />
					</>
				)}

				{componentLinks.length > 0 && (
					<>
						<CommandLinkGroup
							fallbackIcon={CodeBlockIcon}
							heading="Derniers snippets de code :"
							links={componentLinks}
							onLinkSelect={handleOpenLink}
						/>
						<CommandSeparator />
					</>
				)}

				{utilsLinks.length > 0 && (
					<>
						<CommandLinkGroup
							fallbackIcon={GearSixIcon}
							heading="Derniers outils :"
							links={utilsLinks}
							onLinkSelect={handleOpenLink}
						/>
						<CommandSeparator />
					</>
				)}

				<CommandLinkGroup
					heading="Retrouvez-moi sur :"
					links={SOCIAL_LINK_ITEMS}
					onLinkSelect={handleOpenLink}
				/>
				<CommandSeparator />

				<CommandsOnTheme setOpen={setOpen} />
			</CommandList>

			<CommandMenuFooter posts={posts} />
		</>
	);

	if (isDesktop) {
		return (
			<>
				<CommandMenuTrigger setOpen={setOpen} />

				<Dialog onOpenChange={setOpen} open={open}>
					<VisuallyHidden>
						<DialogTitle>Palette de commandes</DialogTitle>
						<DialogDescription>
							Utilisez la barre de recherche ...
						</DialogDescription>
					</VisuallyHidden>

					<DialogContent
						className="overflow-hidden bg-popover p-0 backdrop-blur-lg supports-backdrop-filter:bg-popover/90 max-sm:top-16 max-sm:translate-y-0"
						data-slot="command-dialog-content"
						overlay={true}
					>
						<Command className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-1 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-10 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
							{commandContent}
						</Command>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	return (
		<>
			<CommandMenuTrigger setOpen={setOpen} />

			<Drawer onOpenChange={setOpen} open={open}>
				<VisuallyHidden>
					<DrawerTitle>Palette de commandes</DrawerTitle>
					<DrawerDescription>
						Utilisez la barre de recherche ...
					</DrawerDescription>
				</VisuallyHidden>

				<DrawerContent className="overflow-hidden bg-popover p-0 backdrop-blur-lg supports-backdrop-filter:bg-popover/90">
					<Command className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-1 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-10 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
						{commandContent}
					</Command>
				</DrawerContent>
			</Drawer>
		</>
	);
};
