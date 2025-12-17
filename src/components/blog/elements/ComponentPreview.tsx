'use client';

import { CodeIcon, EyeIcon, RepeatIcon } from '@phosphor-icons/react';
import React, { useMemo, useState } from 'react';
import { Index } from '@/__registry__';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/Tooltip';
import { Code as CodeInline } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
import { CodeCollapsibleWrapper } from './CodeCollapsibleWrapper';
import { OpenInV0 } from './OpenInV0';

export const ComponentPreview = ({
	className,
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
					Le composant{' '}
					<CodeInline className="font-semibold">{name}</CodeInline>{' '}
					n'existe pas dans le registre.
				</p>
			);
		}

		return <Component />;
	}, [name]);

	return (
		<div
			className={cn('my-6', notProse && 'not-prose', className)}
			{...props}
		>
			<Tabs className="gap-4" defaultValue="preview">
				<TabsList>
					<TabsTrigger className="cursor-pointer" value="preview">
						<EyeIcon className="size-4" />
						Aperçu
					</TabsTrigger>
					<TabsTrigger className="cursor-pointer" value="code">
						<CodeIcon className="size-4" />
						Code
					</TabsTrigger>
				</TabsList>

				<TabsContent value="preview">
					<div className="rounded-lg border border-edge bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-center bg-size-[10px_10px] bg-zinc-950/0.75 p-4 [--pattern-foreground:var(--color-zinc-950)]/5 dark:bg-white/0.75 dark:[--pattern-foreground:var(--color-white)]/5">
						{(canReplay || openInV0Url) && (
							<div className="mb-4 flex justify-end gap-2">
								{canReplay && (
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={() =>
													setReplay((v) => v + 1)
												}
												size="icon"
												variant="outline"
											>
												<RepeatIcon className="size-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>Revoir</TooltipContent>
									</Tooltip>
								)}

								{openInV0Url && <OpenInV0 url={openInV0Url} />}
							</div>
						)}

						<div
							className="flex min-h-80 items-center justify-center font-sans"
							data-screenshot-anchor-target-for-capture
							key={replay}
						>
							<React.Suspense
								fallback={
									<div className="flex items-center justify-center text-muted-foreground text-sm">
										Chargement en cours ...
									</div>
								}
							>
								{Preview}
							</React.Suspense>
						</div>
					</div>
				</TabsContent>

				<TabsContent className="[&>figure]:m-0" value="code">
					{codeCollapsible ? (
						<CodeCollapsibleWrapper className="my-0">
							{Code}
						</CodeCollapsibleWrapper>
					) : (
						Code
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
};
