export type SocialPlatform = 'GitHub' | 'LinkedIn';

export interface SocialLinksProps {
	name: SocialPlatform;
	username: string;
	description: string;
	link: string;
	icon: SocialPlatform;
}

export const SOCIAL_LINKS: SocialLinksProps[] = [
	{
		name: 'LinkedIn',
		username: '@cuzeacflorin',
		description: 'Retrouvez-moi sur LinkedIn !',
		link: 'https://linkedin.com/in/cuzeacflorin',
		icon: 'LinkedIn',
	},
	{
		name: 'GitHub',
		username: '@envindavsorg',
		description: 'Retrouvez-moi sur GitHub !',
		link: 'https://github.com/envindavsorg',
		icon: 'GitHub',
	},
];

export const FOLLOWERS_CONFIG = {
	GitHub: {
		step: 10,
		label: 'abonnés',
		key: 'github',
	},
	LinkedIn: {
		step: 1000,
		label: 'abonnés',
		key: 'linkedin',
	},
} as const;
