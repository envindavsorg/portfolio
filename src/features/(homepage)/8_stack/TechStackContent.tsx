import type React from 'react';
import { Marquee, MarqueeContent, MarqueeFade, MarqueeItem } from '@/components/ui/Marquee';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';
import type { Stack } from './content';

interface TechStackContentProps {
	content: Stack[];
}

const TechStackContent = ({ content }: TechStackContentProps): React.JSX.Element => {
	const keyExtractorAction = (item: Stack) => item.title;
	const getKey = (item: Stack, index: number) => (keyExtractorAction ? keyExtractorAction(item) : index);

	return (
		<>
			<PanelContent>
				<TextAnimate animation="slideUp" as="p" by="word" delay={0.4}>
					Mon expertise se concentre sur l'écosystème JavaScript moderne. Au quotidien, je développe avec React, Next.js
					et TypeScript, en utilisant Tailwind CSS pour le styling et Motion pour les animations.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.6}>
					Côté back-end, je travaille avec Node.js et des frameworks comme Express ou Fastify, connectés à MongoDB ou
					PostgreSQL.
				</TextAnimate>

				<TextAnimate animation="slideUp" as="p" by="word" className="mt-3" delay={0.8} themed>
					Je maîtrise l'ensemble de la chaîne de développement, de la conception sur Figma au déploiement, en passant
					par Git pour le versioning.
				</TextAnimate>
			</PanelContent>

			<PanelContent className="screen-line-before">
				<Marquee>
					<MarqueeFade side="left" />
					<MarqueeFade side="right" />
					<MarqueeContent direction="left">
						{content.map((item: Stack, idx: number): React.JSX.Element => {
							const Icon = item.icon;
							return (
								<MarqueeItem key={getKey(item, idx)}>
									<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted ring-1 ring-edge ring-offset-1 ring-offset-background">
										<Icon className="size-6 shrink-0" />
										<p className="sr-only">{item.title}</p>
									</div>
								</MarqueeItem>
							);
						})}
					</MarqueeContent>
				</Marquee>
			</PanelContent>

			<PanelContent className="screen-line-before">
				<Marquee>
					<MarqueeFade side="left" />
					<MarqueeFade side="right" />
					<MarqueeContent direction="right">
						{content.map((item: Stack, idx: number): React.JSX.Element => {
							const Icon = item.icon;
							return (
								<MarqueeItem key={getKey(item, idx)}>
									<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted ring-1 ring-edge ring-offset-1 ring-offset-background">
										<Icon className="size-6 shrink-0" />
										<p className="sr-only">{item.title}</p>
									</div>
								</MarqueeItem>
							);
						})}
					</MarqueeContent>
				</Marquee>
			</PanelContent>
		</>
	);
};

TechStackContent.displayName = 'TechStackContent';

export { TechStackContent };
