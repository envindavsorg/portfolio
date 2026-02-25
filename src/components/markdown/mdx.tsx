import { FileIcon, WrenchIcon } from '@phosphor-icons/react/ssr';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type React from 'react';
import type { ComponentProps } from 'react';
import rehypeExternalLinks from 'rehype-external-links';
import type { LineElement } from 'rehype-pretty-code';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { CodeBlockCommand } from '@/app/(content)/(writings)/_components/CodeBlockCommand';
import { CodeCollapsibleWrapper } from '@/app/(content)/(writings)/_components/CodeCollapsibleWrapper';
import { CodeTabs } from '@/app/(content)/(writings)/_components/CodeTabs';
import { ComponentPreview } from '@/app/(content)/(writings)/_components/ComponentPreview';
import { ComponentSource } from '@/app/(content)/(writings)/_components/ComponentSource';
import { Base64 } from '@/app/(content)/(writings)/_components/utils/Base64';
import { ColorGenerator } from '@/app/(content)/(writings)/_components/utils/ColorGenerator';
import { JSONFormatter } from '@/app/(content)/(writings)/_components/utils/JSONFormatter';
import { LoremIpsumGenerator } from '@/app/(content)/(writings)/_components/utils/LoremIpsumGenerator';
import { SpeedTest } from '@/app/(content)/(writings)/_components/utils/SpeedTest';
import { CopyButton } from '@/components/primitives/Button';
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/primitives/Tabs';
import { Code, Heading } from '@/components/primitives/Typography';
import { rehypeAddQueryParams } from '@/lib/rehype-add-query-params';
import { rehypeComponent } from '@/lib/rehype-component';
import { rehypeNpmCommand } from '@/lib/rehype-npm-command';
import { remarkCodeImport } from '@/lib/remark-code-import';
import { cn } from '@/lib/utils';
import { CSSIcon } from '../blocks/icons/stack/CSS';
import { JavaScriptIcon } from '../blocks/icons/stack/JavaScript';
import { JSONIcon } from '../blocks/icons/stack/JSON';
import { ReactIcon } from '../blocks/icons/stack/React';
import { ShadcnIcon } from '../blocks/icons/stack/Shadcn';
import { TypeScriptIcon } from '../blocks/icons/stack/TypeScript';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../primitives/Table';

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
	h1: (props: React.ComponentProps<'h1'>) => <Heading as="h1" {...props} />,
	h2: (props: React.ComponentProps<'h2'>) => <Heading as="h2" {...props} />,
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
			<figcaption {...props}>
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
						className="absolute top-3 right-3"
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
	CodeTabs,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	TabsListInstallType: () => (
		<TabsList>
			<TabsTrigger value="cli">
				<ShadcnIcon />
				avec le CLI shadcn
			</TabsTrigger>

			<TabsTrigger value="manual">
				<WrenchIcon />
				manuellement
			</TabsTrigger>
		</TabsList>
	),
	Base64Utils: Base64,
	ColorGeneratorUtils: ColorGenerator,
	LoremIpsumGeneratorUtils: LoremIpsumGenerator,
	InternetSpeedTestUtils: SpeedTest,
	JSONFormatterUtils: JSONFormatter,
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

export const MDX = ({ code }: { code: string }) => (
	<MDXRemote components={components} options={options} source={code} />
);
