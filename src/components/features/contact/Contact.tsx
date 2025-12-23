import type React from 'react';
import { memo } from 'react';
import { Panel } from '@/components/ui/Panel';
import { FOLLOWERS_CONFIG } from './config/followers-config';
import { SOCIAL_LINKS } from './data/social-links';
import { SocialLinkItem } from './SocialLinkItem';

interface ContactProps {
	github: number;
	linkedin: number;
	capture?: boolean;
}

export const Contact = memo(
	({ github, linkedin, capture = false }: ContactProps): React.JSX.Element => {
		const counts: Record<string, number> = { github, linkedin };

		return (
			<Panel>
				<div className="relative">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2"
					>
						<div className="border-edge border-r" />
						<div className="border-edge border-l" />
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{SOCIAL_LINKS.map((link) => {
							const config =
								FOLLOWERS_CONFIG[link.title as keyof typeof FOLLOWERS_CONFIG];

							const currentCount = config ? (counts[config.key] ?? 0) : 0;

							return (
								<SocialLinkItem
									capture={capture}
									config={config}
									count={currentCount}
									key={link.href}
									link={link}
								/>
							);
						})}
					</div>
				</div>
			</Panel>
		);
	}
);
