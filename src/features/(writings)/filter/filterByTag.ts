// features/(writings)/filterByTag.ts
import type { Post } from '@/lib/blog/posts';

interface TagFilterResult {
	tags: string[];
	tagCounts: Record<string, number>;
	filtered: Post[];
	selectedTag: string;
}

export const filterByTag = (posts: Post[], tag?: string): TagFilterResult => {
	const tagCounts: Record<string, number> = {
		tout: posts.length,
	};

	for (const post of posts) {
		for (const tagName of post.metadata.tags || []) {
			tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
		}
	}

	const tags = [
		'tout',
		...Object.keys(tagCounts)
			.filter((k) => k !== 'tout')
			.sort(),
	];

	const normalizedTag = tag?.toLowerCase();
	const filtered =
		!normalizedTag || normalizedTag === 'tout'
			? posts
			: posts.filter((post) =>
					post.metadata.tags?.some((t) => t.toLowerCase() === normalizedTag)
				);

	return { tags, tagCounts, filtered, selectedTag: tag || 'tout' };
};
