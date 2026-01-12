import type { IconProps } from '@phosphor-icons/react';
import {
	GaugeIcon,
	PaletteIcon,
	TableIcon,
	TextTIcon,
	VaultIcon,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import type React from 'react';
import { memo } from 'react';
import { AnimatedDot } from '@/components/animations/AnimatedDot';

const TOOLS_ICONS = {
	Base64: VaultIcon,
	Couleurs: PaletteIcon,
	Texte: TextTIcon,
	Internet: GaugeIcon,
	Json: TableIcon,
} as const;

const getIconForUtilsTags = (tags?: string[]): React.ComponentType<IconProps> | null => {
	const tag = tags?.find((t: string) => t in TOOLS_ICONS);
	return tag ? TOOLS_ICONS[tag as keyof typeof TOOLS_ICONS] : null;
};

const getShortDescription = (desc = '') => {
	return desc.match(/^.*?[.!?](?:\s|$)/)?.[0] || desc;
};

interface ToolsItemProps {
	post: Post;
}

export const ToolItem = memo(({ post }: ToolsItemProps): React.JSX.Element => {
	const { metadata, slug } = post;
	const { title, tags, new: isNew, description } = metadata;

	const Icon = getIconForUtilsTags(tags);
	const shortDescription = getShortDescription(description);

	return (
		<Link aria-label={title} href={`/utils/${slug}`} prefetch={false}>
			<article className="screen-line-after flex items-center hover:bg-accent2">
				<div className="m-3 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
					{Icon && <Icon className="pointer-events-none size-7" />}
				</div>

				<div className="flex w-full flex-1 cursor-pointer select-none items-center gap-4 border-edge border-l p-3 text-left">
					<div className="flex flex-1 flex-col gap-y-1">
						<div className="flex items-center gap-x-3">
							{isNew && <AnimatedDot label="Poste actuellement occupé" />}
							<h2 className="text-balance font-semibold text-base">{title}</h2>
						</div>

						<p className="text-muted-foreground text-xs max-sm:hidden">{shortDescription}</p>
					</div>
				</div>
			</article>
		</Link>
	);
});
