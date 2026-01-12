'use client';

import type React from 'react';
import { ContributionGraph } from '@/components/ui/contribution-graph/ContributionGraph';
import { ContributionGraphBlock } from '@/components/ui/contribution-graph/ContributionGraphBlock';
import { ContributionGraphCalendar } from '@/components/ui/contribution-graph/ContributionGraphCalendar';
import { ContributionGraphLegend } from '@/components/ui/contribution-graph/ContributionGraphLegend';
import { ContributionGraphTotalCount } from '@/components/ui/contribution-graph/ContributionGraphTotalCount';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

interface CommitsContentProps {
	contributions: CommitActivity[];
}

const CommitsContent = ({ contributions }: CommitsContentProps): React.JSX.Element => (
	<>
		<PanelContent className="screen-line-after *:prose *:prose-sm *:prose-zinc dark:*:prose-invert space-y-2 *:max-w-none *:font-mono *:text-foreground">
			<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
				Retrouvez ici l'historique complet de mes contributions open source sur GitHub.
			</TextAnimate>
			<TextAnimate
				animation="fadeIn"
				as="p"
				by="word"
				className="!text-theme !font-medium"
				delay={0.6}
			>
				Chaque commit représente une étape de mon parcours en tant que développeur.
			</TextAnimate>
		</PanelContent>

		<div className="screen-line-after">
			<ContributionGraph data={contributions}>
				<div className="p-3">
					<ContributionGraphCalendar>
						{({ activity, dayIndex, weekIndex }) => (
							<ContributionGraphBlock
								activity={activity}
								dayIndex={dayIndex}
								weekIndex={weekIndex}
							/>
						)}
					</ContributionGraphCalendar>
				</div>

				<div className="flex items-center justify-between border-edge border-y px-3 py-2 text-muted-foreground text-xs">
					<ContributionGraphTotalCount>
						{({ totalCount, year }) => (
							<div>
								<span className="font-medium text-theme">
									{totalCount.toLocaleString('en')} contributions
								</span>{' '}
								en <span className="font-medium">{year}</span>
							</div>
						)}
					</ContributionGraphTotalCount>

					<ContributionGraphLegend />
				</div>
			</ContributionGraph>
		</div>
	</>
);

CommitsContent.displayName = 'CommitsContent';

export { CommitsContent };
