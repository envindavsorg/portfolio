import type React from 'react';
import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const ProjectsTitle = (): React.JSX.Element => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Mes différents projets
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

ProjectsTitle.displayName = 'ProjectsTitle';

export { ProjectsTitle };
