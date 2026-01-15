import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import type React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { PanelContent, PanelFooter } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import type { Experience } from './content';
import { ExperienceItem } from './ExperienceItem';

interface ExperiencesContentProps {
	content: Experience[];
}

const ExperiencesContent = ({ content }: ExperiencesContentProps): React.JSX.Element | null => {
	const { visibleContent, hiddenContent } = useMemo(
		() => ({
			visibleContent: content.slice(0, 3),
			hiddenContent: content.slice(3),
		}),
		[content, 3]
	);

	const keyExtractorAction = (item: Experience) => item.id;
	const getKey = (item: Experience, index: number) => (keyExtractorAction ? keyExtractorAction(item) : index);

	return (
		<>
			<PanelContent>
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
					Retour sur mon parcours professionnel et les expériences qui m'ont permis de grandir en tant que développeur
					Front-End, puis Full-Stack.
				</TextAnimate>

				<TextAnimate animation="fadeIn" as="p" by="word" className="mt-3" delay={0.6} themed>
					Ensemble, ces expériences constituent le socle de mes compétences actuelles et reflètent ma passion pour la
					création de solutions web innovantes et performantes.
				</TextAnimate>

				<TextAnimate animation="fadeIn" as="p" by="word" className="mt-3" delay={0.8}>
					De la refonte d'applications à grande échelle à l'intégration de fonctionnalités complexes, chaque poste a été
					une opportunité d'apprendre, de relever des défis techniques et de collaborer avec des équipes talentueuses.
				</TextAnimate>
			</PanelContent>

			<Collapsible className="screen-line-before">
				{visibleContent.map((item: Experience, idx: number) => (
					<div className="screen-line-after" key={getKey(item, idx)}>
						<ExperienceItem experience={item} />
					</div>
				))}

				{hiddenContent.length > 0 && (
					<CollapsibleContent>
						{hiddenContent.map((item: Experience, idx: number) => (
							<div className="screen-line-after" key={getKey(item, 3 + idx)}>
								<ExperienceItem experience={item} />
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

ExperiencesContent.displayName = 'ExperiencesContent';

export { ExperiencesContent };
