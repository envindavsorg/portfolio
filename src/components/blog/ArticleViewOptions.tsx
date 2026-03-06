'use client';

import Link from 'next/link';
import {
	type HTMLAttributes,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Rabbit } from '@/components/motion/Rabbit';
import { X } from '@/components/motion/X';
import { Button } from '@/components/primitives/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/primitives/DropdownMenu';
import { ChatGPT } from '@/components/svgs/chatgpt';
import { Claude } from '@/components/svgs/claude';
import { Markdown } from '@/components/svgs/markdown';
import { V0 } from '@/components/svgs/v0';
import { getPrompt } from '@/lib/functions';

const preventAutoFocus = (event: Event) => event.preventDefault();

type IconProps = HTMLAttributes<SVGElement>;

const Icons: Record<string, (props: IconProps) => ReactNode> = {
	v0: (props) => <V0 {...props} />,
	markdown: (props) => <Markdown {...props} />,
	chatgpt: (props) => <ChatGPT {...props} />,
	claude: (props) => <Claude {...props} />,
};

interface ArticleViewOptionsProps {
	markdownUrl: string;
	isComponent?: boolean;
	className?: string;
}

export const ArticleViewOptions = ({
	markdownUrl,
	isComponent = false,
}: ArticleViewOptionsProps) => {
	const [origin, setOrigin] = useState('');

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	const items = useMemo(() => {
		const fullMarkdownUrl = origin
			? new URL(markdownUrl, origin).toString()
			: markdownUrl;
		const q = getPrompt(fullMarkdownUrl, isComponent ? 'component' : 'general');

		const result = [
			{
				title: 'voir en Markdown',
				href: fullMarkdownUrl,
				icon: Icons.markdown,
			},
			...(isComponent
				? [
						{
							title: 'ouvrir dans v0',
							href: `https://v0.app/?${new URLSearchParams({ q })}`,
							icon: Icons.v0,
						},
					]
				: []),
			{
				title: 'ouvrir dans ChatGPT',
				href: `https://chatgpt.com/?${new URLSearchParams({ hints: 'search', q })}`,
				icon: Icons.chatgpt,
			},
			{
				title: 'ouvrir dans Claude',
				href: `https://claude.ai/new?${new URLSearchParams({ q })}`,
				icon: Icons.claude,
			},
		];

		return result;
	}, [markdownUrl, isComponent, origin]);

	const iconRabbitRef = useRef<AnimatedIconHandle>(null);
	const iconCloseRef = useRef<AnimatedIconHandle>(null);

	const handleMouseEnter = useCallback(() => {
		iconRabbitRef.current?.startAnimation();
		iconCloseRef.current?.startAnimation();
	}, []);

	const handleMouseLeave = useCallback(() => {
		iconRabbitRef.current?.stopAnimation();
		iconCloseRef.current?.stopAnimation();
	}, []);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="group/toggle"
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					size="icon"
					variant="outline"
				>
					<Rabbit
						className="group-data-[state=open]/toggle:hidden"
						ref={iconRabbitRef}
					/>
					<X
						className="group-data-[state=closed]/toggle:hidden"
						ref={iconCloseRef}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-fit py-2 *:cursor-pointer"
				collisionPadding={8}
				onCloseAutoFocus={preventAutoFocus}
				sideOffset={8}
			>
				{items.map(({ title, href, icon: Icon }) => (
					<DropdownMenuItem asChild className="lowercase" key={href}>
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
