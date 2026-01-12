import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import type React from 'react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import { CertificationItem } from './CertificationItem';
import type { Certification } from './content';

interface CertificationsContentProps {
	content: Certification[];
}

const CertificationsContent = ({ content }: CertificationsContentProps): React.JSX.Element => {
	const { visibleContent, hiddenContent } = useMemo(
		() => ({
			visibleContent: content.slice(0, 4),
			hiddenContent: content.slice(4),
		}),
		[content, 4]
	);

	const keyExtractorAction = (item: Certification) => item.credentialID;
	const getKey = (item: Certification, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="screen-line-after *:prose *:prose-sm *:prose-zinc dark:*:prose-invert space-y-2 *:max-w-none *:font-mono *:text-foreground">
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
					La technologie évolue rapidement, et rester à jour est essentiel.
				</TextAnimate>
				<TextAnimate
					animation="fadeIn"
					as="p"
					by="word"
					className="!text-theme !font-medium"
					delay={0.6}
				>
					Ces certifications valident mes compétences techniques et démontrent mon engagement envers
					l'excellence et l'apprentissage continu dans le développement web moderne.
				</TextAnimate>
			</PanelContent>

			<Collapsible>
				{visibleContent.map((item: Certification, idx: number) => (
					<div className="screen-line-after" key={getKey(item, idx)}>
						<CertificationItem certification={item} />
					</div>
				))}

				{hiddenContent.length > 0 && (
					<CollapsibleContent>
						{hiddenContent.map((item: Certification, idx: number) => (
							<div className="border-edge border-b" key={getKey(item, 2 + idx)}>
								<CertificationItem certification={item} />
							</div>
						))}
					</CollapsibleContent>
				)}

				{hiddenContent.length > 0 && (
					<div className="flex justify-center py-2 md:justify-end md:pr-4">
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
					</div>
				)}
			</Collapsible>
		</>
	);
};

CertificationsContent.displayName = 'CertificationsContent';

export { CertificationsContent };
