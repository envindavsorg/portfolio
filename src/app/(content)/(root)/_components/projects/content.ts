export interface Project {
	id: string;
	name: string;
	type: string;
	link: string;
	skills: string[];
	title: string;
	description: string[];
}

export const PROJECTS: Project[] = [
	{
		id: 'ts-safe-path',
		name: 'ts-safe-path',
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
		title:
			'Un utilitaire TypeScript léger pour manipuler des objets de manière type-safe.',
		description: [
			'Autocomplétion complète pour les chemins imbriqués',
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
		title:
			'Un portfolio minimaliste, avec un registre de composants et un blog.',
		description: [
			'Support des thèmes clair et sombre',
			'Design épuré et moderne',
			'Intégration vCard',
			'Optimisation SEO : schéma JSON-LD, sitemap, robots',
			'Compatible IA /llms.txt',
			'Protection contre le spam',
			'PWA installable',
			'Animations subtiles pour une meilleure UX',
		],
	},
];
