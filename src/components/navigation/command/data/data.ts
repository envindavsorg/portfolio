import {
	BriefcaseIcon,
	CircleHalfTiltIcon,
	CodeBlockIcon,
	CubeIcon,
	GearSixIcon,
	HouseIcon,
	IdentificationCardIcon,
	MoonIcon,
	PenNibIcon,
	ReadCvLogoIcon,
	StackIcon,
	SunIcon,
	UserSoundIcon,
} from '@phosphor-icons/react';
import { SOCIAL_LINKS } from '@/components/features/contact/data/social-links';
import { USER } from '@/config/user';
import type { CommandLinkItem } from '../types/types';

export const SOCIAL_LINK_ITEMS: CommandLinkItem[] = SOCIAL_LINKS.map(
	(item) => ({
		title: item.title,
		href: item.href,
		iconImage: item.icon,
		openInNewTab: true,
	}),
);

export const MENU_LINKS: CommandLinkItem[] = [
	{
		title: "Retourner à l'accueil",
		href: '/',
		icon: HouseIcon,
	},
	{
		title: 'Mes articles de blog',
		href: '/blog',
		icon: PenNibIcon,
	},
	{
		title: 'Mes snippets de code réutilisables',
		href: '/components',
		icon: CodeBlockIcon,
	},
	{
		title: 'Outils pour développeurs',
		href: '/utils',
		icon: GearSixIcon,
	},
];

export const MAIN_LINKS: CommandLinkItem[] = [
	{
		title: 'À propos de moi',
		href: '/#about',
		icon: UserSoundIcon,
	},
	{
		title: 'Ma stack technique',
		href: '/#stack',
		icon: StackIcon,
	},
	{
		title: 'Expériences professionnelles',
		href: '/#experience',
		icon: BriefcaseIcon,
	},
	{
		title: 'Mes projets',
		href: '/#projects',
		icon: CubeIcon,
	},
];

export const DOCUMENTS_LINKS: CommandLinkItem[] = [
	{
		title: 'Télécharger ma carte de visite',
		href: '/api/vcard',
		icon: IdentificationCardIcon,
	},
	{
		title: 'Télécharger mon CV',
		href: USER.documents.cv.url,
		icon: ReadCvLogoIcon,
	},
];

export const THEME_OPTIONS = [
	{
		value: 'light',
		label: 'Mode clair',
		icon: SunIcon,
	},
	{
		value: 'dark',
		label: 'Mode sombre',
		icon: MoonIcon,
	},
	{
		value: 'system',
		label: 'Thème automatique',
		icon: CircleHalfTiltIcon,
	},
] as const;
