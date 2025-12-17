import type React from 'react';
import { Suspense } from 'react';
import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Tag } from '@/components/ui/Tag';
import type { ContributionDay } from '../contact/actions/types/github.types';
import { CommitsGraph, CommitsGraphFallback } from './CommitsGraph';

type CommitsProps = {
	stars: number;
	followers: number;
	following: number;
	contributions: ContributionDay[];
};

export const Commits = ({
	stars,
	followers,
	following,
	contributions,
}: CommitsProps): React.JSX.Element => (
	<Panel id="github-contributions">
		<PanelHeader>
			<PanelTitle>Mes statistiques GitHub</PanelTitle>
		</PanelHeader>

		<PanelContent>
			<Suspense fallback={<CommitsGraphFallback />}>
				<CommitsGraph contributions={contributions} />
			</Suspense>
		</PanelContent>

		<PanelContent className="screen-line-before">
			<ul className="flex flex-wrap justify-end gap-1.5">
				<li className="flex">
					<Tag>{stars} étoiles</Tag>
				</li>
				<li className="flex">
					<Tag>{following} suivis</Tag>
				</li>
				<li className="flex">
					<Tag>{followers} abonnés</Tag>
				</li>
			</ul>
		</PanelContent>
	</Panel>
);
