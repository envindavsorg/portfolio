'use client';

import { ContributionGraph } from '@/components/contribution-graph/ContributionGraph';
import { ContributionGraphBlock } from '@/components/contribution-graph/ContributionGraphBlock';
import { ContributionGraphCalendar } from '@/components/contribution-graph/ContributionGraphCalendar';
import { ContributionGraphLegend } from '@/components/contribution-graph/ContributionGraphLegend';
import { ContributionGraphTotalCount } from '@/components/contribution-graph/ContributionGraphTotalCount';
import { PanelContent } from '@/components/primitives/Panel';
import { Prose } from '@/components/text/Typography';

interface CommitsContentProps {
	contributions: CommitActivity[];
}

export const CommitsContent = ({ contributions }: CommitsContentProps) => (
	<>
		<PanelContent>
			<Prose className="max-sm:text-xs!">
				retrouvez ici <span>l'historique complet</span> de mes contributions
				open source sur GitHub. chaque commit représente une étape de mon
				parcours en tant que développeur.
			</Prose>
		</PanelContent>

		<div className="screen-line-before">
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

				<div className="screen-line-before flex items-center justify-between px-3 py-2 text-muted-foreground text-xs">
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
