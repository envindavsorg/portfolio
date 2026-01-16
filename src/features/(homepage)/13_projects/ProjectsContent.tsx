import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr';
import type React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/buttons/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { PanelContent, PanelFooter } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import type { Project } from './content';
import { ProjectItem } from './ProjectItem';

interface ProjectsContentProps {
	content: Project[];
}

const ProjectsContent = ({ content }: ProjectsContentProps): React.JSX.Element => {
	const { visibleContent, hiddenContent } = useMemo(
		() => ({
			visibleContent: content.slice(0, 2),
			hiddenContent: content.slice(2),
		}),
		[content, 2]
	);

	const keyExtractorAction = (item: Project) => item.id;
	const getKey = (item: Project, index: number) => (keyExtractorAction ? keyExtractorAction(item) : index);

	return (
		<>
			<PanelContent>
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
					Une sélection de projets qui illustrent mon parcours et mes compétences.
				</TextAnimate>

				<TextAnimate animation="fadeIn" as="p" by="word" className="mt-3" delay={0.6} themed>
					Du développement d'applications web modernes aux expérimentations techniques, chaque projet représente un défi
					relevé et des compétences acquises.
				</TextAnimate>

				<TextAnimate animation="fadeIn" as="p" by="word" className="mt-3" delay={0.8}>
					Certains sont en production, d'autres sont des side-projects qui me permettent d'explorer de nouvelles
					technologies.
				</TextAnimate>
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
							<Button className="group flex items-center gap-2">
								<span className="group-data-[state=open]:hidden">Afficher plus</span>
								<span className="hidden group-data-[state=open]:inline">Afficher moins</span>
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

ProjectsContent.displayName = 'ProjectsContent';

export { ProjectsContent };
