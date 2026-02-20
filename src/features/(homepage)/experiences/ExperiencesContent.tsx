import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import { useMemo } from 'react';
import { Button } from '@/components/buttons/Button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/primitives/Collapsible';
import { PanelContent, PanelFooter } from '@/components/primitives/Panel';
import { Prose } from '@/components/text/Typography';
import type { Experience } from './content';
import { ExperienceItem } from './ExperienceItem';

interface ExperiencesContentProps {
	content: Experience[];
}

export const ExperiencesContent = ({ content }: ExperiencesContentProps) => {
	const { visibleContent, hiddenContent } = useMemo(
		() => ({
			visibleContent: content.slice(0, 3),
			hiddenContent: content.slice(3),
		}),
		[content, 3]
	);

	const keyExtractorAction = (item: Experience) => item.id;
	const getKey = (item: Experience, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="space-y-3">
				<Prose className="max-sm:text-xs!">
					Retour sur <span>mon parcours professionnel</span> et les expériences
					qui m'ont permis de grandir en tant que développeur Front-End, puis
					Full-Stack.
				</Prose>
				<Prose className="max-sm:text-xs!">
					Ensemble, ces <span>expériences</span> constituent le socle de mes
					compétences actuelles et reflètent ma passion pour la création de
					solutions web innovantes et performantes.
				</Prose>
				<Prose className="max-sm:text-xs!">
					De la <span>refonte d'applications</span> à grande échelle à
					l'intégration de fonctionnalités complexes, chaque poste a été une
					opportunité d'apprendre, de relever des <span>défis techniques</span>{' '}
					et de collaborer avec des équipes talentueuses.
				</Prose>
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
					<PanelFooter className="flex max-sm:flex-col">
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
