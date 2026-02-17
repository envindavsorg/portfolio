import type { ReactNode } from 'react';
import { useContributionGraph } from './ContributionGraph';

export const ContributionGraphTotalCount = ({
	children,
}: {
	children: (props: { totalCount: number; year: number }) => ReactNode;
}) => {
	const { totalCount, year } = useContributionGraph();
	return <>{children({ totalCount, year })}</>;
};
