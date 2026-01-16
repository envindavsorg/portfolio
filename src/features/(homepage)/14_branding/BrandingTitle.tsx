import { PanelHeader, PanelTitle } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

const BrandingTitle = () => (
	<PanelHeader>
		<PanelTitle>
			<TextAnimate animation="slideLeft" by="character" delay={0.2}>
				Branding
			</TextAnimate>
		</PanelTitle>
	</PanelHeader>
);

BrandingTitle.displayName = 'BrandingTitle';

export { BrandingTitle };
