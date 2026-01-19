'use client';

import { PanelContent } from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { ContributionGraph } from '@/components/ui/contribution-graph/ContributionGraph';
import { ContributionGraphBlock } from '@/components/ui/contribution-graph/ContributionGraphBlock';
import { ContributionGraphCalendar } from '@/components/ui/contribution-graph/ContributionGraphCalendar';
import { ContributionGraphLegend } from '@/components/ui/contribution-graph/ContributionGraphLegend';
import { ContributionGraphTotalCount } from '@/components/ui/contribution-graph/ContributionGraphTotalCount';

interface CommitsContentProps {
	contributions: CommitActivity[];
}

const CommitsContent = ({ contributions }: CommitsContentProps) => (
	<>
		<PanelContent>
			<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
				Retrouvez ici l'historique complet de mes contributions open source sur
				GitHub.
			</TextAnimate>

			<TextAnimate
				animation="slideUp"
				as="p"
				by="word"
				className="mt-3"
				delay={0.6}
				themed
			>
				Chaque commit représente une étape de mon parcours en tant que
				développeur.
			</TextAnimate>
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

CommitsContent.displayName = 'CommitsContent';

export { CommitsContent };
