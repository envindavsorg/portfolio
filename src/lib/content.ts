import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { z } from 'zod';
import { remarkComponent } from '@/lib/remark-component';
import { dayjs } from '@/lib/utils';

const contentMetadataSchema = z.object({
	title: z.string(),
	description: z.string(),
	image: z.string().optional(),
	bannerLight: z.string().optional(),
	bannerDark: z.string().optional(),
	category: z.enum(['articles', 'utils', 'components']).optional(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	tags: z.array(z.string()).optional(),
	author: z.string().optional(),
	isNew: z.boolean().optional(),
});

export type ContentMetadata = z.infer<typeof contentMetadataSchema>;
export type ContentCategory = NonNullable<ContentMetadata['category']>;

export interface Content {
	metadata: ContentMetadata;
	slug: string;
	content: string;
	reading: {
		time: string;
		words: number;
	};
}

const parseFrontmatter = (body: string) => {
	const { data, content } = matter(body);
	return { metadata: contentMetadataSchema.parse(data), content };
};

const getMDXFiles = (dir: string) =>
	readdirSync(dir).filter((file: string) => file.endsWith('.mdx'));

const readMDXFile = (path: string) => {
	const raw = readFileSync(path, 'utf-8');
	return parseFrontmatter(raw);
};

const WORDS_PER_MINUTE = 150;
const readingTime = (content: string) => {
	const words = content.trim().split(/\s+/).length;
	const minutes = Math.ceil(words / WORDS_PER_MINUTE);
	return { time: `${minutes} minutes`, words };
};

const getMDXData = (dir: string) =>
	getMDXFiles(dir).map<Content>((file) => {
		const { metadata, content } = readMDXFile(join(dir, file));
		const { time, words } = readingTime(content);
		return {
			metadata,
			slug: basename(file, '.mdx'),
			content,
			reading: { time, words },
		};
	});

let contentCache: Content[] | null = null;
const CONTENT_PATH = 'src/content';
export const getAllContent = () => {
	if (contentCache) {
		return contentCache;
	}

	contentCache = getMDXData(join(process.cwd(), CONTENT_PATH)).sort(
		(a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
	);

	return contentCache;
};

export const getContentBySlug = (slug: string) =>
	getAllContent().find((content) => content.slug === slug);

export const getContentByCategory = (category: ContentCategory) =>
	getAllContent().filter((content) => content.metadata.category === category);

const processor = remark().use(remarkMdx).use(remarkComponent).use(remarkGfm);
export const getLLMText = async (content: Content): Promise<string> => {
	const processed = await processor.process({ value: content.content });
	return `# ${content.metadata.title}
${content.metadata.description}
${processed.value}
Dernière mise à jour le ${dayjs(content.metadata.updatedAt).format('dddd DD MMMM YYYY')}`;
};
