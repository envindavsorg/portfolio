import { Panel, PanelHeader, PanelTitle } from '@/components/primitives/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { BrandingColors } from './BrandingColors';
import { BrandingMark } from './BrandingMark';

const Branding = () => (
	<Panel>
		<PanelHeader>
			<PanelTitle>
				<TextAnimate animation="slideLeft" by="character" delay={0.2}>
					mon branding
				</TextAnimate>
			</PanelTitle>
		</PanelHeader>

		<div className="grid grid-cols-[2rem_1fr]">
			<div className="flex items-center justify-center border-edge border-r bg-background sm:h-26">
				<span className="rotate-270 select-none text-muted-foreground text-sm">
					Assets
				</span>
			</div>

			<BrandingMark />

			<div className="flex items-center justify-center border-edge border-r bg-background sm:h-26">
				<span className="rotate-270 select-none text-muted-foreground text-sm">
					Couleurs
				</span>
			</div>

			<BrandingColors />
		</div>
	</Panel>
);

Branding.displayName = 'Branding';

export { Branding };
