import fs from 'node:fs';
import path from 'node:path';
import { u } from 'unist-builder';
import { visit } from 'unist-util-visit';
import { Index } from '@/__registry__';
import { logger } from './logger';

const getNodeAttributeByName = (node: UnistNode, name: string) =>
	node.attributes?.find((attribute) => attribute.name === name);

export const rehypeComponent = () => async (tree: UnistTree) => {
	visit(tree, (node: UnistNode) => {
		const { value: srcPath } =
			(getNodeAttributeByName(node, 'src') as {
				name: string;
				value?: string;
				type?: string;
			}) || {};

		if (node.name === 'ComponentSource') {
			const name = getNodeAttributeByName(node, 'name')?.value as string;
			const fileName = getNodeAttributeByName(node, 'fileName')?.value as
				| string
				| undefined;

			if (!(name || srcPath)) {
				return null;
			}

			try {
				let src: string;

				if (srcPath) {
					src = path.join(process.cwd(), srcPath);
				} else {
					const component = Index[name];
					src = fileName
						? component.files.find((file: unknown) => {
								if (typeof file === 'string') {
									return (
										file.endsWith(`${fileName}.tsx`) ||
										file.endsWith(`${fileName}.ts`)
									);
								}
								return false;
							}) || component.files[0]?.path
						: component.files[0]?.path;
				}

				const filePath = src;
				let source = fs.readFileSync(filePath, 'utf8');

				source = source.replaceAll('@/registry/', '@/components/');
				source = source.replaceAll('export default', 'export');

				const title = getNodeAttributeByName(node, 'title');
				const showLineNumbers = getNodeAttributeByName(node, 'showLineNumbers');

				node.children?.push(
					u('element', {
						tagName: 'pre',
						properties: {},
						children: [
							u('element', {
								tagName: 'code',
								properties: {
									className: [`language-${path.extname(filePath).slice(1)}`],
								},
								data: {
									meta: [
										title ? `title="${title.value}"` : '',
										showLineNumbers ? 'showLineNumbers' : '',
									].join(' '),
								},
								children: [
									{
										type: 'text',
										value: source,
									},
								],
							}),
						],
					})
				);
			} catch (error) {
				logger.error(error);
			}
		}

		if (node.name === 'ComponentPreview') {
			const name = getNodeAttributeByName(node, 'name')?.value as string;

			if (!name) {
				return null;
			}

			try {
				const component = Index[name];

				const filePath = component.files[0]?.path;
				let source = fs.readFileSync(filePath, 'utf8');

				source = source.replaceAll('@/registry/', '@/components/');
				source = source.replaceAll('export default', 'export');

				node.children?.push(
					u('element', {
						tagName: 'pre',
						properties: {},
						children: [
							u('element', {
								tagName: 'code',
								properties: {
									className: ['language-tsx'],
								},
								data: {
									meta: 'showLineNumbers',
								},
								children: [
									{
										type: 'text',
										value: source,
									},
								],
							}),
						],
					})
				);
			} catch (error) {
				logger.error(error);
			}
		}
	});
};
