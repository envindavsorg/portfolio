'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { CommandFooter } from './CommandFooter';
import { CommandLinkGroup } from './CommandLinkGroup';
import { CommandTrigger } from './CommandTrigger';
import { DOCUMENTS_LINKS, MAIN_LINKS, MENU_LINKS } from './data';

export const postToCommandLinkItem = (post: Post): CommandLinkItem => {
	const category = post.metadata?.category ?? 'article';

	const categoryToRoute: Record<string, string> = {
		components: 'components',
		utils: 'utils',
		article: 'blog',
	};

	return {
		title: post.metadata.title,
		url: `/${categoryToRoute[category] ?? 'blog'}/${post.slug}`,
		keywords: category === 'article' ? undefined : [category],
	};
};

interface CommandContentProps {
	posts: Post[];
}

export const CommandContent = ({
	posts = [],
}: CommandContentProps): React.JSX.Element | null => {
	const router = useRouter();
	const pathname = usePathname();
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (
				target.isContentEditable ||
				target.matches('input, textarea, select')
			) {
				return;
			}

			if (
				(event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
				event.key === '/'
			) {
				event.preventDefault();
				setOpen((prev) => !prev);
			}
		};

		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, []);

	const { articlesLinks, componentLinks, utilsLinks } = useMemo(() => {
		const acc = {
			articlesLinks: [] as CommandLinkItem[],
			componentLinks: [] as CommandLinkItem[],
			utilsLinks: [] as CommandLinkItem[],
		};

		for (const post of posts) {
			const item = postToCommandLinkItem(post);
			const category = post.metadata?.category;

			if (category === 'article') {
				acc.articlesLinks.push(item);
			} else if (category === 'components') {
				acc.componentLinks.push(item);
			} else if (category === 'utils') {
				acc.utilsLinks.push(item);
			}
		}

		return acc;
	}, [posts]);

	const filteredMenuLinks = useMemo(() => {
		if (pathname === '/') {
			return MENU_LINKS.filter((link) => link.url !== '/');
		}

		return MENU_LINKS;
	}, [pathname]);

	const handleOpenLink = useCallback(
		(href: string, openInNewTab = false) => {
			setOpen(false);
			if (openInNewTab) {
				window.open(href, '_blank', 'noopener');
				return;
			}

			if (href.startsWith('/#')) {
				const hash = href.slice(1);

				if (pathname !== '/') {
					window.location.href = href;
					return;
				}

				const element = document.querySelector(hash);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' });
					window.history.pushState(null, '', hash);
				}
				return;
			}

			router.push(href);
		},
		[router, pathname]
	);

	const commandContent = (
		<>
			<CommandInput placeholder="Tapez une commande ou recherchez ..." />

			<CommandList className="min-h-[460px]">
				<CommandEmpty>Aucun résultat ...</CommandEmpty>

				<CommandLinkGroup
					heading="Menu principal :"
					links={filteredMenuLinks}
					onLinkSelect={handleOpenLink}
				/>

				<CommandSeparator className="my-2" />

				<CommandLinkGroup
					heading="Contenu de mon portfolio :"
					links={MAIN_LINKS}
					onLinkSelect={handleOpenLink}
				/>

				<CommandSeparator className="my-2" />

				<CommandLinkGroup
					heading="Documents à télécharger :"
					links={DOCUMENTS_LINKS}
					onLinkSelect={handleOpenLink}
				/>

				<CommandSeparator className="my-2" />

				{articlesLinks.length > 0 && (
					<CommandLinkGroup
						heading="Derniers articles de blog :"
						links={articlesLinks}
						onLinkSelect={handleOpenLink}
					/>
				)}

				<CommandSeparator className="my-2" />

				{componentLinks.length > 0 && (
					<CommandLinkGroup
						heading="Derniers snippets de code :"
						links={componentLinks}
						onLinkSelect={handleOpenLink}
					/>
				)}

				<CommandSeparator className="my-2" />

				{utilsLinks.length > 0 && (
					<CommandLinkGroup
						heading="Derniers outils :"
						links={utilsLinks}
						onLinkSelect={handleOpenLink}
					/>
				)}
			</CommandList>

			<CommandFooter posts={posts} />
		</>
	);

	if (isDesktop) {
		return (
			<>
				<CommandTrigger setOpenAction={setOpen} />

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
			<CommandTrigger setOpenAction={setOpen} />

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
