import {
	BriefcaseIcon,
	CatIcon,
	EnvelopeIcon,
	FlaskIcon,
	GenderMaleIcon,
	GithubLogoIcon,
	NavigationArrowIcon,
	PhoneIcon,
} from '@phosphor-icons/react/ssr';

export const USER: User = {
	firstName: 'Florin',
	lastName: 'Cuzeac',
	username: 'envindavsorg',
	gender: 'homme',
	pronouns: 'il/lui',
	bio: 'Crée, code, innove. Les petits détails comptent.',
	phoneNumber: 'MDYgNTggMDUgODYgNjU=',
	emailAddress: 'Y29udGFjdEBjdXplYWNmbG9yaW4uZnI=',
	overview: [
		{
			id: 'job-title',
			content: 'Développeur Front-End Senior',
			icon: BriefcaseIcon,
			className: 'col-span-full sm:col-span-3',
		},
		{
			id: 'experience-level',
			content: "7 ans d'expérience",
			icon: FlaskIcon,
			className: 'col-span-3',
		},
		{
			id: 'location-city',
			content: 'Paris, France',
			icon: NavigationArrowIcon,
			className: 'col-span-3 lg:col-span-2 lg:row-start-2',
		},
		{
			id: 'github-username',
			content: '@envindavsorg',
			icon: GithubLogoIcon,
			className: 'col-span-3 lg:col-span-2 lg:col-start-3 lg:row-start-2',
		},
		{
			id: 'cat-person',
			content: "J'adore les chats !",
			icon: CatIcon,
			className: 'col-span-3 lg:col-span-2 lg:col-start-5 lg:row-start-2',
		},
		{
			id: 'phone-number',
			content: 'MDYgNTggMDUgODYgNjU=',
			icon: PhoneIcon,
			className:
				'col-span-full sm:col-span-3 lg:col-span-2 lg:col-start-1 lg:row-start-3',
		},
		{
			id: 'email-address',
			content: 'Y29udGFjdEBjdXplYWNmbG9yaW4uZnI=',
			icon: EnvelopeIcon,
			className:
				'col-span-full sm:col-span-3 lg:col-span-2 lg:col-start-3 lg:row-start-3',
		},
		{
			id: 'pronouns-info',
			content: 'il/lui',
			icon: GenderMaleIcon,
			className:
				'col-span-full sm:col-span-3 lg:col-span-2 lg:col-start-5 lg:row-start-3',
		},
	],
	location: {
		city: 'Paris, France',
	},
	website: 'cuzeacflorin.fr',
	jobTitle: 'Développeur et designer web',
	photo: '/images/photo.webp',
	avatar: '/images/avatar.webp',
	ogImage: '/images/og-image-dark.png?t=1755355653',
	namePronunciationUrl: '/audio/florin.mp3',
	documents: {
		cv: {
			content: `
Découvrez mon parcours professionnel à travers mon **CV détaillé**, qui retrace mes expériences,
compétences techniques et réalisations dans le développement web full-stack.
Vous y trouverez un **aperçu complet** de mon expertise et de ma progression dans le domaine.

Pour recevoir une **copie actualisée** directement dans votre boîte e-mail, cliquez sur le bouton ci-dessous.
Je serai ravi d'échanger avec vous sur d'éventuelles opportunités de collaboration.
`,
			url: 'https://cfhi75vpdo.ufs.sh/f/tIhJKzZYPGQBK8EOh2yC0cvWBVTAho18bNy962uEXQ7DIUpY',
			name: 'cv_florin_cuzeac.pdf',
			title: 'Voir ou télécharger mon CV',
		},
	},
	jobs: [
		{
			title: 'Développeur Front-End Senior',
			company: 'WeFix by Fnac',
			website: 'https://wefix.net',
		},
	],
	about: `
Mon parcours a commencé simplement — un ami m'a montré comment créer un site web basique avec **HTML** et **CSS**.
Au début, c'était de l'expérimentation pure. Je copiais du code depuis **Stack Overflow** sans totalement le comprendre.
Mes premiers sites étaient bruts : des divs excessives, du **CSS** inline, aucune responsivité.
**JavaScript** m'a défié pendant des semaines, particulièrement avec les ***callbacks*** et les ***promises***.
J'ai dû relire les mêmes explications **10 fois** avant de comprendre.
Mais voir le code prendre vie dans le navigateur était immédiatement gratifiant.

Un collègue m'a suggéré : ***"Essaie React, tu verras, c'est génial !"***
Initialement, je trouvais ça inutilement complexe.
Après quelques projets, j'ai compris la valeur : plus de manipulation manuelle du **DOM**, les **composants réutilisables** sont devenus un vrai changement de paradigme.
**TypeScript** a suivi peu après.
J'étais sceptique jusqu'à perdre **3 heures** à déboguer une faute de frappe dans un nom de propriété.
Désormais, coder sans **TypeScript** me semble incomplet — il détecte les erreurs avant qu'elles ne deviennent des problèmes.

**Next.js** a été transformateur.
Plus d'heures à configurer **Webpack**. **Routing automatique**, **SSR**, **API routes** — tout prêt dès le départ.
**Tailwind CSS** a d'abord divisé mon opinion. ***"Ça encombre le HTML"***, ***"Ce n'est pas maintenable"***.
Une fois adapté, impossible de revenir en arrière.
Finis les fichiers CSS de **2000 lignes** où personne ne savait ce qui servait encore.

Aujourd'hui, je construis des projets **Next.js/TypeScript/Tailwind** efficacement.
Ce qui prenait **des jours** prend maintenant **des heures**.
Les composants sont **optimisés**, le code est **propre**, les **performances** sont au top.
Le meilleur ?
Je continue d'apprendre quotidiennement : un **nouveau hook**, une **meilleure structure de composants**, une technique pour **réduire les re-renders**.
Même après des années, voir le code se transformer en application fonctionnelle reste profondément satisfaisant.
`,
	keywords: [
		'florin',
		'cuzeac',
		'cuzeac florin',
		'florin cuzeac',
		'envindavsorg',
		'dev',
		'developer',
		'web developer',
		'web designer',
		'front-end developer',
		'front-end designer',
		'freelance',
		'freelance developer',
		'freelance web developer',
		'freelance web designer',
		'freelance front-end developer',
		'freelance front-end designer',
		'paris',
		'france',
		'html',
		'css',
		'sass',
		'javascript',
		'typescript',
		'react',
		'nextjs',
		'tailwindcss',
		'nodejs',
		'npm',
		'pnpm',
		'postgresql',
		'pug',
		'vue',
		'git',
		'bun',
		'express',
		'fastify',
		'markdown',
		'mongodb',
	],
	dateCreated: '2025-09-01',
};
