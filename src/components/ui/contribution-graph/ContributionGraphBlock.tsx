import type { HTMLAttributes } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/Tooltip';
import { cn, dayjs } from '@/lib/utils';
import {
	BLOCK_MARGIN,
	BLOCK_RADIUS,
	BLOCK_SIZE,
	LABEL_HEIGHT,
} from './ContributionGraph';

type ContributionGraphBlockProps = HTMLAttributes<SVGRectElement> & {
	activity: CommitActivity;
	dayIndex: number;
	weekIndex: number;
};

const ContributionGraphBlock = ({
	activity,
	dayIndex,
	weekIndex,
	className,
	...props
}: ContributionGraphBlockProps) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<g>
				<rect
					className={cn(
						'data-[level="0"]:fill-blue-600/5 dark:data-[level="0"]:fill-yellow-300/5',
						'data-[level="1"]:fill-blue-600/20 dark:data-[level="1"]:fill-yellow-300/20',
						'data-[level="2"]:fill-blue-600/40 dark:data-[level="2"]:fill-yellow-300/40',
						'data-[level="3"]:fill-blue-600/60 dark:data-[level="3"]:fill-yellow-300/60',
						'data-[level="4"]:fill-blue-600/80 dark:data-[level="4"]:fill-yellow-300/80',
						className
					)}
					data-count={activity.count}
					data-date={activity.date}
					data-level={activity.level}
					height={BLOCK_SIZE}
					rx={BLOCK_RADIUS}
					ry={BLOCK_RADIUS}
					width={BLOCK_SIZE}
					x={(BLOCK_SIZE + BLOCK_MARGIN) * weekIndex}
					y={LABEL_HEIGHT + (BLOCK_SIZE + BLOCK_MARGIN) * dayIndex}
					{...props}
				/>
			</g>
		</TooltipTrigger>

		<TooltipContent
			className="px-2 py-1 font-medium text-xs"
			side="left"
			sideOffset={0}
		>
			{activity.count === 0
				? 'Aucune contribution'
				: `${activity.count} contribution${activity.count > 1 ? 's' : ''}`}{' '}
			le {dayjs(activity.date).format('ddd DD MMM')}
		</TooltipContent>
	</Tooltip>
);

ContributionGraphBlock.displayName = 'ContributionGraphBlock';

export { ContributionGraphBlock };
