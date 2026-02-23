import { Divider } from '@/components/primitives/Divider';
import { Panel, PanelHeader } from '@/components/primitives/Panel';
import { BrandingColors } from './BrandingColors';
import { BrandingMark } from './BrandingMark';

export const Branding = () => (
	<Panel>
		<PanelHeader sticky title="mon branding" />

		<div className="grid grid-cols-[2rem_1fr]">
			<div className="flex items-center justify-center border-edge border-r bg-background sm:h-26">
				<span className="rotate-270 select-none text-muted-foreground text-sm">
					assets
				</span>
			</div>

			<BrandingMark />
		</div>
		<Divider border={false} type="half" />
		<div className="grid grid-cols-[2rem_1fr]">
			<div className="flex items-center justify-center border-edge border-r bg-background sm:h-26">
				<span className="rotate-270 select-none text-muted-foreground text-sm">
					couleurs
				</span>
			</div>

			<BrandingColors />
		</div>
	</Panel>
);
