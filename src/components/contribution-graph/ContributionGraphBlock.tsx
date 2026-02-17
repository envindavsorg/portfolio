import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
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

export const ContributionGraphBlock = ({
	activity,
	dayIndex,
	weekIndex,
	className,
	...props
}: ContributionGraphBlockProps) => (
	<rect
		className={cn(
			'data-[level="0"]:fill-theme/5',
			'data-[level="1"]:fill-theme/20',
			'data-[level="2"]:fill-theme/40',
			'data-[level="3"]:fill-theme/60',
			'data-[level="4"]:fill-theme/80',
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
);
