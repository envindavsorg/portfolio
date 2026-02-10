'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/buttons/Button';
import { SearchIcon } from '@/components/icons/SearchIcon';
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandList,
	CommandSeparator,
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
import useMediaQuery from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { CommandFooter } from '../command/CommandFooter';
import { CommandLinkGroup } from '../command/CommandLinkGroup';
import { CATEGORY } from '../command/content';
import {
	buildKindMap,
	buildPostGroups,
	getFilteredGroups,
} from '../command/function';

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
								'max-sm:mx-4 max-sm:my-2 max-sm:rounded-full max-sm:border'
							)}
						/>

						<CommandList>
							<CommandEmpty />

							{filteredGroups.map((group, idx) => (
								<div key={group.heading}>
									{idx > 0 && <CommandSeparator className="my-2" />}
									<CommandLinkGroup
										heading={group.heading}
										items={group.items}
										onSelect={handleSelect}
									/>
								</div>
							))}

							{Object.entries(CATEGORY).map(
								([category, config]) =>
									postGroups[category]?.length > 0 && (
										<div key={category}>
											<CommandSeparator className="my-2" />
											<CommandLinkGroup
												heading={config.heading}
												items={postGroups[category]}
												onSelect={handleSelect}
											/>
										</div>
									)
							)}
						</CommandList>

						<CommandFooter kindMap={kindMap} />
					</Command>
				</Content>
			</Wrapper>
		</>
	);
};
