import { AnimatePresence, motion } from 'motion/react';
import { lazy, memo } from 'react';
import { PanelContent } from '@/components/Panel';
import {
	Marquee,
	MarqueeContent,
	MarqueeFade,
	MarqueeItem,
} from '@/components/ui/Marquee';
import { Prose } from '@/components/ui/Typography';
import { AboutPointer } from '@/features/(homepage)/about/AboutPointer';

export interface Stack {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	title: string;
}

const CSSIcon = lazy(() =>
	import('@/components/stack/CSS').then((m) => ({
		default: m.CSSIcon,
	}))
);
const HTML5Icon = lazy(() =>
	import('@/components/stack/HTML').then((m) => ({
		default: m.HTML5Icon,
	}))
);
const JavaScriptIcon = lazy(() =>
	import('@/components/stack/JavaScript').then((m) => ({
		default: m.JavaScriptIcon,
	}))
);
const NextJSIcon = lazy(() =>
	import('@/components/stack/Next').then((m) => ({
		default: m.NextJSIcon,
	}))
);
const ReactIcon = lazy(() =>
	import('@/components/stack/React').then((m) => ({
		default: m.ReactIcon,
	}))
);
const TailwindIcon = lazy(() =>
	import('@/components/stack/Tailwind').then((m) => ({
		default: m.TailwindIcon,
	}))
);
const TypeScriptIcon = lazy(() =>
	import('@/components/stack/TypeScript').then((m) => ({
		default: m.TypeScriptIcon,
	}))
);

export const CONTENT: Stack[] = [
	{ icon: HTML5Icon, title: 'HTML5' },
	{ icon: CSSIcon, title: 'CSS' },
	{ icon: JavaScriptIcon, title: 'JavaScript' },
	{ icon: TypeScriptIcon, title: 'TypeScript' },
	{ icon: ReactIcon, title: 'React' },
	{ icon: NextJSIcon, title: 'Next.js' },
	{ icon: TailwindIcon, title: 'Tailwind CSS' },
];

interface AboutContentProps {
	expanded: boolean;
}

export const AboutContent = memo(({ expanded }: AboutContentProps) => (
	<PanelContent className="space-y-3">
		<AboutPointer />

		<Prose>
			Tout a commencé lorsqu'un ami m'a initié aux bases du <span>HTML</span> et
			du <span>CSS</span>. Ce qui n'était au départ qu'une expérimentation
			ludique est vite devenu une <span>passion</span> dévorante.
		</Prose>

		<AnimatePresence initial={false}>
			{expanded && (
				<motion.div
					animate={{ height: 'auto', opacity: 1 }}
					className="space-y-3 overflow-hidden"
					exit={{ height: 0, opacity: 0 }}
					initial={{ height: 0, opacity: 0 }}
					key="about-expanded"
					transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
				>
					<Prose>
						J'ai appris <span>"à la dure"</span>, en passant de sites statiques
						bruts à la complexité de <span>JavaScript</span>. J'ai passé des
						semaines à décortiquer la logique des <span>Promises</span> et de
						l'asynchrone jusqu'au déclic. Cette courbe d'apprentissage m'a
						enseigné une leçon précieuse :{' '}
						<span className="text-theme">
							chaque erreur est une opportunité de comprendre le "pourquoi"
							derrière le "comment"
						</span>
						. C'est cette gratification de voir une idée abstraite devenir une
						réalité interactive qui me motive chaque jour.
					</Prose>

					<Prose>
						La transition vers l'écosystème moderne a marqué un véritable
						tournant. D'abord sceptique, j'ai rapidement adopté la logique
						modulaire de <span>React</span> et la robustesse de{' '}
						<span>TypeScript</span>, qui ont remplacé la manipulation manuelle
						du <span>DOM</span> et le débogage fastidieux par une architecture
						fiable. L'ajout de <span>Next.js</span> et <span>Tailwind CSS</span>{' '}
						a ensuite décuplé ma productivité : fini les configurations lourdes
						et le CSS ingérable.
					</Prose>

					<div className="my-4 space-y-4">
						<Marquee>
							<MarqueeFade side="left" />
							<MarqueeFade side="right" />
							<MarqueeContent direction="left">
								{CONTENT.map(({ icon, title }) => {
									const Icon = icon;
									return (
										<MarqueeItem key={title}>
											<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted ring-1 ring-edge ring-offset-1 ring-offset-background">
												<Icon className="size-6 shrink-0" />
												<p className="sr-only">{title}</p>
											</div>
										</MarqueeItem>
									);
								})}
							</MarqueeContent>
						</Marquee>

						<Marquee>
							<MarqueeFade side="left" />
							<MarqueeFade side="right" />
							<MarqueeContent direction="right">
								{CONTENT.map(({ icon, title }) => {
									const Icon = icon;
									return (
										<MarqueeItem key={title}>
											<div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted ring-1 ring-edge ring-offset-1 ring-offset-background">
												<Icon className="size-6 shrink-0" />
												<p className="sr-only">{title}</p>
											</div>
										</MarqueeItem>
									);
								})}
							</MarqueeContent>
						</Marquee>
					</div>

					<Prose>
						Aujourd'hui, je maîtrise cette stack{' '}
						<span className="text-theme">(Next.js/TS/Tailwind)</span> pour
						déployer rapidement des applications performantes et propres, animé
						par une veille technique constante pour optimiser chaque ligne de
						code.
					</Prose>
				</motion.div>
			)}
		</AnimatePresence>
	</PanelContent>
));
