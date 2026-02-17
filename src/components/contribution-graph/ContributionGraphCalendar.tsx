'use client';

import {
	Fragment,
	type HTMLAttributes,
	type ReactNode,
	useCallback,
	useRef,
	useState,
} from 'react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/overlays/Tooltip';
import { getMonthLabels } from '@/lib/github';
import { dayjs } from '@/lib/utils';
import {
	BLOCK_MARGIN,
	BLOCK_SIZE,
	useContributionGraph,
} from './ContributionGraph';

interface HoveredBlock {
	activity: CommitActivity;
	rect: DOMRect;
}

type ContributionGraphCalendarProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> & {
	children: (props: {
		activity: CommitActivity;
		dayIndex: number;
		weekIndex: number;
	}) => ReactNode;
};

export const ContributionGraphCalendar = ({
	className,
	children,
	...props
}: ContributionGraphCalendarProps) => {
	const { weeks, width, height } = useContributionGraph();
	const containerRef = useRef<HTMLDivElement>(null);
	const anchorRef = useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = useState<HoveredBlock | null>(null);

	const monthLabels = getMonthLabels(weeks);

	const handleMouseOver = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		const target = e.target as SVGRectElement;
		if (target.tagName !== 'rect' || !target.dataset.date) {
			return;
		}

		const activity: CommitActivity = {
			date: target.dataset.date,
			count: Number(target.dataset.count),
			level: Number(target.dataset.level) as CommitActivity['level'],
		};

		const rectBounds = target.getBoundingClientRect();
		const containerBounds = containerRef.current?.getBoundingClientRect();
		if (!containerBounds) {
			return;
		}

		if (anchorRef.current) {
			anchorRef.current.style.top = `${rectBounds.top - containerBounds.top}px`;
			anchorRef.current.style.left = `${rectBounds.left - containerBounds.left}px`;
			anchorRef.current.style.width = `${rectBounds.width}px`;
			anchorRef.current.style.height = `${rectBounds.height}px`;
		}

		setHovered({ activity, rect: rectBounds });
	}, []);

	const handleMouseOut = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		const target = e.target as SVGRectElement;
		if (target.tagName !== 'rect' || !target.dataset.date) {
			return;
		}
		setHovered(null);
	}, []);

	return (
		<div className="relative" ref={containerRef} {...props}>
			<div className="no-scrollbar max-w-full overflow-x-auto overflow-y-hidden">
				<svg
					className="block overflow-visible"
					height={height}
					onMouseOut={handleMouseOut}
					onMouseOver={handleMouseOver}
					viewBox={`0 0 ${width} ${height}`}
					width={width}
				>
					<g className="fill-current selection:fill-selection-foreground">
						{monthLabels.map(({ weekIndex, label }) => (
							<text
								className="text-muted-foreground text-xs lowercase"
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

			<Tooltip open={!!hovered}>
				<TooltipTrigger asChild>
					<div className="pointer-events-none absolute" ref={anchorRef} />
				</TooltipTrigger>
				<TooltipContent side="top" sideOffset={4}>
					{hovered && (
						<>
							{hovered.activity.count === 0
								? 'aucune contribution'
								: `${hovered.activity.count} contribution${hovered.activity.count > 1 ? 's' : ''}`}{' '}
							le {dayjs(hovered.activity.date).format('ddd DD MMM')}
						</>
					)}
				</TooltipContent>
			</Tooltip>
		</div>
	);
};
