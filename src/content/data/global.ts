import {
	BriefcaseIcon,
	CatIcon,
	EnvelopeIcon,
	FlaskIcon,
	GenderMaleIcon,
	GithubLogoIcon,
	NavigationArrowIcon,
	PhoneIcon,
} from '@phosphor-icons/react/dist/ssr';

const USER = {
	firstName: 'Florin',
	lastName: 'Cuzeac',
	fullName: 'Florin Cuzeac',
	username: 'envindavsorg',
	gender: 'homme',
	pronouns: 'il/lui',
	bio: 'Crée, code, innove. Les petits détails comptent.',
	phoneNumber: 'MDYgNTggMDUgODYgNjU=',
	emailAddress: 'Y29udGFjdEBjdXplYWNmbG9yaW4uZnI=',
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
	content: [
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
			className: 'col-span-full sm:col-span-3 lg:col-span-2 lg:col-start-1 lg:row-start-3',
		},
		{
			id: 'email-address',
			content: 'Y29udGFjdEBjdXplYWNmbG9yaW4uZnI=',
			icon: EnvelopeIcon,
			className: 'col-span-full sm:col-span-3 lg:col-span-2 lg:col-start-3 lg:row-start-3',
		},
		{
			id: 'pronouns-info',
			content: 'il/lui',
			icon: GenderMaleIcon,
			className: 'col-span-full sm:col-span-3 lg:col-span-2 lg:col-start-5 lg:row-start-3',
		},
	],
} satisfies OVERVIEW;

const SOCIAL = {
	github: 'https://github.com/envindavsorg/',
	linkedin: 'https://fr.linkedin.com/in/cuzeacflorin/',
	portfolio: 'https://cuzeacflorin.fr/',
} satisfies SOCIAL;

const WORK = {
	title: 'Développeur Full-Stack',
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
