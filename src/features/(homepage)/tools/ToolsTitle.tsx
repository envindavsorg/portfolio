import type React from 'react';
import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const ToolsTitle = (): React.JSX.Element => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Outils gratuits pour développeurs
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

ToolsTitle.displayName = 'ToolsTitle';

export { ToolsTitle };
