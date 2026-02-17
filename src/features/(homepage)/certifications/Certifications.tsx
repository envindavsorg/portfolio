import { Panel, PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { CertificationsContent } from './CertificationsContent';
import { CERTIFICATIONS } from './content';

export const Certifications = () => (
	<Panel>
		<PanelHeader>
			<PanelTitle>
				<TextAnimate animation="slideLeft" by="character" delay={0.2}>
					mes certifications
				</TextAnimate>
			</PanelTitle>
		</PanelHeader>

		<CertificationsContent content={CERTIFICATIONS} />
	</Panel>
);
