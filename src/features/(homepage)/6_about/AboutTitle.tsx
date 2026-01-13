import type React from 'react';
import { memo } from 'react';
import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const AboutTitle = memo(
	(): React.JSX.Element => (
		<PanelHeader>
			<PanelTitle>
				<TextAnimate animation="slideLeft" by="character" delay={0.2}>
					Quelques mots sur moi ...
				</TextAnimate>
			</PanelTitle>
		</PanelHeader>
	)
);

AboutTitle.displayName = 'AboutTitle';

export { AboutTitle };
