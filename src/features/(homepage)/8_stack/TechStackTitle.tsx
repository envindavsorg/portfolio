import type React from 'react';
import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const TechStackTitle = (): React.JSX.Element => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Ma stack technique
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

TechStackTitle.displayName = 'TechStackTitle';

export { TechStackTitle };
