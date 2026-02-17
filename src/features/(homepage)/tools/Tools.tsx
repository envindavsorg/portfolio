import { Panel, PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { getPostsByCategory } from '@/lib/blog/posts';
import { dayjs } from '@/lib/utils';
import { ToolsContent } from './ToolsContent';

export const Tools = () => {
	const utils: Post[] = getPostsByCategory('utils').sort((a: Post, b: Post) =>
		dayjs(b.metadata.createdAt).diff(dayjs(a.metadata.createdAt))
	);

	return (
		<Panel>
			<PanelHeader>
				<PanelTitle>
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						outils pour développeurs
					</TextAnimate>
				</PanelTitle>
			</PanelHeader>

			<ToolsContent content={utils} />
		</Panel>
	);
};
