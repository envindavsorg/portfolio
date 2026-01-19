import { Panel } from '@/components/Panel';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/utils';
import { ArticlesContent } from './ArticlesContent';
import { ArticlesTitle } from './ArticlesTitle';

const Articles = () => {
	const articles: Post[] = getPostsByCategory('article').sort(
		(a: Post, b: Post) =>
			dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	return (
		<Panel>
			<ArticlesTitle />
			<ArticlesContent content={articles} />
		</Panel>
	);
};

Articles.displayName = 'Articles';

export { Articles };
