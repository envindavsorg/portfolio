'use client';

import { CaretDownIcon } from '@phosphor-icons/react';
import { capitalize } from 'es-toolkit/string';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerTrigger,
} from '@/components/ui/Drawer';
import { cn } from '@/lib/utils';

type TagsFilterProps = {
	tags: string[];
	selectedTag: string;
	tagCounts?: Record<string, number>;
};

type TagFilterListProps = TagsFilterProps & {
	onTagClick: (tag: string) => void;
};

const DesktopTagFilter = ({
	tags,
	selectedTag,
	tagCounts,
	onTagClick,
}: TagFilterListProps) => (
	<div className="screen-line-after hidden flex-wrap gap-x-4 px-3 py-1.5 md:flex">
		{tags.map((tag: string) => {
			const isActive =
				tag === 'Tout'
					? selectedTag === 'Tout'
					: selectedTag === tag.toLowerCase();

			return (
				<div className="flex items-center gap-x-1.5" key={tag}>
					<Button
						className={cn(
							'px-0',
							isActive
								? 'text-theme underline underline-offset-4'
								: 'text-foreground',
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
								isActive ? 'text-theme' : 'text-foreground',
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

		<DrawerContent className="md:hidden">
			<DrawerHeader>
				<h3 className="font-semibold text-base">
					Filtrer par catégorie :
				</h3>
			</DrawerHeader>

			<DrawerBody>
				<div className="space-y-3">
					{tags.map((tag: string) => {
						const isActive =
							tag === 'Tout'
								? selectedTag === 'Tout'
								: selectedTag === tag.toLowerCase();

						return (
							<div
								className="flex items-center justify-between"
								key={tag}
							>
								<Button
									className={cn(
										'px-0 font-medium text-base',
										isActive
											? 'text-theme underline underline-offset-4'
											: 'text-foreground',
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
												: 'border-input text-foreground',
										)}
									>
										{tagCounts[tag]}
									</Badge>
								)}
							</div>
						);
					})}
				</div>
			</DrawerBody>
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
			const params: URLSearchParams = new URLSearchParams(
				window.location.search,
			);

			if (tag === 'Tout') {
				params.delete('tag');
			} else {
				params.set('tag', tag.toLowerCase());
			}

			router.push(`${pathname}?${params.toString()}`, {
				scroll: false,
			});
		},
		[pathname, router],
	);

	if (tags.length <= 1) {
		return null;
	}

	const childProps = {
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
