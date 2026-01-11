import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr';
import type React from 'react';
import type { SVGProps } from 'react';
import { useMemo } from 'react';
import { ProjectsItem } from '@/components/features/projects/ProjectsItem';
import { NextJSIcon } from '@/components/icons/content/Next';
import { NPMIcon } from '@/components/icons/content/NPM';
import { Button } from '@/components/ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

export interface Project {
	id: string;
	name: string;
	icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
	type: string;
	link: string;
	skills: string[];
	title: string;
	description: string[];
	isExpanded?: boolean;
}

const PROJECTS: Project[] = [
	{
		id: 'ts-safe-path',
		name: 'ts-safe-path',
		icon: NPMIcon,
		type: 'librairie',
		link: 'https://www.npmjs.com/package/ts-safe-path',
		skills: [
			'Open Source',
			'TypeScript',
			'Node.js',
			'ESM',
			'Vite',
			'Rollup',
			'Vitest',
			'Playwright',
		],
		title: 'Un utilitaire TypeScript léger pour manipuler des objets de manière type-safe.',
		description: [
			'Autocomplétion complète pour tous les chemins imbriqués',
			'Tree-shakeable',
			'Zéro dépendances',
			"Création automatique d'objets intermédiaires",
			'Opérations type-safe (get, set, has, update, merge)',
			'Aucun overhead runtime',
			'API fluide et intuitive',
			'Typage strict avec validation à la compilation',
		],
	},
	{
		id: 'portfolio',
		name: 'cuzeacflorin.fr',
		icon: NextJSIcon,
		type: 'portfolio',
		link: 'https://github.com/envindavsorg/cuzeacflorin.fr',
		skills: [
			'Open Source',
			'React 18',
			'Next.js 15',
			'Tailwind CSS v4',
			'Radix UI',
			'Motion',
			'shadcn/ui',
			'Component Registry',
			'Vercel',
		],
		title: 'Un portfolio minimaliste, avec un registre de composants et un blog.',
		description: [
			'Support des thèmes clair et sombre',
			'Design épuré et moderne',
			'Intégration vCard',
			'Optimisation SEO : schéma JSON-LD, sitemap, robots',
			'Compatible IA /llms.txt',
			'Email protégé contre le spam',
			'PWA installable',
			'Animations subtiles pour une meilleure expérience utilisateur',
		],
	},
];

const ProjectsContent = (): React.JSX.Element => {
	const { visibleItems, hiddenItems } = useMemo(
		() => ({
			visibleItems: PROJECTS.slice(0, 2),
			hiddenItems: PROJECTS.slice(2),
		}),
		[PROJECTS, 2]
	);

	const keyExtractorAction = (item: Project) => item.id;
	const getKey = (item: Project, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="*:prose *:prose-sm *:prose-zinc dark:*:prose-invert space-y-2 *:max-w-none *:font-mono *:text-foreground">
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
					Une sélection de projets qui illustrent mon parcours et mes compétences.
				</TextAnimate>
				<TextAnimate
					animation="fadeIn"
					as="p"
					by="word"
					className="!text-theme !font-medium"
					delay={0.6}
				>
					Du développement d'applications web modernes aux expérimentations techniques,
				</TextAnimate>
				<TextAnimate
					animation="fadeIn"
					as="p"
					by="word"
					className="!text-theme !font-medium -mt-2"
					delay={0.6}
				>
					chaque projet représente un défi relevé et des compétences acquises.
				</TextAnimate>
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.8}>
					Certains sont en production, d'autres sont des side-projects qui me permettent d'explorer
					de nouvelles technologies.
				</TextAnimate>
			</PanelContent>

			<Collapsible className="screen-line-before">
				{visibleItems.map((item: Project, idx: number) => (
					<div className="border-edge border-b" key={getKey(item, idx)}>
						<ProjectsItem project={item} />
					</div>
				))}

				{hiddenItems.length > 0 && (
					<CollapsibleContent>
						{hiddenItems.map((item: Project, idx: number) => (
							<div className="border-edge border-b" key={getKey(item, 2 + idx)}>
								<ProjectsItem project={item} />
							</div>
						))}
					</CollapsibleContent>
				)}

				{hiddenItems.length > 0 && (
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

ProjectsContent.displayName = 'ProjectsContent';

export { ProjectsContent };
