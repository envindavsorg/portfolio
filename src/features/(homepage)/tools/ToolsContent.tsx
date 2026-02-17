import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/buttons/Button';
import { PanelContent, PanelFooter } from '@/components/Panel';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/Collapsible';
import { Prose } from '@/components/ui/Typography';
import { ToolItem } from './ToolItem';

interface ToolsContentProps {
	content: Post[];
}

export const ToolsContent = ({ content }: ToolsContentProps) => {
	const { visibleContent, hiddenContent } = useMemo(
		() => ({
			visibleContent: content.slice(0, 3),
			hiddenContent: content.slice(3),
		}),
		[content, 3]
	);

	const keyExtractorAction = (item: Post) => item.slug;
	const getKey = (item: Post, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="screen-line-after space-y-3">
				<Prose className="max-sm:text-xs!">
					Découvrez une suite <span>d'outils web</span> entièrement gratuits,
					spécialement conçue pour simplifier le quotidien des développeurs et
					accélérer vos projets.
				</Prose>
				<Prose className="max-sm:text-xs!">
					En regroupant ces <span>utilitaires essentiels</span> au même endroit,
					cette collection vous permet d'optimiser votre workflow en réduisant
					considérablement le temps passé sur des tâches répétitives.
				</Prose>
				<Prose className="max-sm:text-xs!">
					Explorez dès maintenant cette boîte à outils numérique pour booster
					votre productivité sans la moindre contrainte technique.
				</Prose>
			</PanelContent>

			<Collapsible>
				{visibleContent.map((item: Post, idx: number) => (
					<div key={getKey(item, idx)}>
						<ToolItem post={item} />
					</div>
				))}

				{hiddenContent.length > 0 && (
					<CollapsibleContent>
						{hiddenContent.map((item: Post, idx: number) => (
							<div key={getKey(item, 3 + idx)}>
								<ToolItem post={item} />
							</div>
						))}
					</CollapsibleContent>
				)}

				<PanelFooter className="flex max-sm:flex-col max-sm:gap-y-2">
					{hiddenContent.length > 0 && (
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
					)}

					<Button asChild>
						<Link aria-label="Voir tous les outils" href="/utils">
							voir tous les outils
						</Link>
					</Button>
				</PanelFooter>
			</Collapsible>
		</>
	);
};
