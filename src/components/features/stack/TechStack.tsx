import type React from 'react';
import {
	Marquee,
	MarqueeContent,
	MarqueeFade,
	MarqueeItem,
} from '@/components/ui/Marquee';
import {
	Panel,
	PanelContent,
	PanelHeader,
	PanelTitle,
} from '@/components/ui/Panel';
import { Prose } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
import { type Stack, techStack } from './data/tech-stack';

const stackIcons = techStack.map(
	({ icon: Icon, title }: Stack, index): React.JSX.Element => (
		<MarqueeItem key={`${title}-${index + 1}`}>
			<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted ring-1 ring-edge ring-offset-1 ring-offset-background">
				<Icon className="size-6 shrink-0" />
				<p className="sr-only">{title}</p>
			</div>
		</MarqueeItem>
	),
);

export const TechStack = (): React.JSX.Element => (
	<Panel id="stack">
		<PanelHeader>
			<PanelTitle>Ma stack technique</PanelTitle>
		</PanelHeader>

		<PanelContent className="screen-line-after">
			<Prose>
				Mon expertise se concentre sur l'écosystème{' '}
				<span>JavaScript</span> moderne. Au quotidien, je développe avec{' '}
				<span>React</span>, <span>Next.js</span> et{' '}
				<span>TypeScript</span>, en utilisant <span>Tailwind CSS</span>{' '}
				pour le styling et <span>Motion</span> pour les animations. Côté
				back-end, je travaille avec <span>Node.js</span> et des
				frameworks comme <span>Express</span> ou <span>Fastify</span>,
				connectés à <span>MongoDB</span> ou <span>PostgreSQL</span>. Je
				maîtrise l'ensemble de la chaîne de développement, de la
				conception sur <span>Figma</span> au déploiement, en passant par{' '}
				<span>Git</span> pour le versioning.
			</Prose>
		</PanelContent>

		<PanelContent
			className={cn(
				'[--pattern-foreground:var(--color-zinc-950)]/5 dark:[--pattern-foreground:var(--color-white)]/5',
				'bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-center bg-size-[10px_10px]',
				'bg-zinc-950/0.75 dark:bg-white/0.75',
			)}
		>
			<div className="flex flex-col gap-y-4">
				<Marquee>
					<MarqueeFade side="left" />
					<MarqueeFade side="right" />
					<MarqueeContent direction="left">
						{stackIcons}
					</MarqueeContent>
				</Marquee>
				<Marquee>
					<MarqueeFade side="left" />
					<MarqueeFade side="right" />
					<MarqueeContent direction="right">
						{stackIcons}
					</MarqueeContent>
				</Marquee>
			</div>
		</PanelContent>
	</Panel>
);
