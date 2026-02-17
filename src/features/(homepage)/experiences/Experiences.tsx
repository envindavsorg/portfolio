import { Panel, PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { EXPERIENCES } from './content';
import { ExperiencesContent } from './ExperiencesContent';

export const Experiences = () => (
	<Panel id="my-experiences">
		<PanelHeader>
			<PanelTitle>
				<TextAnimate animation="slideLeft" by="character" delay={0.2}>
					mes expériences pro
				</TextAnimate>
			</PanelTitle>
		</PanelHeader>

		<ExperiencesContent content={EXPERIENCES} />
	</Panel>
);
