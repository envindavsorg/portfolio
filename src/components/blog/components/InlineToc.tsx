import { TextAaIcon } from '@phosphor-icons/react/ssr';
import type { TOCItemType } from 'fumadocs-core/server';
import Link from 'next/link';
import type React from 'react';
import type { Collapsible } from '@/components/ui/Collapsible';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { cn } from '@/lib/utils';

type InlineTocProps = {
	items: TOCItemType[];
};

export const InlineToc = ({
	items,
	className,
	children,
	...props
}: React.ComponentProps<typeof Collapsible> & InlineTocProps) => {
	if (!items.length) {
		return null;
	}

	return (
		<CollapsibleWithContext
			className={cn('not-prose rounded-lg bg-code font-sans', className)}
			{...props}
		>
			<CollapsibleTrigger className="group/toc inline-flex w-full cursor-pointer items-center gap-2 p-3 pl-4 font-medium text-sm [&_svg]:size-4">
				<TextAaIcon className="size-4" />
				{children ?? 'Points importants sur cette page'}
				<div
					aria-hidden
					className="ml-auto shrink-0 text-muted-foreground"
				>
					<CollapsibleChevronsIcon />
				</div>
			</CollapsibleTrigger>

			<CollapsibleContent className="overflow-hidden duration-300 data-[state=closed]:animate-collapsible-fade-up data-[state=open]:animate-collapsible-fade-down">
				<ul className="flex flex-col px-4 pb-3 text-muted-foreground">
					{items.map((item) => (
						<li
							className="flex py-1"
							key={item.url}
							style={{
								paddingInlineStart:
									16 * Math.max(item.depth - 2, 0),
							}}
						>
							<Link
								className="underline-offset-4 transition-colors hover:text-accent-foreground hover:underline"
								href={item.url}
							>
								{item.title}
							</Link>
						</li>
					))}
				</ul>
			</CollapsibleContent>
		</CollapsibleWithContext>
	);
};
