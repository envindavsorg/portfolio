'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useCommandState } from 'cmdk';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type React from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button } from '@/components/buttons/Button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/Command';
import { BookIcon } from '@/components/icons/BookIcon';
import { CodeIcon } from '@/components/icons/CodeIcon';
import { CogIcon } from '@/components/icons/CogIcon';
import { CpuIcon } from '@/components/icons/CpuIcon';
import { FileIcon } from '@/components/icons/FileIcon';
import { FlaskIcon } from '@/components/icons/FlaskIcon';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { HomeIcon } from '@/components/icons/HomeIcon';
import { IdCardIcon } from '@/components/icons/IdCardIcon';
import { LayersIcon } from '@/components/icons/LayersIcon';
import { LlmIcon } from '@/components/icons/LlmIcon';
import { MoonIcon } from '@/components/icons/MoonIcon';
import { RssIcon } from '@/components/icons/RssIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { SunIcon } from '@/components/icons/SunIcon';
import { UserIcon } from '@/components/icons/UserIcon';
import { Kbd, KbdGroup } from '@/components/Kbd';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/Drawer';
import { Separator } from '@/components/ui/Separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import GLOBAL_DATA from '@/content/data/global';
import { META_THEME_COLORS } from '@/content/data/theme';
import useMediaQuery from '@/hooks/use-media-query';
import useMetaColor from '@/hooks/use-meta-color';
import { soundManager } from '@/lib/sound-manager';
import { cn } from '@/lib/utils';

type CommandKind = 'command' | 'page' | 'utils' | 'article' | 'components' | 'section' | 'download';

interface CommandLinkItem {
	title: string;
	url: string;
	icon?: React.ElementType;
	keywords?: string[];
	openInNewTab?: boolean;
	kind?: CommandKind;
}

interface CommandGroupProps {
	heading: string;
	items: CommandLinkItem[];
}

const COMMAND_GROUPS: CommandGroupProps[] = [
	{
		heading: 'Menu principal :',
		items: [
			{ title: "Retourner à l'accueil", url: '/', icon: HomeIcon, kind: 'page' },
			{ title: 'Mes articles de blog', url: '/blog', icon: BookIcon, kind: 'page' },
			{ title: 'Composants réutilisables', url: '/components', icon: CodeIcon, kind: 'page' },
			{ title: 'Outils pour développeurs', url: '/utils', icon: CogIcon, kind: 'page' },
		],
	},
	{
		heading: 'Contenu de mon portfolio :',
		items: [
			{ title: 'À propos de moi', url: '/#about-me', icon: UserIcon, kind: 'section' },
			{ title: 'Ma stack technique', url: '/#my-stack', icon: LayersIcon, kind: 'section' },
			{ title: 'Mes expériences', url: '/#my-experiences', icon: FlaskIcon, kind: 'section' },
			{ title: 'Mes projets', url: '/#my-projects', icon: CpuIcon, kind: 'section' },
		],
	},
	{
		heading: 'Documents à télécharger :',
		items: [
			{ title: 'Ma carte de visite', url: '/api/vcard', icon: IdCardIcon, kind: 'download' },
			{ title: 'Télécharger mon CV', url: GLOBAL_DATA.CV.url, icon: FileIcon, kind: 'download' },
		],
	},
];

const KIND_LABELS: Record<CommandKind, string> = {
	command: 'Lancer la commande',
	page: 'Aller à la page',
	utils: 'Utiliser cet outil',
	article: "Lire l'article",
	components: 'Voir le composant',
	section: 'Aller à la section',
	download: 'Télécharger le fichier',
};

const CATEGORY_CONFIG: Record<string, { route: string; heading: string; kind: CommandKind }> = {
	article: { route: 'blog', heading: 'Derniers articles de blog :', kind: 'article' },
	components: { route: 'components', heading: 'Derniers snippets de code :', kind: 'components' },
	utils: { route: 'utils', heading: 'Derniers outils :', kind: 'utils' },
};

interface FooterProps {
	kindMap: Map<string, CommandKind>;
}

