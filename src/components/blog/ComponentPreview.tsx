'use client';

import Link from 'next/link';
import type React from 'react';
import {
	Children,
	type ComponentProps,
	Suspense,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Index } from '@/__registry__';
import { Refresh } from '@/components/motion/Refresh';
import { Button } from '@/components/primitives/Button';
import { TabsAnimated } from '@/components/primitives/Tabs';
import { Code as CodeInline } from '@/components/primitives/Typography';
import { V0Icon } from '@/components/svgs/stack/V0';
import { cn } from '@/lib/utils';
import { CodeCollapsibleWrapper } from './CodeCollapsibleWrapper';

type ComponentPreviewProps = ComponentProps<'div'> & {
	name: string;
	openInV0Url?: string;
	canReplay?: boolean;
	notProse?: boolean;
	codeCollapsible?: boolean;
};

export const ComponentPreview = ({
	name,
	openInV0Url,
	canReplay = false,
	notProse = true,
	codeCollapsible = false,
	children,
	...props
}: ComponentPreviewProps) => {
	const [replay, setReplay] = useState(0);

	const Codes = Children.toArray(children) as React.ReactElement[];
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

	const iconRef = useRef<AnimatedIconHandle>(null);

	const tabs = [
		{
			id: 0,
			label: 'composant',
			content: (
				<div className="rounded-md border border-input bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-center bg-size-[10px_10px] bg-zinc-950/0.75 p-4 [--pattern-foreground:var(--color-zinc-950)]/5 dark:bg-white/0.75 dark:[--pattern-foreground:var(--color-white)]/5">
					{(canReplay || openInV0Url) && (
						<div className="flex justify-end gap-x-3">
							{canReplay && (
								<Button
									onClick={() => {
										setReplay((v) => v + 1);
										iconRef.current?.startAnimation();
										iconRef.current?.stopAnimation();
									}}
									onMouseEnter={() => iconRef.current?.startAnimation()}
									onMouseLeave={() => iconRef.current?.stopAnimation()}
									size="icon"
									variant="outline"
								>
									<Refresh ref={iconRef} />
								</Button>
							)}

							{openInV0Url && (
								<Button asChild variant="outline">
									<Link
										aria-label="Ouvrir dans v0"
										href={`https://v0.app/chat/api/open?url=${openInV0Url}`}
										rel="noopener noreferrer"
										target="_blank"
									>
										ouvrir dans <V0Icon className="size-5" />
									</Link>
								</Button>
							)}
						</div>
					)}

					<div
						className="flex min-h-80 items-center justify-center"
						data-screenshot-anchor-target-for-capture
						key={replay}
					>
						<Suspense>{Preview}</Suspense>
					</div>
				</div>
			),
		},
		{
			id: 1,
			label: 'code',
			content: (
				<div className="[&>figure]:m-0 [&_button.absolute]:top-3 [&_button.absolute]:right-3">
					{codeCollapsible ? (
						<CodeCollapsibleWrapper>{Code}</CodeCollapsibleWrapper>
					) : (
						Code
					)}
				</div>
			),
		},
	];

	return (
		<div className={cn(notProse && 'not-prose')} {...props}>
			<TabsAnimated
				after={false}
				className="ms-auto max-w-sm pt-0"
				tabs={tabs}
			/>
		</div>
	);
};
