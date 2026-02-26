import Link from 'next/link';
import { memo } from 'react';
import { DotPattern } from '@/components/blocks/DotPattern';
import { Badge } from '@/components/primitives/Badge';
import { Divider } from '@/components/primitives/Divider';
import { PulsatingCircle } from '@/components/primitives/PulsatingCircle';
import { Prose } from '@/components/primitives/Typography';
import type { Content } from '@/lib/content';
import { dayjs } from '@/lib/functions';
import { TOOLS_ICONS } from './content';

interface ToolItemProps {
	tool: Content;
	isLast?: boolean;
	isDescription?: boolean;
}

export const ToolItem = memo(
	({ tool, isLast = false, isDescription = false }: ToolItemProps) => {
		const { metadata, slug } = tool;
		const Icon = metadata.tags?.find((tag) => tag in TOOLS_ICONS)
			? TOOLS_ICONS[metadata.tags.find((tag) => tag in TOOLS_ICONS) as string]
			: null;

		return (
			<Link
				aria-label={metadata.title}
				href={`/utils/${slug}`}
				prefetch={false}
			>
				<article className="screen-line-before flex items-center hover:bg-accent2">
					<div className="flex w-full flex-1 items-center">
						<div className="relative m-4 flex size-6 shrink-0 cursor-default items-center justify-center sm:size-8">
							{Icon && <Icon aria-hidden="true" className="size-6 sm:size-8" />}
							<DotPattern
								className="-z-10 text-theme opacity-20"
								height={8}
								width={8}
							/>
						</div>
						<div className="w-full cursor-pointer select-none border-edge border-l p-4">
							<div className="flex items-center justify-between [&_h2]:font-pixel-square [&_h2]:lowercase">
								<h2 className="text-left text-base sm:text-xl">
									{metadata.title}
								</h2>
								{metadata.isNew && <PulsatingCircle />}
							</div>
						</div>
					</div>
				</article>

				{isDescription && (
					<div className="screen-line-before px-2 py-2 sm:px-4">
						<Prose className="lowercase">{metadata.description}</Prose>
					</div>
				)}

				<div className="screen-line-before flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
					<span className="text-theme">---</span>
					<div className="flex items-center gap-2 sm:gap-4">
						<Badge className="lowercase">
							auteur: <span className="text-theme">{metadata.author}</span>
						</Badge>
						<Badge className="lowercase max-sm:hidden">
							créé: {dayjs(metadata.createdAt).format('DD MMM YYYY')}
						</Badge>
						<Badge className="lowercase">
							mis à jour: {dayjs(metadata.updatedAt).format('DD MMM YYYY')}
						</Badge>
					</div>
				</div>

				{!isLast && <Divider after={false} border={false} type="half" />}
			</Link>
		);
	}
);
