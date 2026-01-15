import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import matter from 'gray-matter';
import { readingTime } from '@/lib/blog/read';

const parseFrontmatter = (fileContent: string) => {
	const file = matter(fileContent);

	return {
		metadata: file.data as PostMetadata,
		content: file.content,
	};
};

const getMDXFiles = (dir: string) => readdirSync(dir).filter((file) => extname(file) === '.mdx');

const readMDXFile = (filePath: string) => {
	const rawContent = readFileSync(filePath, 'utf-8');
	return parseFrontmatter(rawContent);
};

const getMDXData = (dir: string) => {
	const mdxFiles = getMDXFiles(dir);

	return mdxFiles.map<Post>((file) => {
		const { metadata, content } = readMDXFile(join(dir, file));
		const { time, words } = readingTime(content);
		const slug = basename(file, extname(file));

		return {
			metadata,
			slug,
			content,
			reading: {
				time,
				words,
			},
		};
	});
};

export const getAllPosts = () =>
	getMDXData(join(process.cwd(), 'src/content')).sort(
		(a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
	);

export const getPostBySlug = (slug: string) => getAllPosts().find((post) => post.slug === slug);

type PageType = 'article' | 'utils' | 'components';
export const getPostsByCategory = (category: PageType) =>
	getAllPosts().filter((post) => post.metadata?.category === category);

export const findNeighbour = (posts: Post[], slug: string) => {
	const len = posts.length;

	for (let i = 0; i < len; ++i) {
		if (posts[i].slug === slug) {
			return {
				previous: i > 0 ? posts[i - 1] : null,
				next: i < len - 1 ? posts[i + 1] : null,
			};
		}
	}

	return {
		previous: null,
		next: null,
	};
};
