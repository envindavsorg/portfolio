import type { NavigationItem } from '@/components/navigation/navbar/Nav';
import { USER } from '@/content/user';

export const SITE_INFO = {
	name: USER.displayName,
	url: 'https://cuzeacflorin.fr',
	ogImage: USER.ogImage,
	description: USER.bio,
	keywords: USER.keywords,
};

export const META_THEME_COLORS = {
	light: '#FFFFFF',
	dark: '#09090B',
};

export const MAIN_NAV: NavigationItem[] = [
	{
		title: 'Accueil',
		href: '/',
	},
	{
		title: 'Blog',
		href: '/blog',
	},
	{
		title: 'Composants',
		href: '/components',
	},
	{
		title: 'Outils',
		href: '/utils',
	},
];

export const GITHUB_USERNAME = 'envindavsorg';
export const SOURCE_CODE_GITHUB_REPO = 'envindavsorg/cuzeacflorin.fr';
export const SOURCE_CODE_GITHUB_URL =
	'https://github.com/envindavsorg/cuzeacflorin.fr';
