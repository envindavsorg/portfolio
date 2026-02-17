import { CopyButton } from '@/components/buttons/CopyButton';

const BRANDING_COLORS = {
	primary: '#F3B993',
	secondary: '#FAD7C1',
};

export const BrandingColors = () => (
	<div className="screen-line-after flex items-center justify-evenly px-8 after:z-1 max-sm:flex-col max-sm:gap-y-4 max-sm:py-4">
		<div className="flex items-center gap-x-6">
			<div className="aspect-square size-12 rounded-md bg-[#F3B993]" />
			<div className="flex flex-col gap-y-1">
				<p className="text-muted-foreground text-xs leading-snug">
					Couleur principale
				</p>
				<p className="font-medium text-sm">{BRANDING_COLORS.primary}</p>
			</div>

			<CopyButton className="ms-3" value={BRANDING_COLORS.primary} />
		</div>

		<div className="flex items-center gap-x-6">
			<div className="aspect-square size-12 rounded-md bg-[#FAD7C1]" />
			<div className="flex flex-col gap-y-1">
				<p className="text-muted-foreground text-xs leading-snug">
					Couleur secondaire
				</p>
				<p className="font-medium text-sm">{BRANDING_COLORS.secondary}</p>
			</div>

			<CopyButton className="ms-3" value={BRANDING_COLORS.secondary} />
		</div>
	</div>
);
