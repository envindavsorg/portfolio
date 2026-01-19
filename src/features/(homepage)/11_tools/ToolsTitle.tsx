import { PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';

const ToolsTitle = () => (
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
