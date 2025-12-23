'use client';

import {
	ArrowElbowDownLeftIcon,
	CodeBlockIcon,
	GearSixIcon,
	PenNibIcon,
} from '@phosphor-icons/react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/dist/lib/types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useCommandState } from 'cmdk';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AnimatedSearchIcon } from '@/components/icons/AnimatedSearchIcon';
import { Button } from '@/components/ui/Button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
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
import { Kbd } from '@/components/ui/Kbd';
import { Separator } from '@/components/ui/Separator';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/Tooltip';
import useMediaQuery from '@/hooks/use-media-query';
import {
	DOCUMENTS_LINKS,
	MAIN_LINKS,
	MENU_LINKS,
	SOCIAL_LINK_ITEMS,
	THEME_OPTIONS,
} from './data';

interface ToggleSearchLinkGroupProps {
	heading: string;
	links: CommandLinkItem[];
	fallbackIcon?: PhosphorIcon;
	onLinkSelect: (href: string, openInNewTab?: boolean) => void;
}

const ToggleSearchLinkGroup = memo(
	({
		heading,
		links,
		fallbackIcon: FallbackIcon,
		onLinkSelect,
	}: ToggleSearchLinkGroupProps): React.JSX.Element | null => {
		if (!links || links.length === 0) {
			return null;
		}

		return (
			<CommandGroup heading={heading}>
				{links.map((link) => {
					const LinkIcon = link.icon ?? FallbackIcon;

					return (
						<CommandItem
							key={link.href}
							keywords={link.keywords}
							onSelect={() => onLinkSelect(link.href, link.openInNewTab)}
							value={link.title}
						>
							{link.iconImage ? (
								<Image
									alt={link.title}
									className="rounded-md"
									height={22}
									src={link.iconImage}
									unoptimized
									width={22}
								/>
							) : (
								LinkIcon && <LinkIcon className="size-4 text-theme" />
							)}

							<span className="ml-1">{link.title}</span>
						</CommandItem>
					);
				})}
			</CommandGroup>
		);
	}
);

interface ToggleSearchTriggerProps {
	setOpenAction: (open: boolean) => void;
}

export const ToggleSearchTrigger = ({
	setOpenAction,
}: ToggleSearchTriggerProps): React.JSX.Element => {
	useHotkeys('k', () => setOpenAction(true));

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
					onClick={() => setOpenAction(true)}
					size="icon"
					variant="outline"
				>
					<AnimatedSearchIcon className="relative after:absolute after:-inset-2" />
					<span className="sr-only">Rechercher</span>
				</Button>
			</TooltipTrigger>

			<TooltipContent className="pr-2 pl-3">
				<div className="flex items-center gap-3">
					Rechercher
					<Kbd>K</Kbd>
				</div>
			</TooltipContent>
		</Tooltip>
	);
};

const ENTER_ACTION_LABELS: Record<CommandKind, string> = {
	command: 'Lancer la commande',
	page: 'Aller à la page',
	link: 'Ouvrir le lien',
	utils: "Ouvrir l'outil",
	article: "Lire l'article",
	components: 'Voir le composant',
	section: 'Aller à la section',
	download: 'Télécharger le fichier',
};

const buildCommandMetaMap = (posts: Post[]): CommandMetaMap => {
	const commandMetaMap: CommandMetaMap = new Map();

	for (const item of DOCUMENTS_LINKS) {
		commandMetaMap.set(item.title, {
			commandKind: 'download',
		});
	}

	for (const item of MAIN_LINKS) {
		commandMetaMap.set(item.title, {
			commandKind: 'section',
		});
	}

	for (const item of SOCIAL_LINK_ITEMS) {
		commandMetaMap.set(item.title, {
			commandKind: 'link',
		});
	}

	for (const post of posts) {
		commandMetaMap.set(post.metadata.title, {
			commandKind: post.metadata.category as CommandKind,
		});
	}

	for (const item of THEME_OPTIONS) {
		commandMetaMap.set(item.label, {
			commandKind: 'command',
		});
	}

	return commandMetaMap;
};

interface ToggleSearchFooterProps {
	posts: Post[];
}

const ToggleSearchFooter = ({
	posts,
}: ToggleSearchFooterProps): React.JSX.Element => {
	const commandMetaMap = useMemo(() => buildCommandMetaMap(posts), [posts]);

	const selectedCommandKind = useCommandState(
		(state) => commandMetaMap.get(state.value)?.commandKind ?? 'page'
	);

	return (
		<>
			<div className="flex h-10" />

			<div className="absolute inset-x-0 bottom-0 flex h-10 shrink-0 items-center justify-end gap-2 border-t bg-zinc-100/30 px-4 font-medium text-xs dark:bg-zinc-800/30">
				<span>{ENTER_ACTION_LABELS[selectedCommandKind]}</span>
				<Kbd>
					<ArrowElbowDownLeftIcon className="size-3" />
				</Kbd>
				<Separator
					className="data-[orientation=vertical]:h-4"
					orientation="vertical"
				/>
				<span>Fermer</span>
				<Kbd className="font-medium text-destructive text-xs">esc</Kbd>
			</div>
		</>
	);
};

export const postToCommandLinkItem = (post: Post): CommandLinkItem => {
	const category = post.metadata?.category ?? 'article';

	const categoryToRoute: Record<string, string> = {
		components: 'components',
		utils: 'utils',
		article: 'blog',
	};

	return {
		title: post.metadata.title,
		href: `/${categoryToRoute[category] ?? 'blog'}/${post.slug}`,
		keywords: category === 'article' ? undefined : [category],
	};
};

interface ToggleSearchProps {
	posts: Post[];
}

export const ToggleSearch = ({
	posts = [],
}: ToggleSearchProps): React.JSX.Element | null => {
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
		[router]
	);

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

	if (!mounted) {
		return null;
	}

	const commandContent = (
		<>
			<CommandInput placeholder="Tapez une commande ou recherchez ..." />

			<CommandList className="min-h-[460px]">
				<CommandEmpty>Aucun résultat ...</CommandEmpty>

				<ToggleSearchLinkGroup
					heading="Menu principal :"
					links={MENU_LINKS}
					onLinkSelect={handleOpenLink}
				/>
				<CommandSeparator />

				<ToggleSearchLinkGroup
					heading="Contenu de mon portfolio :"
					links={MAIN_LINKS}
					onLinkSelect={handleOpenLink}
				/>
				<CommandSeparator />

				<ToggleSearchLinkGroup
					heading="Documents à télécharger :"
					links={DOCUMENTS_LINKS}
					onLinkSelect={handleOpenLink}
				/>
				<CommandSeparator />

				{articlesLinks.length > 0 && (
					<>
						<ToggleSearchLinkGroup
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
						<ToggleSearchLinkGroup
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
						<ToggleSearchLinkGroup
							fallbackIcon={GearSixIcon}
							heading="Derniers outils :"
							links={utilsLinks}
							onLinkSelect={handleOpenLink}
						/>
						<CommandSeparator />
					</>
				)}

				<ToggleSearchLinkGroup
					heading="Retrouvez-moi sur :"
					links={SOCIAL_LINK_ITEMS}
					onLinkSelect={handleOpenLink}
				/>
			</CommandList>

			<ToggleSearchFooter posts={posts} />
		</>
	);

	if (isDesktop) {
		return (
			<>
				<ToggleSearchTrigger setOpenAction={setOpen} />

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
			<ToggleSearchTrigger setOpenAction={setOpen} />

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
