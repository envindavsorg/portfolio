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
			"Contribution à la refonte du site principal, améliorant l'UX et l'efficacité du parcours client.",
			"Conception et architecture d'APIs",
			'Amélioration UX/UI et création de prototypes',
			'Développement de nouvelles fonctionnalités web, répondant aux besoins de partenaires stratégiques.',
			"Conception d'un design system pour garantir cohérence et efficacité entre les équipes dev et design.",
			"Intégration et amélioration d'APIs",
			'Réflexion et création de landing pages',
			'Création site e-commerce et espace client optimisés pour la conversion et la rétention client.',
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
			"Développement d'un tableau de bord de gestion des équipements connectés, améliorant leur surveillance.",
			'Optimisation de sites web existants.',
			"Création d'une carte interactive de données.",
			'Refonte de sites WordPress avec une intégration personnalisée pour une meilleure UX.',
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
		skills: [
			'JavaScript',
			'HTML5',
			'CSS3',
			'Git',
			'Figma',
			'Python',
			'Django',
			'Flask',
			'APIs',
		],
		description: [
			"Création d'un intranet sécurisé pour le ministère des Armées avec authentification SSO.",
			"Création d'un annuaire interne optimisé.",
			'Optimisation architecture front-end.',
			"Création d'un système de gestion de contenu modulaire permettant une mise à jour facile de contenus.",
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
