import type { StaticImageData } from 'next/image';
import githubImage from '@/images/github.webp';
import linkedinImage from '@/images/linkedin.webp';

export type SocialLinksProps = {
	icon: StaticImageData;
	title: string;
	handle: string;
	description?: string;
	href: string;
};

export const SOCIAL_LINKS: SocialLinksProps[] = [
	{
		icon: linkedinImage,
		title: 'LinkedIn',
		handle: '@cuzeacflorin',
		description: 'Retrouvez-moi sur LinkedIn !',
		href: 'https://linkedin.com/in/cuzeacflorin',
	},
	{
		icon: githubImage,
		title: 'GitHub',
		handle: '@envindavsorg',
		description: 'Retrouvez-moi sur GitHub !',
		href: 'https://github.com/envindavsorg',
	},
];
