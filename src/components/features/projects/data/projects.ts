export type Project = {
	id: string;
	title: string;
	period: {
		start: string;
		end?: string;
	};
	link: string;
	skills: string[];
	description?: string;
	logo?: string;
	isExpanded?: boolean;
};

export const PROJECTS: Project[] = [
	{
		id: 'ts-safe-path',
		title: 'ts-safe-path',
		period: {
			start: '06.2025',
		},
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
		description: `
Un utilitaire TypeScript léger pour manipuler des objets profondément imbriqués de manière type-safe.

- Autocomplétion complète pour tous les chemins imbriqués
- Opérations type-safe (get, set, has, update, merge)
- Création automatique d'objets intermédiaires
- Zéro dépendance, < 2KB gzippé
- Aucun overhead runtime
- Tree-shakeable

Fonctionnalités principales :

- Typage strict avec validation à la compilation
- API fluide et intuitive
- Support des opérations CRUD sur propriétés imbriquées
- Fusion profonde d'objets avec préservation des types
- Alternative moderne aux chaînes ?. infinies
`,
	},
	{
		id: 'portfolio',
		title: 'cuzeacflorin.fr',
		period: {
			start: '03.2025',
		},
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
		description: `
Un portfolio minimaliste, registre de composants et blog.

- Design épuré et moderne
- Support des thèmes clair et sombre
- Intégration vCard
- Optimisation SEO : schéma JSON-LD, sitemap, robots
- Compatible IA /llms.txt
- Email protégé contre le spam
- PWA installable

Fonctionnalités du blog :

- Support MDX et Markdown
- Coloration syntaxique pour une meilleure lisibilité
- Flux RSS pour une distribution facilitée du contenu
- Images OG dynamiques pour des aperçus enrichis`,
	},
];
