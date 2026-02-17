import { Panel, PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/utils';
import { ArticlesContent } from './ArticlesContent';

export const Articles = () => {
	const articles: Post[] = getPostsByCategory('article').sort((a, b) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	return (
		<Panel>
			<PanelHeader>
				<PanelTitle>
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						mes articles de blog
					</TextAnimate>
				</PanelTitle>
			</PanelHeader>

			<ArticlesContent content={articles} />
		</Panel>
	);
};
