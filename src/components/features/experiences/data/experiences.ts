export type ExperiencePositionIcon = 'code' | 'design' | 'education';

export type ExperiencePosition = {
	id: string;
	title: string;
	employmentPeriod: {
		start: string;
		end?: string;
	};
	employmentType?: string;
	description?: string;
	icon?: ExperiencePositionIcon;
	skills?: string[];
	isExpanded?: boolean;
};

export type Experience = {
	id: string;
	companyName: string;
	positions: ExperiencePosition[];
	isCurrentEmployer?: boolean;
};

export const EXPERIENCES: Experience[] = [
	{
		id: 'wefix-by-fnac',
		companyName: 'WeFix by Fnac & Darty',
		positions: [
			{
				id: '3e831244-8d8c-41e2-b2ce-7f3946956afd',
				title: 'Développeur Front-end',
				employmentPeriod: {
					start: '2020',
				},
				employmentType: 'CDI',
				description: `
- Contribution majeure à la refonte du site web de WeFix, améliorant l'expérience utilisateur et l'efficacité du parcours client.
- Développement et intégration de nouvelles fonctionnalités web, répondant aux besoins des départements internes et des partenaires stratégiques comme Bouygues Telecom, Garantie Privée, Assurant, FNAC et Darty, assurant une harmonisation des systèmes et une expansion des services proposés.
- Intégration d'APIs avec l'équipe Backend pour améliorer les fonctionnalités.
- Conception d'un design system évolutif pour garantir cohérence et efficacité.`,
				icon: 'code',
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
				],
				isExpanded: true,
			},
			{
				id: '73151add-7adf-4035-a237-b5803ceb5478',
				title: 'Designer Web UX/UI',
				employmentPeriod: {
					start: '2020',
				},
				employmentType: 'CDI',
				description: `
- Conçu des landing pages pour des clients entreprises.
- Refonte site e-commerce et espace client pour un design moderne sur web et mobile.
- Amélioré l'UX en optimisant l'ergonomie, la navigation et les parcours utilisateurs.`,
				icon: 'design',
				skills: [
					'UX/UI',
					'Figma',
					'Sketch',
					'Design System',
					'Prototyping',
					'Wireframes',
					'Usability Testing',
				],
				isExpanded: true,
			},
		],
		isCurrentEmployer: true,
	},
	{
		id: 'spinalcom',
		companyName: 'Spinalcom',
		positions: [
			{
				id: 'f0becfba-057d-40db-b252-739e1654faa1',
				title: 'Designer Web & Développeur Web',
				employmentPeriod: {
					start: '2019',
					end: '2020',
				},
				employmentType: 'Alternance',
				description: `
- Participation active au développement d'un tableau de bord de gestion des équipements connectés, améliorant la surveillance et le contrôle des infrastructures pour les clients de SpinalCom.
- Refonte du site Web et élaboration de maquettes pour de nouveaux projets.
- Créé une carte interactive pour afficher les données des stations de surveillance.
- Conçu une landing page WordPress personnalisable.`,
				icon: 'code',
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
			},
		],
	},
	{
		id: 'economat-des-armees',
		companyName: 'Économat des Armées',
		positions: [
			{
				id: 'a3d5e6f7-8b9c-4d1e-a2b3-c4d5e6f7a8b9',
				title: 'Développeur Web & Multi-plateforme',
				employmentPeriod: {
					start: '2017',
					end: '2019',
				},
				employmentType: 'Alternance',
				description: `
- Développé un site intranet sécurisé pour le ministère des Armées avec authentification SSO et gestion granulaire des droits d'accès, facilitant la collaboration entre les différents services de l'Économat.
- Conçu et implémenté un annuaire interne permettant la recherche avancée de personnel avec filtres multi-critères, améliorant significativement l'accessibilité aux informations et réduisant le temps de recherche de contacts.
- Optimisé l'architecture front-end en React/TypeScript pour garantir des performances élevées malgré un volume important de données sensibles, avec un système de cache intelligent et un chargement progressif des contenus.
- Mis en place un système de gestion de contenu modulaire permettant aux administrateurs de publier et mettre à jour facilement les actualités, documents et ressources internes sans intervention technique.`,
				icon: 'code',
				skills: [
					'React',
					'TypeScript',
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
			},
		],
	},
	{
		id: 'education',
		companyName: 'Éducation',
		positions: [
			{
				id: 'c47f5903-88ae-4512-8a50-0b91b0cf99b6',
				title: 'ETNA (École des Technologies Numériques Avancées)',
				employmentPeriod: {
					start: '2016',
					end: '2020',
				},
				icon: 'education',
				description: `
- Master développement web et mobile (Bac+5) à l'ETNA, école d'ingénierie informatique`,
				skills: [
					'Java',
					'Python',
					'JavaScript',
					'C',
					'C++',
					'PHP',
					'MySQL',
					'MongoDB',
					'TypeScript',
					'Vue.js',
					'HTML',
					'CSS',
					'SQL',
					'NoSQL',
					'React',
					'Node.js',
					'Android',
					'Git',
					'Agile',
					'Scrum',
					'Project Management',
					'Algorithmie',
				],
			},
			{
				id: '70131ed8-36d9-4e54-8c78-eaed18240eca',
				title: 'Licence scientifique - Université des Sciences UM2 Montpellier',
				employmentPeriod: {
					start: '2013',
					end: '2016',
				},
				icon: 'education',
				description: `
- Licence scientifique (Bac+3) à l'Université des Sciences UM2 Montpellier, spécialité Biologie`,
			},
			{
				id: '36c4c6fb-02d0-48c0-8947-fda6e9a24af7',
				title: 'Baccalauréat scientifique - Spécialité Biologie',
				employmentPeriod: {
					start: '2010',
					end: '2013',
				},
				icon: 'education',
				description: `
- Baccalauréat scientifique (Bac) au Lycée Jean Moulin (Pézenas) avec la spécialité Biologie`,
			},
		],
	},
];
