import type React from 'react';
import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const CommitsTitle = (): React.JSX.Element => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Mes statistiques GitHub
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

CommitsTitle.displayName = 'CommitsTitle';

export { CommitsTitle };
