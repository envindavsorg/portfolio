'use client';

import {
	ArrowElbowDownLeftIcon,
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
	type Icon as PhosphorIcon,
	StackIcon,
	SunIcon,
	UserSoundIcon,
} from '@phosphor-icons/react';
import { useCommandState } from 'cmdk';
import Image, { type StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Separator } from '@/components/ui/Separator';
import { CuzeacFlorinMark } from '@/features/assets/CuzeacFlorinMark';
import { SOCIAL_LINKS } from '@/features/root/contact/data/social-links';
import { cn } from '@/lib/utils';

type CommandLinkItem = {
	title: string;
	href: string;
	icon?: PhosphorIcon;
	iconImage?: string | StaticImageData;
	keywords?: string[];
	openInNewTab?: boolean;
};

const MENU_LINKS: CommandLinkItem[] = [
	{
		title: "Returner à l'accueil",
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
];

const MAIN_LINKS: CommandLinkItem[] = [
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
	{
		title: 'Ma carte de visite',
		href: '/vcard',
		icon: IdentificationCardIcon,
	},
];

const SOCIAL_LINK_ITEMS: CommandLinkItem[] = SOCIAL_LINKS.map((item) => ({
	title: item.title,
	href: item.href,
	iconImage: item.icon,
	openInNewTab: true,
}));

type CommandLinkGroupProps = {
	heading: string;
	links: CommandLinkItem[];
	fallbackIcon?: PhosphorIcon;
	onLinkSelect: (href: string, openInNewTab?: boolean) => void;
};

const CommandLinkGroup = ({
	heading,
	links,
	fallbackIcon,
	onLinkSelect,
}: CommandLinkGroupProps) => (
	<CommandGroup heading={heading}>
		{links.map((link: CommandLinkItem, idx: number) => {
			const Icon = link?.icon ?? fallbackIcon ?? React.Fragment;

			return (
				<CommandItem
					key={link.href}
					keywords={link.keywords}
					onSelect={() => onLinkSelect(link.href, link.openInNewTab)}
				>
					{link?.iconImage ? (
						<Image
							alt={link.title}
							className="rounded-sm"
							height={22}
							src={link.iconImage}
							unoptimized
							width={22}
						/>
					) : (
						<Icon className="size-4 text-foreground" />
					)}
					{link.title}{' '}
					{heading === 'Menu principal :' && (
						<sup className="font-semibold text-theme">
							0{idx + 1}
						</sup>
					)}
				</CommandItem>
			);
		})}
	</CommandGroup>
);

type CommandKind = 'command' | 'page' | 'link';

type CommandMetaMap = Map<
	string,
	{
		commandKind: CommandKind;
	}
>;

const buildCommandMetaMap = () => {
	const commandMetaMap: CommandMetaMap = new Map();

	commandMetaMap.set('Download vCard', { commandKind: 'command' });

	commandMetaMap.set('Light', { commandKind: 'command' });
	commandMetaMap.set('Dark', { commandKind: 'command' });
	commandMetaMap.set('Auto', { commandKind: 'command' });

	commandMetaMap.set('Copy Mark as SVG', {
		commandKind: 'command',
	});
	commandMetaMap.set('Copy Logotype as SVG', {
		commandKind: 'command',
	});
	commandMetaMap.set('Download Brand Assets', {
		commandKind: 'command',
	});

	for (const item of SOCIAL_LINK_ITEMS) {
		commandMetaMap.set(item.title, {
			commandKind: 'link',
		});
	}

	return commandMetaMap;
};

const COMMAND_META_MAP = buildCommandMetaMap();

const ENTER_ACTION_LABELS: Record<CommandKind, string> = {
	command: 'Lancer la commande',
	page: 'Aller à la page',
	link: 'Ouvrir le lien',
};

const CommandMenuFooter = () => {
	const selectedCommandKind = useCommandState(
		(state) => COMMAND_META_MAP.get(state.value)?.commandKind ?? 'page',
	);

	return (
		<>
			<div className="flex h-10" />

			<div className="absolute inset-x-0 bottom-0 flex h-10 items-center justify-between gap-2 border-t bg-zinc-100/30 px-4 font-medium text-xs dark:bg-zinc-800/30">
				<CuzeacFlorinMark height={16} width={29} />

				<div className="flex shrink-0 items-center gap-2">
					<span>{ENTER_ACTION_LABELS[selectedCommandKind]}</span>
					<CommandMenuKbd>
						<ArrowElbowDownLeftIcon className="size-3" />
					</CommandMenuKbd>
					<Separator
						className="data-[orientation=vertical]:h-4"
						orientation="vertical"
					/>
					<span>Fermer</span>
					<CommandMenuKbd className="font-medium text-xs">
						esc
					</CommandMenuKbd>
				</div>
			</div>
		</>
	);
};

const CommandMenuKbd = ({
	className,
	...props
}: React.ComponentProps<'kbd'>) => (
	<kbd
		className={cn(
			"pointer-events-none flex h-5 min-w-6 select-none items-center justify-center gap-1 rounded-sm bg-black/5 px-1 font-normal font-sans text-[13px] text-foreground shadow-[inset_0_-1px_2px] shadow-black/10 dark:bg-white/10 dark:text-shadow-xs dark:shadow-white/10 [&_svg:not([class*='size-'])]:size-3",
			className,
		)}
		{...props}
	/>
);

const postToCommandLinkItem = (post: Post): CommandLinkItem => {
	const isComponent = post.metadata?.category === 'components';

	return {
		title: post.metadata.title,
		href: isComponent ? `/components/${post.slug}` : `/blog/${post.slug}`,
		keywords: isComponent ? ['component'] : undefined,
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

					<CommandList className="min-h-80">
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
								<SunIcon className="size-4 text-foreground" />
								Mode clair
							</CommandItem>
							<CommandItem
								keywords={['theme']}
								onSelect={() => handleThemeChange('dark')}
							>
								<MoonIcon className="size-4 text-foreground" />
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

					<CommandMenuFooter />
				</CommandDialog>
			)}
		</>
	);
};
