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
	isCurrentEmployer?: boolean;
}

export const EXPERIENCES: Experience[] = [
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
			'Redux',
			'TypeScript',
			'Tailwind.css',
			'HTML5',
			'CSS3',
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
		isCurrentEmployer: false,
	},
	{
		id: 'etna-master',
		company: 'ETNA (École des Technologies Numériques Avancées)',
		title: 'Master développement web et mobile (Bac+5)',
		period: {
			start: '2016',
			end: '2020',
		},
	},
	{
		id: 'um2-licence',
		company: 'Licence Scientifique - Université des Sciences UM2 Montpellier',
		title: 'Licence Scientifique (Bac+3), spécialité Biologie',
		period: {
			start: '2013',
			end: '2016',
		},
	},
	{
		id: 'bac-s-jean-moulin',
		company: ' Lycée Jean Moulin (Pézenas)',
		title: 'Baccalauréat Scientifique (Bac), spécialité Biologie',
		period: {
			start: '2010',
			end: '2013',
		},
	},
];
