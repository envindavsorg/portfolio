'use client';

import { ArrowUpRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import posthog from 'posthog-js';
import type React from 'react';
import { useRef } from 'react';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LinkedinIcon } from '@/components/icons/LinkedInIcon';
import { Counter } from '@/components/ui/Counter';
import { cn } from '@/lib/utils';
import { FOLLOWERS_CONFIG, type SocialLinksProps } from './content';

interface SocialLinkItemProps {
	followers: {
		github: number;
		linkedin: number;
	};
	content: SocialLinksProps;
}

const isCapture = process.env.ENV_TYPE === 'capture';

const ContactItem = ({ followers, content }: SocialLinkItemProps): React.JSX.Element => {
	const config = FOLLOWERS_CONFIG[content.name as keyof typeof FOLLOWERS_CONFIG];
	const currentCount = config ? (followers[config.key] ?? 0) : 0;
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<Link
			aria-label={content.name}
			className={cn(
				'group/link flex cursor-pointer select-none items-center gap-x-3 rounded-2xl p-4 transition-colors',
				'max-sm:screen-line-before max-sm:screen-line-after sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after'
			)}
			href={content.link}
			onClick={() => {
				posthog.capture('social_link_clicked', {
					platform: content.name.toLowerCase(),
					handle: content.username,
					url: content.link,
				});
			}}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			rel="noopener noreferrer"
			target="_blank"
		>
			{content.icon === 'GitHub' ? (
				<GitHubIcon className="relative after:absolute after:-inset-2" ref={iconRef} />
			) : (
				<LinkedinIcon className="relative after:absolute after:-inset-2" ref={iconRef} />
			)}

			<div className="flex flex-col gap-y-0.5">
				<span className="text-muted-foreground text-xs">{content.name}</span>
				<p className="flex items-baseline gap-x-1 font-semibold text-base text-foreground">
					{content.username}
					{config && (
						<span className="font-light text-theme text-xs">
							({isCapture ? currentCount : <Counter value={currentCount} />} {config.label})
						</span>
					)}
				</p>
			</div>

			<ArrowUpRightIcon
				className="ms-auto size-5 transition-transform duration-300 group-hover/link:rotate-45 group-hover/link:text-theme"
				weight="duotone"
			/>
		</Link>
	);
};

ContactItem.displayName = 'ContactItem';

export { ContactItem };
