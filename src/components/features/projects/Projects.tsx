import type React from 'react';
import { PostsLength } from '@/components/blog/components/PostsLength';
import { CollapsibleList } from '@/components/ui/CollapsibleList';
import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { PROJECTS } from './data/projects';
import { ProjectsItem } from './ProjectsItem';

export const Projects = (): React.JSX.Element => (
	<Panel id="projects">
		<PanelHeader className="flex items-center justify-between">
			<PanelTitle>Mes différents projets</PanelTitle>
			<PostsLength items={PROJECTS} slug="projet" />
		</PanelHeader>

		<PanelContent className="screen-line-after">
			<Prose>
				Une sélection de projets qui illustrent mon parcours et mes compétences.
				Du développement d'applications web modernes aux expérimentations
				techniques, chaque projet représente un défi relevé et des compétences
				acquises. Certains sont en production, d'autres sont des side-projects
				qui me permettent d'explorer de nouvelles technologies.
			</Prose>
		</PanelContent>

		<CollapsibleList
			items={PROJECTS}
			keyExtractorAction={(item) => item.id}
			labels={{
				showMore: 'Voir tous les projets',
				showLess: 'Fermer',
			}}
			max={4}
			renderItemAction={(item) => <ProjectsItem project={item} />}
		/>
	</Panel>
);
