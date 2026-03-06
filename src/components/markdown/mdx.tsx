import { FileIcon } from '@phosphor-icons/react/ssr';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type React from 'react';
import rehypeExternalLinks from 'rehype-external-links';
import type { LineElement } from 'rehype-pretty-code';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { CodeBlockCommand } from '@/components/blog/CodeBlockCommand';
import { CodeCollapsibleWrapper } from '@/components/blog/CodeCollapsibleWrapper';
import { ComponentPreview } from '@/components/blog/ComponentPreview';
import { ComponentSource } from '@/components/blog/ComponentSource';
import { CopyButton } from '@/components/primitives/Button';
import { Code, Heading, Prose } from '@/components/primitives/Typography';
import { ArticleBanner } from '@/components/utils/ArticleBannerGenerator';
import { Base64 } from '@/components/utils/Base64';
import { ColorGenerator } from '@/components/utils/ColorGenerator';
import { JSONFormatter } from '@/components/utils/JSONFormatter';
import { LoremIpsumGenerator } from '@/components/utils/LoremIpsumGenerator';
import { SpeedTest } from '@/components/utils/SpeedTest';
import { rehypeAddQueryParams } from '@/lib/rehype-add-query-params';
import { rehypeComponent } from '@/lib/rehype-component';
import { rehypeNpmCommand } from '@/lib/rehype-npm-command';
import { remarkCodeImport } from '@/lib/remark-code-import';
import { cn } from '@/lib/utils';
import { Divider } from '../primitives/Divider';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../primitives/Table';
import { CSSIcon } from '../svgs/stack/CSS';
import { JavaScriptIcon } from '../svgs/stack/JavaScript';
import { JSONIcon } from '../svgs/stack/JSON';
import { ReactIcon } from '../svgs/stack/React';
import { TypeScriptIcon } from '../svgs/stack/TypeScript';

const getIconForLanguageExtension = (language: string) => {
	switch (language) {
		case 'json':
			return <JSONIcon />;
		case 'css':
			return <CSSIcon />;
		case 'js':
			return <JavaScriptIcon />;
		case 'ts':
		case 'typescript':
			return <TypeScriptIcon />;
		case 'jsx':
		case 'tsx':
			return <ReactIcon />;
		default:
			return <FileIcon />;
	}
};

const components: MDXRemoteProps['components'] = {
	h1: (props: React.ComponentProps<'h1'>) => (
		<Heading as="h1" className="scroll-mt-32 text-theme!" {...props} />
	),
	h2: (props: React.ComponentProps<'h2'>) => (
		<Heading as="h2" className="scroll-mt-32" {...props} />
	),
	h3: (props: React.ComponentProps<'h3'>) => <Heading as="h3" {...props} />,
	h4: (props: React.ComponentProps<'h4'>) => <Heading as="h4" {...props} />,
	h5: (props: React.ComponentProps<'h5'>) => <Heading as="h5" {...props} />,
	h6: (props: React.ComponentProps<'h6'>) => <Heading as="h6" {...props} />,
	table: Table,
	thead: TableHeader,
	tbody: TableBody,
	tr: TableRow,
	th: TableHead,
	td: TableCell,
	figure({ className, ...props }: React.ComponentProps<'figure'>) {
		const hasPrettyCode = 'data-rehype-pretty-code-figure' in props;

		return (
			<figure
				className={cn(hasPrettyCode && 'not-prose', className)}
				{...props}
			/>
		);
	},
	figcaption: ({ children, ...props }: React.ComponentProps<'figcaption'>) => {
		const iconExtension =
			'data-language' in props && typeof props['data-language'] === 'string'
				? getIconForLanguageExtension(props['data-language'])
				: null;

		return (
			<figcaption className="flex items-center gap-x-3" {...props}>
				{iconExtension}
				{children}
			</figcaption>
		);
	},
	pre({
		__withMeta__,
		__rawString__,
		__pnpm__,
		__yarn__,
		__npm__,
		__bun__,
		...props
	}: React.ComponentProps<'pre'> & {
		__withMeta__?: boolean;
		__rawString__?: string;
	} & {
		__pnpm__?: string;
		__yarn__?: string;
		__npm__?: string;
		__bun__?: string;
	}) {
		const isNpmCommand = __pnpm__ && __yarn__ && __npm__ && __bun__;
		if (isNpmCommand) {
			return (
				<CodeBlockCommand
					__bun__={__bun__}
					__npm__={__npm__}
					__pnpm__={__pnpm__}
					__yarn__={__yarn__}
				/>
			);
		}

		return (
			<div className="rounded-md border border-input">
				<pre {...props} />

				{__rawString__ && (
					<CopyButton
						className="absolute top-1 right-0"
						value={__rawString__}
						variant="ghost"
					/>
				)}
			</div>
		);
	},
	code: Code,
	ComponentPreview,
	ComponentSource,
	CodeCollapsibleWrapper,
	Base64Utils: Base64,
	ColorGeneratorUtils: ColorGenerator,
	LoremIpsumGeneratorUtils: LoremIpsumGenerator,
	InternetSpeedTestUtils: SpeedTest,
	JSONFormatterUtils: JSONFormatter,
	ArticleBannerUtils: ArticleBanner,
};

const options: MDXRemoteProps['options'] = {
	mdxOptions: {
		remarkPlugins: [remarkGfm, remarkCodeImport],
		rehypePlugins: [
			[
				rehypeExternalLinks,
				{ target: '_blank', rel: 'nofollow noopener noreferrer' },
			],
			rehypeSlug,
			rehypeComponent,
			() => (tree) => {
				visit(tree, (node) => {
					if (node?.type === 'element' && node?.tagName === 'pre') {
						const [codeEl] = node.children;
						if (codeEl.tagName !== 'code') {
							return;
						}

						node.__rawString__ = codeEl.children?.[0].value;
					}
				});
			},
			[
				rehypePrettyCode,
				{
					theme: {
						dark: 'github-dark',
						light: 'github-light',
					},
					keepBackground: false,
					onVisitLine(node: LineElement) {
						if (node.children.length === 0) {
							node.children = [{ type: 'text', value: ' ' }];
						}
					},
				},
			],
			() => (tree) => {
				visit(tree, (node) => {
					if (node?.type === 'element' && node?.tagName === 'figure') {
						if (!('data-rehype-pretty-code-figure' in node.properties)) {
							return;
						}

						const preElement = node.children.at(-1);
						if (preElement.tagName !== 'pre') {
							return;
						}

						preElement.properties.__withMeta__ =
							node.children.at(0).tagName === 'figcaption';
						preElement.properties.__rawString__ = node.__rawString__;
					}
				});
			},
			rehypeNpmCommand,
			[rehypeAddQueryParams],
		],
	},
};

interface MDXProps {
	code: string;
	isDivider?: boolean;
}

export const MDX = ({ code, isDivider = true }: MDXProps) => (
	<>
		<Prose className="px-2 sm:px-4">
			<MDXRemote components={components} options={options} source={code} />
		</Prose>

		{isDivider && <Divider border={false} />}
	</>
);
