import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import { Index } from '@/__registry__';
import { logger } from './logger';

const getNodeAttributeByName = (node: UnistNode, name: string) =>
	node.attributes?.find((attribute) => attribute.name === name);

export const remarkComponent = () => async (tree: UnistTree) => {
	visit(tree, (node: UnistNode, index, parent) => {
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

				const codeBlock = {
					type: 'code',
					meta: [
						title ? `title="${title.value}"` : '',
						showLineNumbers ? 'showLineNumbers' : '',
					].join(' '),
					lang: path.extname(filePath).slice(1),
					value: source,
				};

				if (parent && typeof index === 'number') {
					parent.children.splice(index, 1, codeBlock);
				}
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

				const codeBlock = {
					type: 'code',
					lang: 'tsx',
					value: source,
				};

				if (parent && typeof index === 'number') {
					parent.children.splice(index, 1, codeBlock);
				}
			} catch (error) {
				logger.error(error);
			}
		}
	});
};
