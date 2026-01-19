import { PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';

const CvTitle = () => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Découvrir mon CV
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

CvTitle.displayName = 'CurriculumVitaeTitle';

export { CvTitle };
