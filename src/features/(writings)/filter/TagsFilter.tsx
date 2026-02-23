'use client';

import { CaretDownIcon } from '@phosphor-icons/react';
import { capitalize } from 'es-toolkit/string';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/buttons/Button';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/overlays/Drawer';
import { Badge } from '@/components/primitives/Badge';
import { cn } from '@/lib/utils';

interface TagsFilterProps {
	tags: string[];
	selectedTag: string;
	tagCounts?: Record<string, number>;
}

type TagFilterListProps = TagsFilterProps & {
	onTagClick: (tag: string) => void;
};

const isTagActive = (tag: string, selectedTag: string) =>
	tag === 'tout' ? selectedTag === 'tout' : selectedTag === tag.toLowerCase();

const DesktopTagFilter = ({
	tags,
	selectedTag,
	tagCounts,
	onTagClick,
}: TagFilterListProps) => (
	<div className="screen-line-after hidden flex-wrap gap-x-4 px-3 py-1.5 md:flex">
		{tags.map((tag) => {
			const isActive = isTagActive(tag, selectedTag);
			return (
				<div className="flex items-center gap-x-1.5" key={tag}>
					<Button
						className={cn(
							'px-0',
							isActive
								? 'text-theme underline underline-offset-4'
								: 'text-foreground lowercase'
						)}
						onClick={() => onTagClick(tag)}
						variant="link"
					>
						{tag}
					</Button>
					{tagCounts?.[tag] && (
						<sup
							className={cn(
								'font-medium text-[10px]',
								isActive ? 'text-theme' : 'text-foreground'
							)}
						>
							{tagCounts[tag]}
						</sup>
					)}
				</div>
			);
		})}
	</div>
);

const MobileTagFilter = ({
	tags,
	selectedTag,
	tagCounts,
	onTagClick,
}: TagFilterListProps) => (
	<Drawer>
		<DrawerTrigger className="screen-line-after flex size-full items-center justify-between p-3 md:hidden">
			<span className="font-medium text-sm">
				Catégorie: {capitalize(selectedTag)}
			</span>
			<CaretDownIcon className="size-4" />
		</DrawerTrigger>
		<DrawerContent className="bg-background p-0 md:hidden">
			<div className="p-5">
				<DrawerHeader className="mb-6">
					<DrawerTitle className="font-semibold text-lg text-theme leading-normal sm:text-xl">
						filtrer les articles
					</DrawerTitle>
					<DrawerDescription className="text-foreground text-sm leading-normal">
						choisissez la catégorie ...
					</DrawerDescription>
				</DrawerHeader>
				<div className="space-y-3">
					{tags.map((tag) => {
						const isActive = isTagActive(tag, selectedTag);
						return (
							<div className="flex items-center justify-between" key={tag}>
								<Button
									className={cn(
										'px-0 font-medium text-sm',
										isActive
											? 'text-theme underline underline-offset-4'
											: 'text-foreground'
									)}
									onClick={() => onTagClick(tag)}
									variant="link"
								>
									{tag}
								</Button>
								{tagCounts?.[tag] && (
									<Badge
										className={cn(
											'aspect-square border',
											isActive
												? 'border-theme text-theme'
												: 'border-input text-foreground'
										)}
									>
										{tagCounts[tag]}
									</Badge>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</DrawerContent>
	</Drawer>
);

export const TagsFilter = ({
	tags,
	selectedTag,
	tagCounts,
}: TagsFilterProps) => {
	const router = useRouter();
	const pathname = usePathname();

	const handleTagClick = useCallback(
		(tag: string) => {
			const params = new URLSearchParams(window.location.search);
			if (tag === 'tout') {
				params.delete('tag');
			} else {
				params.set('tag', tag.toLowerCase());
			}
			const query = params.toString();
			router.push(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		},
		[pathname, router]
	);

	if (tags.length <= 1) {
		return null;
	}

	const childProps: TagFilterListProps = {
		tags,
		selectedTag,
		tagCounts,
		onTagClick: handleTagClick,
	};

	return (
		<>
			<DesktopTagFilter {...childProps} />
			<MobileTagFilter {...childProps} />
		</>
	);
};
