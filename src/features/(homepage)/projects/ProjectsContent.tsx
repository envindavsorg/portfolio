import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr';
import { useMemo } from 'react';
import { Button } from '@/components/buttons/Button';
import { PanelContent, PanelFooter } from '@/components/Panel';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/Collapsible';
import { Prose } from '@/components/ui/Typography';
import type { Project } from './content';
import { ProjectItem } from './ProjectItem';

interface ProjectsContentProps {
	content: Project[];
}

export const ProjectsContent = ({ content }: ProjectsContentProps) => {
	const { visibleContent, hiddenContent } = useMemo(
		() => ({
			visibleContent: content.slice(0, 2),
			hiddenContent: content.slice(2),
		}),
		[content, 2]
	);

	const keyExtractorAction = (item: Project) => item.id;
	const getKey = (item: Project, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="space-y-3">
				<Prose className="max-sm:text-xs!">
					Une sélection de projets qui illustrent mon parcours et mes
					compétences.
				</Prose>
				<Prose className="max-sm:text-xs!">
					<span>
						Du développement d'applications web modernes aux expérimentations
						techniques, chaque projet représente un défi relevé et des
						compétences acquises.
					</span>
				</Prose>
				<Prose className="max-sm:text-xs!">
					Certains sont en production, d'autres sont des side-projects qui me
					permettent d'explorer de nouvelles technologies.
				</Prose>
			</PanelContent>

			<Collapsible className="screen-line-before">
				{visibleContent.map((item: Project, idx: number) => (
					<div className="border-edge border-b" key={getKey(item, idx)}>
						<ProjectItem project={item} />
					</div>
				))}

				{hiddenContent.length > 0 && (
					<CollapsibleContent>
						{hiddenContent.map((item: Project, idx: number) => (
							<div className="border-edge border-b" key={getKey(item, 2 + idx)}>
								<ProjectItem project={item} />
							</div>
						))}
					</CollapsibleContent>
				)}

				{hiddenContent.length > 0 && (
					<PanelFooter className="before:bg-transparent">
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
		</>
	);
};
