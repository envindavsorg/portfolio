import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import type React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/Collapsible';

type CollapsibleListProps<T> = {
	items: T[];
	renderItemAction: (item: T) => React.ReactNode;
	max?: number;
	keyExtractorAction?: (item: T) => string | number;
	className?: string;
	labels?: {
		showMore?: string;
		showLess?: string;
	};
};

export const CollapsibleList = <T,>({
	items,
	renderItemAction,
	max = 3,
	keyExtractorAction,
	className,
	labels = { showMore: 'Afficher plus', showLess: 'Afficher moins' },
}: CollapsibleListProps<T>) => {
	const { visibleItems, hiddenItems } = useMemo(() => {
		return {
			visibleItems: items.slice(0, max),
			hiddenItems: items.slice(max),
		};
	}, [items, max]);

	if (!items.length) {
		return null;
	}

	const getKey = (item: T, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<Collapsible className={className}>
			{visibleItems.map((item, index) => (
				<div className="border-edge border-b" key={getKey(item, index)}>
					{renderItemAction(item)}
				</div>
			))}

			{hiddenItems.length > 0 && (
				<CollapsibleContent>
					{hiddenItems.map((item, index) => (
						<div
							className="border-edge border-b"
							key={getKey(item, max + index)}
						>
							{renderItemAction(item)}
						</div>
					))}
				</CollapsibleContent>
			)}

			{hiddenItems.length > 0 && (
				<div className="flex justify-center py-2 md:justify-end md:pr-4">
					<CollapsibleTrigger asChild>
						<Button className="group flex items-center gap-2">
							<span className="group-data-[state=open]:hidden">
								{labels.showMore}
							</span>
							<span className="hidden group-data-[state=open]:inline">
								{labels.showLess}
							</span>

							<CaretDownIcon
								aria-hidden="true"
								className="size-4 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180"
							/>
						</Button>
					</CollapsibleTrigger>
				</div>
			)}
		</Collapsible>
	);
};
