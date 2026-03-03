import { getGitHubData } from '@/actions/data.action';
import { Badge } from '@/components/primitives/Badge';
import { Panel, PanelContent, PanelHeader } from '@/components/primitives/Panel';
import { Prose } from '@/components/primitives/Typography';
import { CommitsContent } from './CommitsContent';

export const Commits = async () => {
	const { stars, followers, following, contributions } = await getGitHubData();

	return (
		<Panel>
			<PanelHeader sticky title="mes stats GitHub" />

			<PanelContent>
				<Prose>
					-- retrouvez ici <span>l'historique complet</span> de mes contributions open source sur GitHub --
				</Prose>
				<Prose>
					-- chaque commit représente une <i>étape</i> de mon parcours en tant que développeur --
				</Prose>
			</PanelContent>

			<CommitsContent contributions={contributions} />

			<div className="screen-line-before flex items-center justify-between gap-2 px-2 py-2 sm:gap-4 sm:px-4">
				<span className="text-theme">---</span>
				<div className="flex items-center gap-2 sm:gap-4">
					<Badge className="text-theme lowercase">{stars} étoiles</Badge>
					<Badge className="text-theme lowercase">{following} suivis</Badge>
					<Badge className="text-theme lowercase">{followers} abonnés</Badge>
				</div>
			</div>
		</Panel>
	);
};
