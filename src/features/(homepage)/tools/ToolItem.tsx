import type { IconProps } from '@phosphor-icons/react';
import {
	GaugeIcon,
	PaletteIcon,
	SlidersIcon,
	TextTIcon,
	VaultIcon,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import type React from 'react';
import { memo } from 'react';
import { PulsatingCircle } from '@/components/animations/PulsatingCircle';

const TOOLS_ICONS: Record<string, React.ComponentType<IconProps>> = {
	Base64: VaultIcon,
	Couleurs: PaletteIcon,
	Texte: TextTIcon,
	Internet: GaugeIcon,
	Json: SlidersIcon,
};

interface ToolsItemProps {
	tool: Post;
}

export const ToolItem = memo(({ tool }: ToolsItemProps) => {
	const { metadata, slug } = tool;
	const Icon = metadata.tags?.find((tag) => tag in TOOLS_ICONS)
		? TOOLS_ICONS[metadata.tags.find((tag) => tag in TOOLS_ICONS) as string]
		: null;

	return (
		<Link aria-label={metadata.title} href={`/utils/${slug}`} prefetch={false}>
			<article className="screen-line-after flex items-center hover:bg-accent2">
				<div className="flex w-full flex-1 items-center">
					<div className="m-4 flex size-8 shrink-0 cursor-default items-center justify-center">
						{Icon && <Icon className="size-8 text-theme" />}
					</div>
					<div className="w-full cursor-pointer select-none border-edge border-l p-4">
						<div className="flex items-center justify-between [&_h2]:font-pixel-square [&_h2]:lowercase">
							<h2 className="text-lg sm:text-xl">{metadata.title}</h2>
							{metadata.isNew && <PulsatingCircle />}
						</div>
					</div>
				</div>
			</article>
		</Link>
	);
});
