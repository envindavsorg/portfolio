import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/buttons/Button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/primitives/Collapsible';
import {
	Panel,
	PanelContent,
	PanelFooter,
	PanelHeader,
} from '@/components/primitives/Panel';
import { Prose } from '@/components/text/Typography';
import { PROJECTS } from './content';
import { ProjectItem } from './ProjectItem';

const VISIBLE_COUNT = 2;

export const Projects = () => {
	const visibleContent = PROJECTS.slice(0, VISIBLE_COUNT);
	const hiddenContent = PROJECTS.slice(VISIBLE_COUNT);
	const hasHidden = hiddenContent.length > 0;

	return (
		<Panel>
			<PanelHeader sticky title="mes différents projets" />

			<PanelContent>
				<Prose>
					-- une <i>sélection de projets</i> qui illustrent mon parcours et mes
					compétences --
				</Prose>
				<Prose>
					-- du <span>développement</span> d'applications web modernes aux
					<span>expérimentations techniques</span>, chaque projet représente un
					défi relevé et des compétences acquises --
				</Prose>
				<Prose>
					-- certains sont en production, d'autres sont des side-projects qui me
					permettent d'explorer de nouvelles technologies --
				</Prose>
			</PanelContent>

			<Collapsible>
				{visibleContent.map((item, idx) => (
					<ProjectItem
						isLast={idx === visibleContent.length - 1}
						key={item.id}
						project={item}
					/>
				))}

				{hasHidden && (
					<CollapsibleContent>
						{hiddenContent.map((item, idx) => (
							<ProjectItem
								isLast={idx === hiddenContent.length - 1}
								key={item.id}
								project={item}
							/>
						))}
					</CollapsibleContent>
				)}

				{hasHidden && (
					<PanelFooter>
						<CollapsibleTrigger asChild>
							<Button
								className="group flex items-center gap-2"
								variant="outline"
							>
								<span className="group-data-[state=open]:hidden">
									afficher plus
								</span>
								<span className="hidden group-data-[state=open]:inline">
									afficher moins
								</span>
								<CaretDownIcon
									aria-hidden="true"
									className="size-4 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180"
								/>
							</Button>
						</CollapsibleTrigger>
					</PanelFooter>
				)}
			</Collapsible>
		</Panel>
	);
};
