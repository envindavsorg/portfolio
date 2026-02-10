'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LinkedinIcon } from '@/components/icons/LinkedInIcon';
import { Counter } from '@/components/ui/Counter';
import { FOLLOWERS_CONFIG, type SocialLinksProps } from './content';

interface SocialLinkItemProps {
	followers: {
		github: number;
		linkedin: number;
	};
	content: SocialLinksProps;
}

const isCapture = process.env.ENV_TYPE === 'capture';

const ContactItem = ({ followers, content }: SocialLinkItemProps) => {
	const config =
		FOLLOWERS_CONFIG[content.name as keyof typeof FOLLOWERS_CONFIG];
	const currentCount = config ? (followers[config.key] ?? 0) : 0;
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Link
			aria-label={content.name}
			className="flex items-center"
			href={content.link}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			rel="noopener noreferrer"
			target="_blank"
		>
			<div className="m-3 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
				{content.icon === 'GitHub' ? (
					<GitHubIcon ref={iconRef} size={26} />
				) : (
					<LinkedinIcon ref={iconRef} size={26} />
				)}
			</div>

			<div className="w-full flex-1 border-edge border-l px-3 py-4 text-left">
				<span className="text-muted-foreground text-xs">{content.name}</span>
				<p className="flex items-baseline gap-x-1 font-semibold text-base text-foreground">
					{content.username}
					{config && (
						<span className="font-light text-theme text-xs">
							({isCapture ? currentCount : <Counter value={currentCount} />}{' '}
							{config.label})
						</span>
					)}
				</p>
			</div>
		</Link>
	);
};

ContactItem.displayName = 'ContactItem';

export { ContactItem };
