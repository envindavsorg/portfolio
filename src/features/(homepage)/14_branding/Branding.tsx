import { Panel } from '@/components/Panel';
import { BrandingColors } from './BrandingColors';
import { BrandingMark } from './BrandingMark';
import { BrandingTitle } from './BrandingTitle';

const Branding = () => (
	<Panel>
		<BrandingTitle />

		<div className="grid grid-cols-[2rem_1fr]">
			<div className="flex h-26 items-center justify-center border-edge border-r bg-background">
				<span className="rotate-270 select-none text-muted-foreground text-sm">
					Assets
				</span>
			</div>

			<BrandingMark />

			<div className="flex h-26 items-center justify-center border-edge border-r bg-background">
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
