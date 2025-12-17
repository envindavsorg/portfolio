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
import { toast } from 'sonner';
import { variants } from '@/components/ui/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { soundManager } from '@/lib/sound-manager';
import { cn } from '@/lib/utils';
import getPrompt from '@/lib/utils/llm';

const cache = new Map<string, string>();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ICONS = {
	idle: CopyIcon,
	fetching: CopyIcon,
	copied: CheckIcon,
	failed: TriangleDashedIcon,
} as const;

type LLMCopyButtonProps = {
	markdownUrl: string;
};

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

			soundManager.playToastSound();
			toast.success('Contenu copié dans le presse-papier !');

			await delay(2000);
		});
	};

	return (
		<button
			className="flex h-7 cursor-pointer items-center gap-x-1.5 rounded-l-full pr-2 pl-2.5 font-medium text-sm disabled:pointer-events-none disabled:opacity-50"
			disabled={state === 'fetching'}
			onClick={handleCopy}
			type="button"
		>
			<Icon className="size-4" />
			Markdown
		</button>
	);
};

const MarkdownIcon = lazy(() =>
	import('@/components/icons/content/Markdown').then((m) => ({
		default: m.MarkdownIcon,
	})),
);

const V0Icon = lazy(() =>
	import('@/components/icons/content/V0').then((m) => ({
		default: m.V0Icon,
	})),
);

const ChatGPTIcon = lazy(() =>
	import('@/components/icons/content/ChatGPT').then((m) => ({
		default: m.ChatGPTIcon,
	})),
);

const ClaudeIcon = lazy(() =>
	import('@/components/icons/content/Claude').then((m) => ({
		default: m.ClaudeIcon,
	})),
);

type IconProps = React.HTMLAttributes<SVGElement>;
const Icons = {
	v0: (props: IconProps) => <V0Icon {...props} />,
	markdown: (props: IconProps) => <MarkdownIcon {...props} />,
	chatgpt: (props: IconProps) => <ChatGPTIcon {...props} />,
	claude: (props: IconProps) => <ClaudeIcon {...props} />,
};

type ViewOptionsProps = {
	markdownUrl: string;
	isComponent?: boolean;
};

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
				title: 'Voir en Markdown',
				href: fullMarkdownUrl,
				icon: Icons.markdown,
			},
			{
				title: 'Ouvrir dans ChatGPT',
				href: `https://chatgpt.com/?${new URLSearchParams({
					hints: 'search',
					q,
				})}`,
				icon: Icons.chatgpt,
			},
			{
				title: 'Ouvrir dans Claude',
				href: `https://claude.ai/new?${new URLSearchParams({
					q,
				})}`,
				icon: Icons.claude,
			},
		];

		if (isComponent) {
			_items.splice(1, 0, {
				title: 'Ouvrir dans v0',
				href: `https://v0.app/?${new URLSearchParams({
					q,
				})}`,
				icon: Icons.v0,
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
					<span className="sr-only">
						Voir les options de visualisation
					</span>
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
					<DropdownMenuItem
						asChild
						className="font-medium"
						key={href}
					>
						<Link
							href={href}
							rel="noreferrer noopener"
							target="_blank"
						>
							<Icon className="size-4" />
							{title}
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

type LLMCopyButtonWithViewOptionsProps = {
	markdownUrl: string;
	isComponent?: boolean;
};

export const LLMCopyButtonWithViewOptions = ({
	markdownUrl,
	isComponent = false,
}: LLMCopyButtonWithViewOptionsProps) => (
	<div
		className={cn(
			variants({
				size: 'sm',
				variant: 'secondary',
				className: 'gap-0 divide-x px-0 font-sans dark:divide-white/10',
			}),
		)}
	>
		<LLMCopyButton markdownUrl={markdownUrl} />
		<ViewOptions isComponent={isComponent} markdownUrl={markdownUrl} />
	</div>
);
