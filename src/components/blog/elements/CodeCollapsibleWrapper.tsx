import type React from 'react';
import { Button } from '@/components/ui/Button';
import type { Collapsible } from '@/components/ui/Collapsible';
import {
	CollapsibleChevronsIcon,
	CollapsibleContent,
	CollapsibleTrigger,
	CollapsibleWithContext,
} from '@/components/ui/Collapsible';
import { Separator } from '@/components/ui/Separator';
import { cn } from '@/lib/utils';

export const CodeCollapsibleWrapper = ({
	className,
	children,
	...props
}: React.ComponentProps<typeof Collapsible>) => (
	<CollapsibleWithContext
		className={cn('group/collapsible not-prose relative my-6', className)}
		{...props}
	>
		<CollapsibleTrigger asChild>
			<div className="absolute top-2 right-10 z-10 flex items-center gap-2">
				<Button
					className="size-6 rounded-md"
					size="icon"
					variant="secondary"
				>
					<CollapsibleChevronsIcon />
				</Button>

				<Separator
					className="data-[orientation=vertical]:h-4"
					orientation="vertical"
				/>
			</div>
		</CollapsibleTrigger>

		<CollapsibleContent
			className="overflow-hidden data-[state=closed]:max-h-80 data-[state=closed]:rounded-b-lg [&>figure]:my-0"
			forceMount
		>
			{children}
		</CollapsibleContent>

		<CollapsibleTrigger className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center rounded-b-lg bg-linear-to-t from-25% from-code to-transparent pb-4 font-medium text-muted-foreground text-sm group-data-[state=open]/collapsible:hidden">
			Voir tout le code
		</CollapsibleTrigger>
	</CollapsibleWithContext>
);
