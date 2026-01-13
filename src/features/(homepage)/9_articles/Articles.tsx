import type React from 'react';
import { Panel } from '@/components/ui/Panel';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/dayjs';
import { ArticlesContent } from './ArticlesContent';
import { ArticlesTitle } from './ArticlesTitle';

const Articles = (): React.JSX.Element => {
	const articles: Post[] = getPostsByCategory('article').sort((a: Post, b: Post) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	return (
		<Panel id="articles">
			<ArticlesTitle />
			<ArticlesContent content={articles} />
		</Panel>
	);
};

Articles.displayName = 'Articles';

export { Articles };
