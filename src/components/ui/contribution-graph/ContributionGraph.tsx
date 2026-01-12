'use client';

import React, {
	createContext,
	type HTMLAttributes,
	type ReactNode,
	useContext,
	useMemo,
} from 'react';
import { dayjs } from '@/lib/dayjs';
import { groupByWeeks } from '@/lib/github';
import { cn } from '@/lib/utils';

export const BLOCK_SIZE = 12;
export const BLOCK_MARGIN = 4;
export const BLOCK_RADIUS = 2;
export const LABEL_HEIGHT = 24;
export const MAX_LEVEL = 4;
export const WEEK_START = 0; // Sunday

interface ContributionGraphContextType {
	weeks: Week[];
	width: number;
	height: number;
	totalCount: number;
	year: number;
}

const ContributionGraphContext = createContext<ContributionGraphContextType | null>(null);

export const useContributionGraph = () => {
	const context = useContext(ContributionGraphContext);
	if (!context) {
		throw new Error('Must be used within ContributionGraph');
	}
	return context;
};

export type ContributionGraphProps = HTMLAttributes<HTMLDivElement> & {
	data: CommitActivity[];
	children: ReactNode;
};

const ContributionGraph = ({
	data,
	className,
	children,
	...props
}: ContributionGraphProps): React.JSX.Element => {
	const { weeks, year, totalCount, width, height } = useMemo(() => {
		const weeks = groupByWeeks(data, WEEK_START);
		const year = data.length > 0 ? dayjs(data[0].date).year() : dayjs().year();
		const totalCount = data.reduce((sum, activity) => sum + activity.count, 0);

		const width = weeks.length * (BLOCK_SIZE + BLOCK_MARGIN) - BLOCK_MARGIN;
		const height = LABEL_HEIGHT + (BLOCK_SIZE + BLOCK_MARGIN) * 7 - BLOCK_MARGIN;

		return { weeks, year, totalCount, width, height };
	}, [data]);

	return (
		<ContributionGraphContext.Provider value={{ weeks, width, height, year, totalCount }}>
			<div className={cn('mx-auto flex w-max max-w-full flex-col', className)} {...props}>
				{children}
			</div>
		</ContributionGraphContext.Provider>
	);
};

ContributionGraph.displayName = 'ContributionGraph';

export { ContributionGraph };
