'use client';

import {
	BriefcaseIcon,
	CircleHalfTiltIcon,
	CodeBlockIcon,
	CommandIcon,
	CubeIcon,
	GearSixIcon,
	HouseIcon,
	IdentificationCardIcon,
	MagnifyingGlassIcon,
	MoonIcon,
	PenNibIcon,
	StackIcon,
	SunIcon,
	UserSoundIcon,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/Command';
import { cn } from '@/lib/utils';
import { CommandLinkGroup } from './CommandLinkGroup';
import { CommandMenuFooter } from './CommandMenuFooter';
import { CommandMenuKbd } from './CommandMenuKbd';
import { SOCIAL_LINK_ITEMS } from './data/data';
import type { CommandLinkItem } from './types/types';

const MENU_LINKS: CommandLinkItem[] = [
	{
		title: "Retourner à l'accueil",
		href: '/',
		icon: HouseIcon,
	},
	{
		title: 'Mes articles de blog',
		href: '/blog',
		icon: PenNibIcon,
	},
	{
		title: 'Mes snippets de code réutilisables',
		href: '/components',
		icon: CodeBlockIcon,
	},
	{
		title: 'Outils pour développeurs',
		href: '/utils',
		icon: GearSixIcon,
	},
];

export const MAIN_LINKS: CommandLinkItem[] = [
	{
		title: 'À propos de moi',
		href: '/#about',
		icon: UserSoundIcon,
	},
	{
		title: 'Ma stack technique',
		href: '/#stack',
		icon: StackIcon,
	},
	{
		title: 'Expériences professionnelles',
		href: '/#experience',
		icon: BriefcaseIcon,
	},
	{
		title: 'Mes projets',
		href: '/#projects',
		icon: CubeIcon,
	},
];

const postToCommandLinkItem = (post: Post): CommandLinkItem => {
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

type CommandMenuProps = {
	posts: Post[];
};

export const CommandMenu = ({ posts }: CommandMenuProps) => {
	const router = useRouter();

	const { setTheme } = useTheme();

	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const abortController = new AbortController();
		const { signal } = abortController;

		document.addEventListener(
			'keydown',
			(e: KeyboardEvent) => {
				if (
					(e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
					e.key === '/'
				) {
					if (
						(e.target instanceof HTMLElement &&
							e.target.isContentEditable) ||
						e.target instanceof HTMLInputElement ||
						e.target instanceof HTMLTextAreaElement ||
						e.target instanceof HTMLSelectElement
					) {
						return;
					}

					e.preventDefault();
					setOpen((open) => !open);
				}
			},
			{ signal },
		);

		return () => abortController.abort();
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

	const handleThemeChange = useCallback(
		(theme: 'light' | 'dark' | 'system') => {
			setOpen(false);
			setTheme(theme);
		},
		[setTheme],
	);

	const { articlesLinks, componentLinks, utilsLinks } = useMemo(
		() => ({
			articlesLinks: posts
				.filter((post) => post.metadata?.category === 'article')
				.map(postToCommandLinkItem),
			componentLinks: posts
				.filter((post) => post.metadata?.category === 'components')
				.map(postToCommandLinkItem),
			utilsLinks: posts
				.filter((post) => post.metadata?.category === 'utils')
				.map(postToCommandLinkItem),
		}),
		[posts],
	);

	return (
		<>
			<Button
				className={cn(
					'h-8 select-none gap-1.5 rounded-full px-2.5',
					'border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0',
				)}
				onClick={() => setOpen(true)}
				variant="outline"
			>
				<MagnifyingGlassIcon />

				<span className="font-medium font-sans text-xs/4 sm:hidden">
					Rechercher
				</span>

				<CommandMenuKbd className="hidden sm:in-[.os-macos_&]:flex">
					<div className="flex items-center gap-x-0.5 tracking-wide">
						<CommandIcon className="size-3" />K
					</div>
				</CommandMenuKbd>
				<CommandMenuKbd className="hidden tracking-wide sm:not-[.os-macos_&]:flex">
					ctrl + K
				</CommandMenuKbd>
			</Button>

			{mounted && (
				<CommandDialog onOpenChange={setOpen} open={open}>
					<CommandInput placeholder="Tapez une commande ou recherchez ..." />

					<CommandList className="min-h-115">
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
							heading="Carte de visite :"
							links={[
								{
									title: 'Télécharger ma carte de visite',
									href: '/vcard',
									icon: IdentificationCardIcon,
								},
							]}
							onLinkSelect={handleOpenLink}
						/>

						<CommandSeparator />

						<CommandLinkGroup
							fallbackIcon={PenNibIcon}
							heading="Derniers articles de blog :"
							links={articlesLinks}
							onLinkSelect={handleOpenLink}
						/>

						<CommandSeparator />

						<CommandLinkGroup
							fallbackIcon={CodeBlockIcon}
							heading="Derniers snippets de code :"
							links={componentLinks}
							onLinkSelect={handleOpenLink}
						/>

						<CommandSeparator />

						<CommandLinkGroup
							fallbackIcon={GearSixIcon}
							heading="Derniers outils :"
							links={utilsLinks}
							onLinkSelect={handleOpenLink}
						/>

						<CommandSeparator />

						<CommandLinkGroup
							heading="Retrouvez-moi sur :"
							links={SOCIAL_LINK_ITEMS}
							onLinkSelect={handleOpenLink}
						/>

						<CommandSeparator />

						<CommandGroup heading="Thème de l'interface :">
							<CommandItem
								keywords={['theme']}
								onSelect={() => handleThemeChange('light')}
							>
								<SunIcon className="size-4 text-yellow-600 dark:text-yellow-300" />
								Mode clair
							</CommandItem>
							<CommandItem
								keywords={['theme']}
								onSelect={() => handleThemeChange('dark')}
							>
								<MoonIcon className="size-4 text-blue-600 dark:text-blue-300" />
								Mode sombre
							</CommandItem>
							<CommandItem
								keywords={['theme']}
								onSelect={() => handleThemeChange('system')}
							>
								<CircleHalfTiltIcon className="size-4 text-foreground" />
								Thème automatique
							</CommandItem>
						</CommandGroup>
					</CommandList>

					<CommandMenuFooter posts={posts} />
				</CommandDialog>
			)}
		</>
	);
};