const Footer = memo(({ kindMap }: FooterProps) => {
	const kind = useCommandState((state) => kindMap.get(state.value) ?? 'page');

	return (
		<>
			<div className="h-12 w-full" />

			<div className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-end gap-x-4 border-input border-t px-4">
				<KbdGroup>
					<span className="text-foreground text-xs">{KIND_LABELS[kind]}</span>
					<Kbd>↵</Kbd>
				</KbdGroup>
				<Separator className="data-[orientation=vertical]:h-4" orientation="vertical" />
				<KbdGroup>
					<span className="text-destructive text-xs">Fermer</span>
					<Kbd>␛</Kbd>
				</KbdGroup>
			</div>
		</>
	);
});

interface RowProps {
	item: CommandLinkItem;
	index: number;
	onSelect: (url: string, newTab?: boolean) => void;
}

const Row = memo(({ item, index, onSelect }: RowProps) => {
	const iconRef = useRef<AnimatedIconHandle>(null);
	const Icon = item.icon;

	return (
		<CommandItem
			keywords={item.keywords}
			onMouseEnter={() => iconRef.current?.startAnimation?.()}
			onMouseLeave={() => iconRef.current?.stopAnimation?.()}
			onSelect={() => onSelect(item.url, item.openInNewTab)}
			value={item.title}
		>
			{Icon ? <Icon ref={iconRef} size={16} /> : <span>{index + 1}.</span>}
			<p>{item.title}</p>
		</CommandItem>
	);
});

interface LinkGroupProps {
	heading: string;
	items: CommandLinkItem[];
	onSelect: (url: string, newTab?: boolean) => void;
}

const LinkGroup = memo(({ heading, items, onSelect }: LinkGroupProps) => (
	<CommandGroup heading={heading}>
		{items.map((item, idx) => (
			<Row index={idx} item={item} key={item.title} onSelect={onSelect} />
		))}
	</CommandGroup>
));

interface NavBarLinksCommandProps {
	posts?: Post[];
}

const NavBarLinksCommand = ({ posts = [] }: NavBarLinksCommandProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (target.isContentEditable || target.matches('input, textarea, select')) {
				return;
			}

			if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || event.key === '/') {
				event.preventDefault();
				setOpen((prev) => !prev);
			}
		};

		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, []);

	const { postGroups, kindMap } = useMemo(() => {
		const grouped: Record<string, CommandLinkItem[]> = { article: [], components: [], utils: [] };
		const map = new Map<string, CommandKind>();

		for (const group of COMMAND_GROUPS) {
			for (const item of group.items) {
				if (item.kind) {
					map.set(item.title, item.kind);
				}
			}
		}

		for (const post of posts) {
			const category = post.metadata?.category ?? 'article';
			const config = CATEGORY_CONFIG[category];
			if (!config) {
				continue;
			}

			const item: CommandLinkItem = {
				title: post.metadata.title,
				url: `/${config.route}/${post.slug}`,
				keywords: category === 'article' ? undefined : [category],
				kind: config.kind,
			};

			grouped[category]?.push(item);
			map.set(post.metadata.title, config.kind);
		}

		return { postGroups: grouped, kindMap: map };
	}, [posts]);

	const filteredGroups = useMemo(() => {
		if (pathname === '/') {
			return COMMAND_GROUPS.map((group, idx) =>
				idx === 0 ? { ...group, items: group.items.filter((item) => item.url !== '/') } : group
			);
		}
		return COMMAND_GROUPS;
	}, [pathname]);

	const handleSelect = useCallback(
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
				document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
				window.history.pushState(null, '', hash);
				return;
			}

			router.push(href);
		},
		[router, pathname]
	);

	const commandBody = (
		<>
			<CommandInput className="border-input border-b max-sm:border-t" />

			<CommandList>
				<CommandEmpty />

				{filteredGroups.map((group, idx) => (
					<div key={group.heading}>
						{idx > 0 && <CommandSeparator className="my-2" />}
						<LinkGroup heading={group.heading} items={group.items} onSelect={handleSelect} />
					</div>
				))}

				{Object.entries(CATEGORY_CONFIG).map(
					([category, config]) =>
						postGroups[category]?.length > 0 && (
							<div key={category}>
								<CommandSeparator className="my-2" />
								<LinkGroup heading={config.heading} items={postGroups[category]} onSelect={handleSelect} />
							</div>
						)
				)}
			</CommandList>

			<Footer kindMap={kindMap} />
		</>
	);

	const Wrapper = isDesktop ? Dialog : Drawer;
	const Content = isDesktop ? DialogContent : DrawerContent;
	const Title = isDesktop ? DialogTitle : DrawerTitle;
	const Description = isDesktop ? DialogDescription : DrawerDescription;

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button onClick={() => setOpen(true)} size="icon" variant="outline">
						<SearchIcon />
						<span className="sr-only">Rechercher</span>
					</Button>
				</TooltipTrigger>

				<TooltipContent>
					Rechercher
					<Kbd>/</Kbd>
				</TooltipContent>
			</Tooltip>

			<Wrapper onOpenChange={setOpen} open={open}>
				<Content
					className={cn(
						'overflow-hidden bg-popover p-0 backdrop-blur-lg supports-backdrop-filter:bg-popover/90',
						isDesktop && 'max-sm:top-16 max-sm:translate-y-0'
					)}
					{...(isDesktop && { overlay: true, 'data-slot': 'command-dialog-content' })}
				>
					<VisuallyHidden>
						<Title>Palette de commandes</Title>
						<Description>Utilisez la barre de recherche ...</Description>
					</VisuallyHidden>

					<Command>{commandBody}</Command>
				</Content>
			</Wrapper>
		</>
	);
};

