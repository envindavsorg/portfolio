import { CopyButton } from '@/components/primitives/Button';
import { cn } from '@/lib/utils';

const BRANDING_COLORS = [
	{
		label: 'couleur principale',
		hex: '#F3B993',
	},
	{
		label: 'couleur secondaire',
		hex: '#FAD7C1',
	},
] as const;

export const BrandingColors = () => (
	<div
		className={cn(
			'flex items-center justify-evenly',
			'px-8 after:z-1 max-sm:flex-col max-sm:gap-y-4 max-sm:py-4'
		)}
	>
		{BRANDING_COLORS.map(({ label, hex }) => (
			<div className="flex items-center gap-x-6" key={hex}>
				<div
					className="aspect-square size-12 rounded-lg"
					style={{ backgroundColor: hex }}
				/>
				<div className="flex flex-col gap-y-1">
					<p className="text-muted-foreground text-xs leading-snug">{label}</p>
					<p className="font-medium text-sm">{hex}</p>
				</div>
				<CopyButton className="ms-3" value={hex} />
			</div>
		))}
	</div>
);
