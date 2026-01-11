import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import type React from 'react';
import { useMemo } from 'react';
import { ExperienceItem } from '@/components/features/experiences/ExperienceItem';
import { Button } from '@/components/ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import { PanelContent } from '@/components/ui/Panel';
import { TextAnimate } from '@/components/ui/TextAnimate';

export interface Experience {
	id: string;
	company: string;
	type?: string;
	title: string;
	link?: string;
	period: {
		start: string;
		end?: string;
	};
	skills?: string[];
	description?: string[];
	isExpanded?: boolean;
	isCurrentEmployer?: boolean;
}

const EXPERIENCES: Experience[] = [
	{
		id: 'wefix-by-fnac',
		company: 'WeFix by Fnac',
		type: 'CDI',
		title: 'Lead Développeur Front-End',
		link: 'https://wefix.net/',
		period: {
			start: '2020',
		},
		skills: [
			'React',
			'Next.js',
			'TypeScript',
			'Redux',
			'TypeScript',
			'Tailwind.css',
			'HTML5',
			'CSS3',
			'CSS',
			'Git',
			'UX/UI',
			'Figma',
			'Sketch',
			'Design System',
			'Prototyping',
			'Wireframes',
			'Usability Testing',
		],
		description: [
			"Contribution majeure à la refonte du site web de WeFix, améliorant l'expérience utilisateur et l'efficacité du parcours client.",
			"Conception d'APIs",
			'Amélioration UX/UI',
			'Développement et intégration de nouvelles fonctionnalités web, répondant aux besoins de partenaires stratégiques.',
			"Conception d'un design system évolutif pour garantir cohérence et efficacité entre les équipes de développement et de design.",
			"Intégration d'APIs",
			'Création de landing pages',
			'Refonte site e-commerce et espace client pour un design moderne sur web et mobile, optimisé pour la conversion et la rétention client.',
		],
		isExpanded: false,
		isCurrentEmployer: true,
	},
	{
		id: 'spinalcom',
		company: 'SpinalCom',
		type: 'Alternance',
		title: 'Designer Web UX/UI',
		link: 'https://www.spinalcom.com/',
		period: {
			start: '2019',
			end: '2020',
		},
		skills: [
			'Vue.js',
			'Nuxt.js',
			'JavaScript',
			'HTML5',
			'CSS3',
			'Git',
			'Figma',
			'Photoshop',
			'Wireframes',
			'Prototyping',
		],
		description: [
			"Participation active au développement d'un tableau de bord de gestion des équipements connectés, améliorant la surveillance et le contrôle des infrastructures pour les clients de SpinalCom.",
			'Refonte du site Web et élaboration de maquettes pour de nouveaux projets.',
			'Créé une carte interactive pour afficher les données des stations de surveillance.',
			'Conçu une landing page WordPress personnalisable',
		],
		isExpanded: false,
		isCurrentEmployer: false,
	},
	{
		id: 'economat-des-armees',
		company: 'Économat des Armées',
		type: 'Alternance',
		title: 'Développeur Multi-plateformes',
		link: 'https://www.economat-armees.com/',
		period: {
			start: '2017',
			end: '2019',
		},
		skills: ['JavaScript', 'HTML5', 'CSS3', 'Git', 'Figma', 'Python', 'Django', 'Flask', 'APIs'],
		description: [
			"Développé un site intranet sécurisé pour le ministère des Armées avec authentification SSO et gestion granulaire des droits d'accès, facilitant la collaboration entre les différents services de l'Économat.",
			"Conçu et implémenté un annuaire interne permettant la recherche avancée de personnel avec filtres multi-critères, améliorant significativement l'accessibilité aux informations et réduisant le temps de recherche de contacts.",
			"Optimisé l'architecture front-end pour garantir des performances élevées malgré un volume important de données sensibles, avec un système de cache intelligent et un chargement progressif des contenus.",
			'Mis en place un système de gestion de contenu modulaire permettant aux administrateurs de publier et mettre à jour facilement les actualités, documents et ressources internes sans intervention technique.',
		],
		isExpanded: false,
		isCurrentEmployer: false,
	},
	{
		id: 'c47f5903-88ae-4512-8a50-0b91b0cf99b6',
		company: 'ETNA (École des Technologies Numériques Avancées)',
		title: 'Master développement web et mobile (Bac+5)',
		period: {
			start: '2016',
			end: '2020',
		},
	},
	{
		id: '70131ed8-36d9-4e54-8c78-eaed18240eca',
		company: 'Licence Scientifique - Université des Sciences UM2 Montpellier',
		title: 'Licence Scientifique (Bac+3), spécialité Biologie',
		period: {
			start: '2013',
			end: '2016',
		},
	},
	{
		id: '36c4c6fb-02d0-48c0-8947-fda6e9a24af7',
		company: ' Lycée Jean Moulin (Pézenas)',
		title: 'Baccalauréat Scientifique (Bac), spécialité Biologie',
		period: {
			start: '2010',
			end: '2013',
		},
	},
];

const ExperiencesContent = (): React.JSX.Element | null => {
	const { visibleItems, hiddenItems } = useMemo(
		() => ({
			visibleItems: EXPERIENCES.slice(0, 3),
			hiddenItems: EXPERIENCES.slice(3),
		}),
		[EXPERIENCES, 3]
	);

	const keyExtractorAction = (item: Experience) => item.id;
	const getKey = (item: Experience, index: number) =>
		keyExtractorAction ? keyExtractorAction(item) : index;

	return (
		<>
			<PanelContent className="*:prose *:prose-sm *:prose-zinc dark:*:prose-invert space-y-2 *:max-w-none *:font-mono *:text-foreground">
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.4}>
					Retour sur mon parcours professionnel et les expériences qui m'ont permis de grandir en
					tant que développeur Front-End, puis Full-Stack.
				</TextAnimate>
				<TextAnimate
					animation="fadeIn"
					as="p"
					by="word"
					className="!text-theme !font-medium"
					delay={0.6}
				>
					Ensemble, ces expériences constituent le socle de mes compétences actuelles et reflètent
					ma passion pour la création de solutions web innovantes et performantes.
				</TextAnimate>
				<TextAnimate animation="fadeIn" as="p" by="word" delay={0.8}>
					De la refonte d'applications à grande échelle à l'intégration de fonctionnalités
					complexes, chaque poste a été une opportunité d'apprendre, de relever des défis techniques
					et de collaborer avec des équipes talentueuses.
				</TextAnimate>
			</PanelContent>

			<Collapsible className="screen-line-before">
				{visibleItems.map((item: Experience, idx: number) => (
					<div className="border-edge border-b" key={getKey(item, idx)}>
						<ExperienceItem experience={item} />
					</div>
				))}

				{hiddenItems.length > 0 && (
					<CollapsibleContent>
						{hiddenItems.map((item: Experience, idx: number) => (
							<div className="border-edge border-b" key={getKey(item, 2 + idx)}>
								<ExperienceItem experience={item} />
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

ExperiencesContent.displayName = 'ExperiencesContent';

export { ExperiencesContent };