NavBarLinksCommand.displayName = 'NavBarLinksCommand';

export { NavBarLinksCommand };

const NavBarLinksGitHub = () => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Link aria-label="Mon profil GitHub" href={GLOBAL_DATA.SOCIAL.github} rel="noopener" target="_blank">
				<GitHubIcon ref={iconRef} />
				<span className="sr-only">Mon profil GitHub</span>
			</Link>
		</Button>
	);
};

NavBarLinksGitHub.displayName = 'NavBarLinksGitHub';

export { NavBarLinksGitHub };

const NavBarLinksRSS = () => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Link aria-label="Flux RSS" href="/api/rss" rel="noopener noreferrer" target="_blank">
				<RssIcon ref={iconRef} />
				<span className="sr-only">Flux RSS</span>
			</Link>
		</Button>
	);
};

NavBarLinksRSS.displayName = 'NavBarLinksRSS';

export { NavBarLinksRSS };

const NavBarLinksLLM = () => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Button
			asChild
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			size="icon"
			variant="outline"
		>
			<Link aria-label="Contexte essentiel" href="/llms.txt" rel="noopener noreferrer" target="_blank">
				<LlmIcon ref={iconRef} />
				<span className="sr-only">Contexte essentiel</span>
			</Link>
		</Button>
	);
};

NavBarLinksLLM.displayName = 'NavBarLinksLLM';

export { NavBarLinksLLM };

const NavBarLinksTheme = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const { setMetaColor } = useMetaColor();

	const sunIconRef = useRef<AnimatedIconHandle>(null);
	const moonIconRef = useRef<AnimatedIconHandle>(null);

	const switchTheme = useCallback(() => {
		const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
		soundManager.playThemeSound();
		setTheme(newTheme);
		setMetaColor(resolvedTheme === 'dark' ? META_THEME_COLORS.light : META_THEME_COLORS.dark);
	}, [resolvedTheme, setTheme, setMetaColor]);

	const viewTransition = useCallback(() => {
		if (!document.startViewTransition) {
			switchTheme();
			return;
		}

		document.startViewTransition(switchTheme);
	}, [switchTheme]);

	useHotkeys('d', viewTransition, [viewTransition]);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					onClick={viewTransition}
					onMouseEnter={() => {
						sunIconRef.current?.startAnimation();
						moonIconRef.current?.startAnimation();
					}}
					onMouseLeave={() => {
						sunIconRef.current?.stopAnimation();
						moonIconRef.current?.stopAnimation();
					}}
					size="icon"
					variant="outline"
				>
					<MoonIcon className="hidden [html.dark_&]:block" ref={moonIconRef} />
					<SunIcon className="hidden [html.light_&]:block" ref={sunIconRef} />
					<span className="sr-only">Changer de thème</span>
				</Button>
			</TooltipTrigger>

			<TooltipContent className="pr-2 pl-3">
				<div className="flex items-center gap-3">
					Changer de thème
					<Kbd>D</Kbd>
				</div>
			</TooltipContent>
		</Tooltip>
	);
};

NavBarLinksTheme.displayName = 'NavBarLinksTheme';

export { NavBarLinksTheme };
