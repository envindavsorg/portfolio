import { PanelHeader, PanelTitle } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';

const CertificationsTitle = () => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Mes certifications
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

CertificationsTitle.displayName = 'CertificationsTitle';

export { CertificationsTitle };
