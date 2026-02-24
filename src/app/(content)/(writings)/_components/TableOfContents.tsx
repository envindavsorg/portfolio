'use client';

import type { TOCItemType } from 'fumadocs-core/toc';
import Link from 'next/link';
import { type ComponentProps, useRef } from 'react';
import { GalleryHorizontalEndIcon } from '@/components/blocks/icons/GalleryHorizontalEnd';
import type { Collapsible } from '@/components/primitives/Collapsible';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/primitives/Collapsible';
import { cn } from '@/lib/utils';

type TableOfContentsProps = ComponentProps<typeof Collapsible> & {
	items: TOCItemType[];
};

export const TableOfContents = ({ items, ...props }: TableOfContentsProps) => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<CollapsibleWithContext
			className="not-prose rounded-md border border-input data-[state=open]:border-theme"
			{...props}
		>
			<CollapsibleTrigger
				className={cn(
					'flex w-full cursor-pointer items-center justify-between p-3 data-[state=open]:text-theme',
					'[&_svg]:size-4 [&_svg]:text-foreground data-[state=open]:[&_svg]:text-theme sm:[&_svg]:size-5'
				)}
				onMouseEnter={() => iconRef.current?.startAnimation()}
				onMouseLeave={() => iconRef.current?.stopAnimation()}
			>
				<div className="inline-flex items-center gap-x-3">
					<GalleryHorizontalEndIcon ref={iconRef} />
					<p className="font-medium text-sm sm:text-base">
						points importants sur cette page
					</p>
				</div>
				<CollapsibleChevronsIcon />
			</CollapsibleTrigger>

			<CollapsibleContent
				className={cn(
					'overflow-hidden duration-200',
					'data-[state=closed]:animate-collapsible-fade-up',
					'data-[state=open]:animate-collapsible-fade-down'
				)}
			>
				<ul className="flex flex-col gap-y-2 px-3 pt-1 pb-3 text-foreground">
					{items.map((item) => (
						<li key={item.url}>
							<Link
								className="lowercase underline-offset-4 transition-colors hover:text-theme hover:underline"
								href={item.url}
							>
								-- {item.title} --
							</Link>
						</li>
					))}
				</ul>
			</CollapsibleContent>
		</CollapsibleWithContext>
	);
};
