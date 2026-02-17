import { getGitHubData } from '@/actions/github/data.action';
import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/Panel';
import { TextAnimate } from '@/components/text/TextAnimate';
import { Tag } from '@/components/ui/Tag';
import { CommitsContent } from './CommitsContent';

export const Commits = async () => {
	const { stars, followers, following, contributions } = await getGitHubData();

	return (
		<Panel>
			<PanelHeader>
				<PanelTitle>
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						mes statistiques sur GitHub
					</TextAnimate>
				</PanelTitle>
			</PanelHeader>

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
