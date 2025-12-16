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
import type React from 'react';
import { AboutContent } from '@/content/About';
import { CvContent } from '@/content/Cv';

type User = {
	firstName: string;
	lastName: string;
	displayName: string;
	username: string;
	gender: string;
	pronouns: string;
	bio: string;

	overview: {
		id: string;
		content: string;
		icon: React.ElementType;
		className: string;
	}[];

	flipSentences: string[];
	address: string;
	location: {
		city: string;
		zoom: {
			max: number;
			min: number;
			default: number;
			step: number;
		};
		latitude: number;
		longitude: number;
	};
	phoneNumber: string;
	email: string;
	website: string;
	jobTitle: string;
	jobs: {
		title: string;
		company: string;
		website: string;
	}[];
	about: string;
	photo: string;
	avatar: string;
	ogImage: string;
	namePronunciationUrl: string;
	documents: {
		cv: {
			content: string;
			url: string;
			name: string;
			title: string;
		};
	};
	keywords: string[];
	dateCreated: string;
};

export const USER: User = {
	firstName: 'Florin',
	lastName: 'Cuzeac',
	displayName: 'Florin',
	username: 'envindavsorg',
	gender: 'homme',
	pronouns: 'il/lui',
	bio: 'Crée, code, innove. Les petits détails comptent.',

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

	flipSentences: [
		'Imagine, code, crée, inspire.',
		'Chaque petit pixel compte !',
		'Du concept au déploiement !',
		'Chaque petit détail compte !',
	],
	address: 'Paris, France',
	location: {
		city: 'Paris',
		zoom: {
			max: 12,
			min: 3,
			default: 10,
			step: 0.5,
		},
		latitude: 48.858_093,
		longitude: 2.294_694,
	},
	phoneNumber: 'MDYgNTggMDUgODYgNjU=',
	email: 'Y29udGFjdEBjdXplYWNmbG9yaW4uZnI=',
	website: 'cuzeacflorin.fr',
	jobTitle: 'Développeur et designer web',
	photo: '/images/photo.webp',
	avatar: '/images/avatar.webp',
	ogImage: '/images/og-image-dark.png?t=1755355653',
	namePronunciationUrl: '/audio/florin.mp3',
	documents: {
		cv: {
			content: CvContent,
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
	about: AboutContent,
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
