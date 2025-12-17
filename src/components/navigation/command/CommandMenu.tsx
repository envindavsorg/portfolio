'use client';

import { CodeBlockIcon, GearSixIcon, PenNibIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandMenuTrigger } from '@/components/navigation/command/CommandMenuTrigger';
import { CommandsOnTheme } from '@/components/navigation/command/cmd/CommandsOnTheme';
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandList,
	CommandSeparator,
} from '@/components/ui/Command';
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

	return (
		<>
			<CommandMenuTrigger setOpen={setOpen} />

			<CommandDialog onOpenChange={setOpen} open={open}>
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
			</CommandDialog>
		</>
	);
};
