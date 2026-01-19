import { memo } from 'react';
import { PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';

const AboutTitle = memo(() => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Quelques mots sur moi ...
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
));

AboutTitle.displayName = 'AboutTitle';

export { AboutTitle };
