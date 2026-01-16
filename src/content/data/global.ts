const USER = {
	firstName: 'Florin',
	lastName: 'Cuzeac',
	fullName: 'Florin Cuzeac',
	username: 'envindavsorg',
	gender: 'homme',
	pronouns: 'il/lui',
	bio: 'Crée, code, innove. Les petits détails comptent.',
	phoneNumber: '06 58 05 86 65',
	emailAddress: 'contact@cuzeacflorin.fr',
	location: {
		city: 'Paris, France',
	},
	photo: '/images/photo.webp',
	avatar: '/images/avatar.webp',
	og: '/images/og-image-dark.png?t=1755355653',
	pronunciation: '/audio/florin.mp3',
} satisfies USER;

const OVERVIEW = {
	sentences: [
		'Imagine, code, crée, inspire.',
		'Chaque petit pixel compte !',
		'Du concept au déploiement !',
		'Chaque petit détail compte !',
	],
} satisfies OVERVIEW;

const SOCIAL = {
	github: 'https://github.com/envindavsorg/',
	linkedin: 'https://fr.linkedin.com/in/cuzeacflorin/',
	portfolio: 'https://cuzeacflorin.fr/',
} satisfies SOCIAL;

const WORK = {
	title: 'Développeur Full-Stack',
	experience: "7 ans d'expérience",
	jobs: [
		{
			title: 'Développeur Front-End Senior',
			company: 'WeFix by Fnac',
			website: 'https://wefix.net/',
		},
		{
			title: 'Développeur web & Designer UI/UX',
			company: 'SpinalCom',
			website: 'https://www.spinalcom.com/en/',
		},
		{
			title: 'Développeur Multi-plateformes',
			company: 'Économat des Armées',
			website: 'https://www.economat-armees.com/',
		},
	],
} satisfies WORK;

const CV = {
	url: 'https://cfhi75vpdo.ufs.sh/f/tIhJKzZYPGQBq3bQllCjGzmQByFvYMdbDwUilx4TH8AX3eZ5',
	name: 'cv_florin_cuzeac.pdf',
} satisfies CV;

const GLOBAL_DATA = {
	USER,
	OVERVIEW,
	SOCIAL,
	WORK,
	CV,

	// other
	keywords: [
		'web developer',
		'web designer',
		'front-end developer',
		'front-end designer',
		'html',
		'css',
		'javascript',
		'typescript',
		'react',
		'nextjs',
		'tailwindcss',
		'nodejs',
		'pnpm',
		'git',
		'markdown',
	],
};

export default GLOBAL_DATA;
