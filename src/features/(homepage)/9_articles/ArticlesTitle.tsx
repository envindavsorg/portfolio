import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const ArticlesTitle = () => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Mes articles de blog
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

ArticlesTitle.displayName = 'ArticlesTitle';

export { ArticlesTitle };
