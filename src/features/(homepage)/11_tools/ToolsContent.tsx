import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import type React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/buttons/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { PanelContent, PanelFooter } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import { ToolItem } from './ToolItem';

interface ToolsContentProps {
	content: Post[];
}

const ToolsContent = ({ content }: ToolsContentProps): React.JSX.Element => {
	const { visibleContent, hiddenContent } = useMemo(
		() => ({
			visibleContent: content.slice(0, 3),
			hiddenContent: content.slice(3),
		}),
		[content, 3]
	);

	const keyExtractorAction = (item: Post) => item.slug;
	const getKey = (item: Post, index: number) => (keyExtractorAction ? keyExtractorAction(item) : index);

	return (
		<>
			<PanelContent className="screen-line-after">
				<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
					Découvrez une suite d'outils web entièrement gratuits, spécialement conçue pour simplifier le quotidien des
					développeurs et accélérer vos projets.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.6} themed>
					En regroupant ces utilitaires essentiels au même endroit, cette collection vous permet d'optimiser votre
					workflow en réduisant considérablement le temps passé sur des tâches répétitives.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.8}>
					Explorez dès maintenant cette boîte à outils numérique pour booster votre productivité sans la moindre
					contrainte technique.
				</TextAnimate>
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

				<PanelFooter className="before:bg-transparent">
					{hiddenContent.length > 0 && (
						<CollapsibleTrigger asChild>
							<Button className="group flex items-center gap-2" variant="outline">
								<span className="group-data-[state=open]:hidden">Afficher plus</span>
								<span className="hidden group-data-[state=open]:inline">Afficher moins</span>
								<CaretDownIcon
									aria-hidden="true"
									className="size-4 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180"
								/>
							</Button>
						</CollapsibleTrigger>
					)}

					<Button asChild>
						<Link aria-label="Voir tous les outils" href="/utils">
							Voir tous les outils
						</Link>
					</Button>
				</PanelFooter>
			</Collapsible>
		</>
	);
};

ToolsContent.displayName = 'ToolsContent';

export { ToolsContent };
