import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const ExperiencesTitle = () => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Mes expériences
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

ExperiencesTitle.displayName = 'ExperiencesTitle';

export { ExperiencesTitle };
