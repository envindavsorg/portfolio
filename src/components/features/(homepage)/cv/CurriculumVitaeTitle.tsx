import type React from 'react';
import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const CurriculumVitaeTitle = (): React.JSX.Element => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Découvrir mon CV
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

CurriculumVitaeTitle.displayName = 'CVTitle';

export { CurriculumVitaeTitle };
