import { Panel, PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { TECH_STACK } from './content';
import { TechStackContent } from './TechStackContent';

export const TechStack = () => (
	<Panel id="my-stack">
		<PanelHeader>
			<PanelTitle>
				<TextAnimate animation="slideLeft" by="character" delay={0.2}>
					ma stack technique
				</TextAnimate>
			</PanelTitle>
		</PanelHeader>

		<TechStackContent content={TECH_STACK} />
	</Panel>
);
