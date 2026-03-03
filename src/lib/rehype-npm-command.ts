import { visit } from 'unist-util-visit';
import type { UnistNode, UnistTree } from './remark-code-import';

interface CommandMapping {
	prefix: string;
	pnpm: string;
	yarn: string;
	bun: string;
	replace: 'all' | 'first';
}

const COMMAND_MAPPINGS: CommandMapping[] = [
	{
		prefix: 'npm install',
		pnpm: 'pnpm add',
		yarn: 'yarn add',
		bun: 'bun add',
		replace: 'all',
	},
	{
		prefix: 'npx create-',
		pnpm: 'pnpm create ',
		yarn: 'yarn create ',
		bun: 'bunx --bun create-',
		replace: 'first',
	},
	{
		prefix: 'npm create',
		pnpm: 'pnpm create',
		yarn: 'yarn create',
		bun: 'bun create',
		replace: 'first',
	},
	{
		prefix: 'npx',
		pnpm: 'pnpm dlx',
		yarn: 'npx',
		bun: 'bunx --bun',
		replace: 'first',
	},
	{
		prefix: 'npm run',
		pnpm: 'pnpm',
		yarn: 'yarn',
		bun: 'bun',
		replace: 'first',
	},
];

const applyMapping = (command: string, mapping: CommandMapping) => {
	const transform =
		mapping.replace === 'all'
			? (cmd: string, from: string, to: string) => cmd.replaceAll(from, to)
			: (cmd: string, from: string, to: string) => cmd.replace(from, to);

	return {
		__npm__: command,
		__pnpm__: transform(command, mapping.prefix, mapping.pnpm),
		__yarn__: transform(command, mapping.prefix, mapping.yarn),
		__bun__: transform(command, mapping.prefix, mapping.bun),
	};
};

export const rehypeNpmCommand = () => (tree: UnistTree) => {
	visit(tree, (node: UnistNode) => {
		if (node.type !== 'element' || node.tagName !== 'pre' || !node.properties) {
			return;
		}

		const rawString = node.properties.__rawString__ as string | undefined;
		if (!rawString) {
			return;
		}

		const mapping = COMMAND_MAPPINGS.find((m) => rawString.startsWith(m.prefix));
		if (!mapping) {
			return;
		}

		Object.assign(node.properties, applyMapping(rawString, mapping));
	});
};
