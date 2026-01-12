import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { BLOCK_RADIUS, BLOCK_SIZE, MAX_LEVEL } from './ContributionGraph';

const ContributionGraphLegend = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div className="flex items-center gap-x-2" {...props}>
		<span className="font-medium">Moins</span>

		<div className="flex items-center gap-x-[4px]">
			{Array.from({ length: MAX_LEVEL + 1 }).map((_, level) => (
				<svg height={BLOCK_SIZE} key={level} width={BLOCK_SIZE}>
					<rect
						className={cn(
							'data-[level="0"]:fill-blue-600/5 dark:data-[level="0"]:fill-yellow-300/5',
							'data-[level="1"]:fill-blue-600/20 dark:data-[level="1"]:fill-yellow-300/20',
							'data-[level="2"]:fill-blue-600/40 dark:data-[level="2"]:fill-yellow-300/40',
							'data-[level="3"]:fill-blue-600/60 dark:data-[level="3"]:fill-yellow-300/60',
							'data-[level="4"]:fill-blue-600/80 dark:data-[level="4"]:fill-yellow-300/80'
						)}
						data-level={level}
						height={BLOCK_SIZE}
						rx={BLOCK_RADIUS}
						ry={BLOCK_RADIUS}
						width={BLOCK_SIZE}
					/>
				</svg>
			))}
		</div>

		<span className="font-medium">Plus</span>
	</div>
);

ContributionGraphLegend.displayName = 'ContributionGraphLegend';

export { ContributionGraphLegend };
