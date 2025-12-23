'use client';

import { SpinnerIcon } from '@phosphor-icons/react';
import type React from 'react';
import type { Activity } from '@/components/ui/ContributionGraph';
import {
	ContributionGraph,
	ContributionGraphBlock,
	ContributionGraphCalendar,
	ContributionGraphFooter,
	ContributionGraphLegend,
	ContributionGraphTotalCount,
} from '@/components/ui/ContributionGraph';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/Tooltip';
import { dayjs } from '@/lib/dayjs';
import { USER } from '@/lib/user';

type CommitsGraphProps = {
	contributions: Activity[];
};

export const CommitsGraph = ({
	contributions,
}: CommitsGraphProps): React.JSX.Element => (
	<ContributionGraph
		blockMargin={3}
		blockRadius={0}
		blockSize={11}
		className="mx-auto py-2"
		data={contributions}
	>
		<ContributionGraphCalendar className="no-scrollbar px-2">
			{({ activity, dayIndex, weekIndex }) => (
				<Tooltip>
					<TooltipTrigger asChild>
						<g>
							<ContributionGraphBlock
								activity={activity}
								dayIndex={dayIndex}
								weekIndex={weekIndex}
							/>
						</g>
					</TooltipTrigger>

					<TooltipContent className="font-sans" sideOffset={0}>
						<p>
							{activity.count} contribution
							{activity.count > 1 ? 's' : null} le{' '}
							{dayjs(activity.date).format('dddd DD MMM YYYY')}
						</p>
					</TooltipContent>
				</Tooltip>
			)}
		</ContributionGraphCalendar>

		<ContributionGraphFooter className="mt-2">
			<ContributionGraphTotalCount>
				{({ totalCount, year }) => (
					<div className="text-muted-foreground text-xs">
						{totalCount.toLocaleString('en')} contributions en {year} sur{' '}
						<a
							className="font-medium underline underline-offset-4"
							href={`https://github.com/${USER.username}`}
							rel="noopener"
							target="_blank"
						>
							GitHub
						</a>
						.
					</div>
				)}
			</ContributionGraphTotalCount>

			<ContributionGraphLegend />
		</ContributionGraphFooter>
	</ContributionGraph>
);

export const CommitsGraphFallback = () => (
	<div className="flex h-[162px] w-full items-center justify-center">
		<SpinnerIcon className="animate-spin text-muted-foreground" />
	</div>
);
