import type React from 'react';
import { getGitHubData } from '@/actions/github/data.action';
import { Panel, PanelContent } from '@/components/Panel';
import { Tag } from '@/components/ui/Tag';
import { CommitsContent } from './CommitsContent';
import { CommitsTitle } from './CommitsTitle';

const Commits = async (): Promise<React.JSX.Element> => {
	const { stars, followers, following, contributions } = await getGitHubData();

	return (
		<Panel>
			<CommitsTitle />
			<CommitsContent contributions={contributions} />

			<PanelContent className="screen-line-before hidden">
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
};

Commits.displayName = 'Commits';

export { Commits };
