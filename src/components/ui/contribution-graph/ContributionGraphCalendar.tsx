import type React from 'react';
import { Fragment, type HTMLAttributes, type ReactNode, useMemo } from 'react';
import { getMonthLabels } from '@/lib/github';
import { BLOCK_MARGIN, BLOCK_SIZE, useContributionGraph } from './ContributionGraph';

type ContributionGraphCalendarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
	children: (props: { activity: CommitActivity; dayIndex: number; weekIndex: number }) => ReactNode;
};

const ContributionGraphCalendar = ({
	className,
	children,
	...props
}: ContributionGraphCalendarProps): React.JSX.Element => {
	const { weeks, width, height } = useContributionGraph();

	const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);

	return (
		<div className="no-scrollbar max-w-full overflow-x-auto overflow-y-hidden" {...props}>
			<svg
				className="block overflow-visible"
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				width={width}
			>
				<g className="fill-current selection:fill-selection-foreground">
					{monthLabels.map(({ weekIndex, label }) => (
						<text
							className="text-muted-foreground text-xs"
							dominantBaseline="hanging"
							key={weekIndex}
							x={(BLOCK_SIZE + BLOCK_MARGIN) * weekIndex}
						>
							{label}
						</text>
					))}
				</g>

				{weeks.map((week, weekIndex) =>
					week.map((activity, dayIndex) => {
						if (!activity) {
							return null;
						}

						return (
							<Fragment key={`${weekIndex}-${dayIndex}`}>
								{children({ activity, dayIndex, weekIndex })}
							</Fragment>
						);
					})
				)}
			</svg>
		</div>
	);
};

ContributionGraphCalendar.displayName = 'ContributionGraphCalendar';

export { ContributionGraphCalendar };
