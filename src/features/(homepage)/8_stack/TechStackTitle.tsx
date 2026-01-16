import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

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
