import Link from 'next/link';
import { memo } from 'react';
import { PulsatingCircle } from '@/components/animations/PulsatingCircle';
import { Badge } from '@/components/ui/Badge';
import { DotPattern } from '@/components/ui/DotPattern';
import { cn, dayjs } from '@/lib/utils';
import { TOOLS_ICONS } from './content';

interface ToolsItemProps {
	tool: Post;
	isLast?: boolean;
}

export const ToolsItem = memo(({ tool, isLast = false }: ToolsItemProps) => {
	const { metadata, slug } = tool;
	const Icon = metadata.tags?.find((tag) => tag in TOOLS_ICONS)
		? TOOLS_ICONS[metadata.tags.find((tag) => tag in TOOLS_ICONS) as string]
		: null;

	return (
		<Link aria-label={metadata.title} href={`/utils/${slug}`} prefetch={false}>
			<article className="screen-line-before flex items-center hover:bg-accent2">
				<div className="flex w-full flex-1 items-center">
					<div className="relative m-4 flex size-6 shrink-0 cursor-default items-center justify-center sm:size-8">
						{Icon && <Icon className="size-6 sm:size-8" />}
						<DotPattern
							className="-z-10 text-theme opacity-20"
							height={8}
							width={8}
						/>
					</div>
					<div className="w-full cursor-pointer select-none border-edge border-l p-4">
						<div className="flex items-center justify-between [&_h2]:font-pixel-square [&_h2]:lowercase">
							<h2 className="text-base sm:text-xl">{metadata.title}</h2>
							{metadata.isNew && <PulsatingCircle />}
						</div>
					</div>
				</div>
			</article>

			<div className="screen-line-before flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
				<span className="text-theme">---</span>
				<div className="flex items-center gap-2 sm:gap-4">
					{metadata.tags && (
						<Badge className="lowercase max-sm:hidden">
							catégorie: {metadata.tags[0]}
						</Badge>
					)}
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

			{!isLast && (
				<div className="screen-line-before">
					<div
						className={cn(
							'relative flex h-4 w-full before:h-4',
							'before:absolute before:-left-[100vw] before:-z-1 before:w-[200vw]',
							'before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]',
							'before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]/50'
						)}
					/>
				</div>
			)}
		</Link>
	);
});
