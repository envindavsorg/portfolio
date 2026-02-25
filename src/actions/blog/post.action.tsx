'use client';

import {
	CaretDownIcon,
	CaretUpIcon,
	CheckIcon,
	CopyIcon,
	TriangleDashedIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import type React from 'react';
import { lazy, useMemo, useOptimistic, useTransition } from 'react';
import { buttonVariants } from '@/components/primitives/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/primitives/DropdownMenu';
import { getPrompt } from '@/lib/functions';
import { soundManager } from '@/lib/sound-manager';
import { cn } from '@/lib/utils';

const cache = new Map<string, string>();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ICONS = {
	idle: CopyIcon,
	fetching: CopyIcon,
	copied: CheckIcon,
	failed: TriangleDashedIcon,
} as const;

interface LLMCopyButtonProps {
	markdownUrl: string;
}

export const LLMCopyButton = ({ markdownUrl }: LLMCopyButtonProps) => {
	const [state, setState] = useOptimistic<
		'idle' | 'fetching' | 'copied' | 'failed'
	>('idle');
	const [, startTransition] = useTransition();

	const Icon = useMemo(() => ICONS[state], [state]);

	const handleCopy = () => {
		startTransition(async () => {
			try {
				const cached = cache.get(markdownUrl);
				if (cached) {
					await navigator.clipboard.writeText(cached);
					setState('copied');
					return;
				}

				setState('fetching');

				await navigator.clipboard.write([
					new ClipboardItem({
						'text/plain': fetch(markdownUrl)
							.then((res) => res.text())
							.then((content) => {
								cache.set(markdownUrl, content);
								return content;
							}),
					}),
				]);

				setState('copied');
			} catch {
				setState('failed');
			}

			await soundManager.playToastSound();
			await delay(2000);
		});
	};

	return (
		<button
			className="flex h-7 cursor-pointer items-center gap-x-1.5 rounded-l-full pr-2 pl-2.5 font-medium text-xs disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
			disabled={state === 'fetching'}
			onClick={handleCopy}
			type="button"
		>
			<Icon className="size-4" />
			markdown
		</button>
	);
};

const MarkdownIcon = lazy(() =>
	import('@/components/blocks/icons/stack/Markdown').then((m) => ({
		default: m.MarkdownIcon,
	}))
);

const V0Icon = lazy(() =>
	import('@/components/blocks/icons/stack/V0').then((m) => ({
		default: m.V0Icon,
	}))
);

const ChatGPTIcon = lazy(() =>
	import('@/components/blocks/icons/stack/ChatGPT').then((m) => ({
		default: m.ChatGPTIcon,
	}))
);

const ClaudeIcon = lazy(() =>
	import('@/components/blocks/icons/stack/Claude').then((m) => ({
		default: m.ClaudeIcon,
	}))
);

type IconProps = React.HTMLAttributes<SVGElement>;
const Icons = {
	v0: (props: IconProps) => <V0Icon {...props} />,
	markdown: (props: IconProps) => <MarkdownIcon {...props} />,
	chatgpt: (props: IconProps) => <ChatGPTIcon {...props} />,
	claude: (props: IconProps) => <ClaudeIcon {...props} />,
};

interface ViewOptionsProps {
	markdownUrl: string;
	isComponent?: boolean;
}

export const ViewOptions = ({
	markdownUrl,
	isComponent = false,
}: ViewOptionsProps) => {
	const items = useMemo(() => {
		const fullMarkdownUrl =
			typeof window === 'undefined'
				? markdownUrl
				: new URL(markdownUrl, window.location.origin).toString();

		const promptType = isComponent ? 'component' : 'general';
		const q = getPrompt(fullMarkdownUrl, promptType);

		const _items = [
			{
				title: 'voir en Markdown',
				href: fullMarkdownUrl,
				icon: Icons.markdown,
				tool: 'markdown',
			},
			{
				title: 'ouvrir dans ChatGPT',
				href: `https://chatgpt.com/?${new URLSearchParams({
					hints: 'search',
					q,
				})}`,
				icon: Icons.chatgpt,
				tool: 'chatgpt',
			},
			{
				title: 'ouvrir dans Claude',
				href: `https://claude.ai/new?${new URLSearchParams({
					q,
				})}`,
				icon: Icons.claude,
				tool: 'claude',
			},
		];

		if (isComponent) {
			_items.splice(1, 0, {
				title: 'ouvrir dans v0',
				href: `https://v0.app/?${new URLSearchParams({
					q,
				})}`,
				icon: Icons.v0,
				tool: 'v0',
			});
		}

		return _items;
	}, [markdownUrl, isComponent]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className="group/toggle flex size-7 cursor-pointer items-center justify-center gap-2 rounded-r-full text-sm"
					type="button"
				>
					<CaretDownIcon className="mr-1 size-4 group-data-[state=open]/toggle:hidden" />
					<CaretUpIcon className="mr-1 size-4 group-data-[state=closed]/toggle:hidden" />
					<span className="sr-only">voir les options de visualisation</span>
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="w-fit py-2 *:cursor-pointer"
				collisionPadding={8}
				onCloseAutoFocus={(event: Event) => event.preventDefault()}
				sideOffset={8}
			>
				{items.map(({ title, href, icon: Icon }) => (
					<DropdownMenuItem asChild className="font-medium" key={href}>
						<Link href={href} rel="noreferrer noopener" target="_blank">
							<Icon className="size-4" />
							{title}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

interface LLMCopyButtonWithViewOptionsProps {
	markdownUrl: string;
	isComponent?: boolean;
	className?: string;
}

export const LLMCopyButtonWithViewOptions = ({
	markdownUrl,
	isComponent = false,
	className,
}: LLMCopyButtonWithViewOptionsProps) => (
	<div
		className={cn(
			className,
			buttonVariants({
				size: 'default',
				variant: 'outline',
				className: 'gap-0 divide-x px-0 dark:divide-white/10',
			})
		)}
	>
		<LLMCopyButton markdownUrl={markdownUrl} />
		<ViewOptions isComponent={isComponent} markdownUrl={markdownUrl} />
	</div>
);
