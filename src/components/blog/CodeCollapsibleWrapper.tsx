import type { ComponentProps } from 'react';
import type { Collapsible } from '@/components/primitives/Collapsible';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/primitives/Collapsible';
import { cn } from '@/lib/utils';

export const CodeCollapsibleWrapper = ({
	className,
	children,
	...props
}: ComponentProps<typeof Collapsible>) => (
	<CollapsibleWithContext
		className={cn('group/collapsible not-prose relative mt-6', className)}
		{...props}
	>
		<CollapsibleTrigger asChild>
			<div className="absolute top-2.25 right-10 z-10 cursor-pointer">
				<CollapsibleChevronsIcon />
			</div>
		</CollapsibleTrigger>
		<CollapsibleContent
			className="overflow-hidden data-[state=closed]:max-h-80 data-[state=closed]:rounded-b-lg [&>figure]:my-0"
			forceMount
		>
			{children}
		</CollapsibleContent>
		<CollapsibleTrigger className="absolute inset-x-0 bottom-0 flex h-30 cursor-pointer items-end justify-center bg-linear-to-t from-25% from-code to-transparent pb-4 text-foreground text-sm underline underline-offset-2 group-data-[state=open]/collapsible:hidden">
			voir tout le code
		</CollapsibleTrigger>
	</CollapsibleWithContext>
);
