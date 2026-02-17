import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { BLOCK_RADIUS, BLOCK_SIZE, MAX_LEVEL } from './ContributionGraph';

export const ContributionGraphLegend = ({
	...props
}: HTMLAttributes<HTMLDivElement>) => (
	<div className="flex items-center gap-x-2" {...props}>
		<span className="font-medium">moins</span>

		<div className="flex items-center gap-x-1">
			{Array.from({ length: MAX_LEVEL + 1 }).map((_, level) => (
				<svg height={BLOCK_SIZE} key={level} width={BLOCK_SIZE}>
					<rect
						className={cn(
							'data-[level="0"]:fill-theme/5',
							'data-[level="1"]:fill-theme/20',
							'data-[level="2"]:fill-theme/40',
							'data-[level="3"]:fill-theme/60',
							'data-[level="4"]:fill-theme/80'
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

		<span className="font-medium">plus</span>
	</div>
);
