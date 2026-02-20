import { Panel, PanelHeader, PanelTitle } from '@/components/primitives/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { PROJECTS } from './content';
import { ProjectsContent } from './ProjectsContent';

export const Projects = () => (
	<Panel id="my-projects">
		<PanelHeader>
			<PanelTitle>
				<TextAnimate animation="slideLeft" by="character" delay={0.2}>
					mes différents projets
				</TextAnimate>
			</PanelTitle>
		</PanelHeader>

		<ProjectsContent content={PROJECTS} />
	</Panel>
);
