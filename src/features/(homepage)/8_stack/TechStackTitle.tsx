import { PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';

const TechStackTitle = () => (
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
