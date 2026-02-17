import { PanelContent } from '@/components/Panel';
import {
	Marquee,
	MarqueeContent,
	MarqueeFade,
	MarqueeItem,
} from '@/components/ui/Marquee';
import { Prose } from '@/components/ui/Typography';
import type { Stack } from './content';

interface TechStackContentProps {
	content: Stack[];
}

export const TechStackContent = ({ content }: TechStackContentProps) => {
	const keyExtractorAction = (item: Stack) => item.title;
	const getKey = (item: Stack, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="space-y-3">
				<Prose className="max-sm:text-xs!">
					mon expertise se concentre sur l'écosystème <span>JavaScript</span>{' '}
					moderne. au quotidien, je développe avec <span>React</span>,{' '}
					<span>Next.js</span> et <span>TypeScript</span>, en utilisant{' '}
					<span>Tailwind CSS</span> pour le styling et <span>Motion</span> pour
					les animations.
				</Prose>
				<Prose className="max-sm:text-xs!">
					côté back-end, je travaille avec <span>Node.js</span> et des
					frameworks comme <span>Express</span> ou <span>Fastify</span>,
					connectés à <span>MongoDB</span> ou <span>PostgreSQL</span>. je
					maîtrise l'ensemble de la chaîne de développement, de la conception
					sur <span>Figma</span> au déploiement, en passant par <span>Git</span>{' '}
					pour le versioning.
				</Prose>
			</PanelContent>

			<PanelContent className="screen-line-before">
				<Marquee>
					<MarqueeFade side="left" />
					<MarqueeFade side="right" />
					<MarqueeContent direction="left">
						{content.map((item: Stack, idx: number) => {
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
						{content.map((item: Stack, idx: number) => {
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
