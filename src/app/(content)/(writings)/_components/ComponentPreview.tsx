'use client';

import { CodeIcon, EyeIcon, RepeatIcon } from '@phosphor-icons/react';
import React, { Suspense, useMemo, useState } from 'react';
import { Index } from '@/__registry__';
import { Button } from '@/components/primitives/Button';
import {
	Tabs,
	TabsAnimated,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/primitives/Tabs';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/primitives/Tooltip';
import { Code as CodeInline } from '@/components/primitives/Typography';
import { cn } from '@/lib/utils';
import { CodeCollapsibleWrapper } from './CodeCollapsibleWrapper';
import { OpenInV0 } from './OpenInV0';

export const ComponentPreview = ({
	name,
	openInV0Url,
	canReplay = false,
	notProse = true,
	codeCollapsible = false,
	children,
	...props
}: React.ComponentProps<'div'> & {
	name: string;
	openInV0Url?: string;
	canReplay?: boolean;
	notProse?: boolean;
	codeCollapsible?: boolean;
}) => {
	const [replay, setReplay] = useState(0);

	const Codes = React.Children.toArray(children) as React.ReactElement[];
	const Code = Codes[0];
	const Preview = useMemo(() => {
		const Component = Index[name]?.component;
		if (!Component) {
			return (
				<p className="text-muted-foreground text-sm">
					-- le composant{' '}
					<CodeInline className="font-semibold">{name}</CodeInline> n'existe pas
					dans le registre --
				</p>
			);
		}

		return <Component />;
	}, [name]);

	const tabs = [
		{
			id: 0,
			label: 'aperçu du composant',
			content: (
				<div className="rounded-lg border border-edge bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-center bg-size-[10px_10px] bg-zinc-950/0.75 p-4 [--pattern-foreground:var(--color-zinc-950)]/5 dark:bg-white/0.75 dark:[--pattern-foreground:var(--color-white)]/5">
					{(canReplay || openInV0Url) && (
						<div className="mb-4 flex justify-end gap-2">
							{canReplay && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											onClick={() => setReplay((v) => v + 1)}
											size="icon"
											variant="outline"
										>
											<RepeatIcon className="size-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>revoir</TooltipContent>
								</Tooltip>
							)}

							{openInV0Url && <OpenInV0 url={openInV0Url} />}
						</div>
					)}

					<div
						className="flex min-h-80 items-center justify-center"
						data-screenshot-anchor-target-for-capture
						key={replay}
					>
						<Suspense
							fallback={
								<div className="flex items-center justify-center text-muted-foreground text-sm">
									chargement en cours ...
								</div>
							}
						>
							{Preview}
						</Suspense>
					</div>
				</div>
			),
		},
		{
			id: 1,
			label: 'voir le code',
			content: (
				<div className="[&>figure]:m-0">
					{codeCollapsible ? (
						<CodeCollapsibleWrapper className="my-0">
							{Code}
						</CodeCollapsibleWrapper>
					) : (
						Code
					)}
				</div>
			),
		},
	];

	return (
		<div
			className={cn('screen-line-after pb-6', notProse && 'not-prose')}
			{...props}
		>
			<TabsAnimated tabs={tabs} after={false} />
		</div>
	);
};
