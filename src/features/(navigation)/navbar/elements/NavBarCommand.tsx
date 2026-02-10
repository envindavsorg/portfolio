'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useCommandState } from 'cmdk';
import { usePathname, useRouter } from 'next/navigation';
import {
	memo,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/buttons/Button';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { Kbd, KbdGroup } from '@/components/Kbd';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/overlays/Command';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from '@/components/overlays/Dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerTitle,
} from '@/components/overlays/Drawer';
import { Separator } from '@/components/ui/Separator';
import useMediaQuery from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { CATEGORY, LABELS } from './content';
import { buildKindMap, buildPostGroups, getFilteredGroups } from './functions';
import type { CommandItemProps, CommandKind } from './types';

interface CommandFooterProps {
	kindMap: Map<string, CommandKind>;
}

const CommandFooter = memo(({ kindMap }: CommandFooterProps) => {
	const kind = useCommandState((state) => kindMap.get(state.value) ?? 'page');

	return (
		<div className="hidden h-12 items-center justify-end gap-x-4 border-input border-t px-4 sm:flex">
			<KbdGroup>
				<span className="font-medium text-xs">{LABELS[kind]}</span>
				<Kbd>↵</Kbd>
			</KbdGroup>

			<Separator
				className="data-[orientation=vertical]:h-4"
				orientation="vertical"
			/>

			<KbdGroup>
				<span className="font-medium text-xs">Fermer</span>
				<Kbd>␛</Kbd>
			</KbdGroup>
		</div>
	);
});

interface CommandRowProps {
	item: CommandItemProps;
	index: number;
	onSelect: (url: string, newTab?: boolean) => void;
}

const CommandRow = memo(({ item, index, onSelect }: CommandRowProps) => {
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
			{Icon ? (
				<Icon ref={iconRef as RefObject<AnimatedIconHandle>} size={16} />
			) : (
				<span>{index + 1}.</span>
			)}
			<p>{item.title}</p>
		</CommandItem>
	);
});

interface CommandLinkGroupProps {
	heading: string;
	items: CommandItemProps[];
	onSelect: (url: string, newTab?: boolean) => void;
}

const CommandLinkGroup = memo(
	({ heading, items, onSelect }: CommandLinkGroupProps) => (
		<CommandGroup heading={heading}>
			{items.map((item, idx) => (
				<CommandRow
					index={idx}
					item={item}
					key={item.title}
					onSelect={onSelect}
				/>
			))}
		</CommandGroup>
	)
);

interface NavBarCommandProps {
	posts?: Post[];
}

export const NavBarCommand = ({ posts = [] }: NavBarCommandProps) => {
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

	const kindMap = useMemo(() => buildKindMap(posts), [posts]);
	const postGroups = useMemo(() => buildPostGroups(posts), [posts]);
	const filteredGroups = useMemo(() => getFilteredGroups(pathname), [pathname]);

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

	const Wrapper = isDesktop ? Dialog : Drawer;
	const Content = isDesktop ? DialogContent : DrawerContent;
	const Title = isDesktop ? DialogTitle : DrawerTitle;
	const Description = isDesktop ? DialogDescription : DrawerDescription;

	const handleOpen = useCallback(() => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		setOpen(true);
		toast.info('', {
			id: 'command-hint',
			description: 'Glissez vers le bas ou appuyez en dehors pour fermer.',
			duration: Number.POSITIVE_INFINITY,
		});
	}, []);

	const handleOpenChange = useCallback((value: boolean) => {
		setOpen(value);
		if (!value) {
			toast.dismiss('command-hint');
		}
	}, []);

	return (
		<>
			<Button onClick={handleOpen} size="icon" variant="outline">
				<SearchIcon />
				<span className="sr-only">Rechercher</span>
			</Button>

			<Wrapper onOpenChange={handleOpenChange} open={open}>
				<Content
					className={cn(
						'overflow-hidden bg-popover p-0 backdrop-blur-lg supports-backdrop-filter:bg-popover/90',
						isDesktop && 'max-sm:top-16 max-sm:translate-y-0'
					)}
					{...(isDesktop && {
						overlay: true,
						'data-slot': 'command-dialog-content',
					})}
				>
					<VisuallyHidden>
						<Title>Palette de commandes</Title>
						<Description>
							Utilisez la barre de recherche pour naviguer rapidement vers
							différentes sections du site ou pour accéder à des fonctionnalités
							spécifiques.
						</Description>
					</VisuallyHidden>

					<Command>
						<CommandInput
							className={cn(
								'border-input sm:border-b',
								'max-sm:mx-4 max-sm:mt-2 max-sm:mb-4 max-sm:rounded-full max-sm:border'
							)}
						/>

						<CommandList className="max-sm:border-input max-sm:border-t max-sm:py-2">
							<CommandEmpty />

							<div className="max-sm:mx-2">
								{filteredGroups.map(({ heading, items }) => (
									<CommandLinkGroup
										heading={heading}
										items={items}
										key={heading}
										onSelect={handleSelect}
									/>
								))}
							</div>

							<div className="max-sm:mx-2">
								{Object.entries(CATEGORY).map(
									([category, config]) =>
										postGroups[category]?.length > 0 && (
											<CommandLinkGroup
												heading={config.heading}
												items={postGroups[category]}
												key={category}
												onSelect={handleSelect}
											/>
										)
								)}
							</div>
						</CommandList>

						<CommandFooter kindMap={kindMap} />
					</Command>
				</Content>
			</Wrapper>
		</>
	);
};
