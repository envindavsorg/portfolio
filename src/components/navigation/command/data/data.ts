import { SOCIAL_LINKS } from '@/components/features/contact/data/social-links';
import type { CommandLinkItem } from '../types/types';

export const SOCIAL_LINK_ITEMS: CommandLinkItem[] = SOCIAL_LINKS.map(
	(item) => ({
		title: item.title,
		href: item.href,
		iconImage: item.icon,
		openInNewTab: true,
	}),
);
