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
import { Prose } from '@/components/ui/Typography';

const TOOLS_ICONS = {
	Base64: VaultIcon,
	Couleurs: PaletteIcon,
	Texte: TextTIcon,
	Internet: GaugeIcon,
	Json: TableIcon,
} as const;

const getIconForUtilsTags = (
	tags?: string[]
): React.ComponentType<IconProps> | null => {
	const tag = tags?.find((t: string) => t in TOOLS_ICONS);
	return tag ? TOOLS_ICONS[tag as keyof typeof TOOLS_ICONS] : null;
};

const getShortDescription = (desc = '') => {
	return desc.match(/^.*?[.!?](?:\s|$)/)?.[0] || desc;
};

interface ToolsItemProps {
	post: Post;
}

export const ToolItem = memo(({ post }: ToolsItemProps) => {
	const { metadata, slug } = post;
	const { title, tags, new: isNew, description } = metadata;

	const Icon = getIconForUtilsTags(tags);
	const shortDescription = getShortDescription(description);

	return (
		<Link aria-label={title} href={`/utils/${slug}`} prefetch={false}>
			<article className="screen-line-after flex items-center hover:bg-accent2">
				<div className="m-4 hidden aspect-square size-8 shrink-0 cursor-default items-center justify-center sm:flex">
					{Icon && (
						<Icon
							className="pointer-events-none size-8 text-theme"
							weight="duotone"
						/>
					)}
				</div>

				<div className="flex w-full flex-1 cursor-pointer select-none items-center gap-4 border-edge p-3 text-left sm:border-l">
					<div className="flex flex-1 flex-col gap-y-1">
						<div className="flex items-center gap-x-3">
							{isNew && (
								<span className="relative flex items-center justify-center">
									<span className="absolute inline-flex size-3 animate-ping rounded-full bg-theme opacity-50" />
									<span className="relative inline-flex size-2 rounded-full bg-theme" />
								</span>
							)}

							<h2 className="text-balance font-semibold text-lg lowercase sm:text-xl">
								{title}
							</h2>
						</div>

						<Prose className="lowercase sm:max-w-xl">
							-- {shortDescription} --
						</Prose>
					</div>
				</div>
			</article>
		</Link>
	);
});
