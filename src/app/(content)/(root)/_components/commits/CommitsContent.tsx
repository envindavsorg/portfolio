'use client';

import { Graph } from './graph/Graph';
import { GraphBlock } from './graph/GraphBlock';
import { GraphCalendar } from './graph/GraphCalendar';
import { GraphFooter } from './graph/GraphFooter';

interface CommitsContentProps {
	contributions: CommitActivity[];
}

export const CommitsContent = ({ contributions }: CommitsContentProps) => (
	<Graph data={contributions}>
		<GraphCalendar>
			{({ activity, dayIndex, weekIndex }) => (
				<GraphBlock activity={activity} dayIndex={dayIndex} weekIndex={weekIndex} />
			)}
		</GraphCalendar>

		<GraphFooter />
	</Graph>
);
