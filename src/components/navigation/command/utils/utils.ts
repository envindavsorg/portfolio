import type { CommandLinkItem } from '../types/types';

export const postToCommandLinkItem = (post: Post): CommandLinkItem => {
	const category = post.metadata?.category ?? 'article';

	const categoryToRoute: Record<string, string> = {
		components: 'components',
		utils: 'utils',
		article: 'blog',
	};

	return {
		title: post.metadata.title,
		href: `/${categoryToRoute[category] ?? 'blog'}/${post.slug}`,
		keywords: category === 'article' ? undefined : [category],
	};
};
