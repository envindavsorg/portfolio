'use client';

import { ArrowUpRightIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import posthog from 'posthog-js';
import type React from 'react';
import { Counter } from '@/components/ui/Counter';
import { cn } from '@/lib/utils';
import type { FOLLOWERS_CONFIG } from './config/followers-config';
import type { SOCIAL_LINKS } from './data/social-links';

type SocialLinkItemProps = {
	link: (typeof SOCIAL_LINKS)[number];
	count: number;
	config?: (typeof FOLLOWERS_CONFIG)[keyof typeof FOLLOWERS_CONFIG];
	capture: boolean;
};

export const SocialLinkItem = ({
	link,
	count,
	config,
	capture,
}: SocialLinkItemProps): React.JSX.Element => (
	<Link
		aria-label={`${link.title} - ${link.description}`}
		className={cn(
			'group/link flex cursor-pointer select-none items-center gap-x-3 rounded-2xl p-4 transition-colors',
			'max-sm:screen-line-before max-sm:screen-line-after',
			'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after'
		)}
		href={link.href}
		onClick={() => {
			posthog.capture('social_link_clicked', {
				platform: link.title.toLowerCase(),
				handle: link.handle,
				url: link.href,
			});
		}}
		rel="noopener noreferrer"
		target="_blank"
	>
		<Image
			alt={link.title}
			className="shrink-0 object-cover object-center"
			height={46}
			quality={90}
			src={link.icon}
			width={46}
		/>

		<div className="flex flex-1 flex-col gap-y-0.5">
			<h3 className="font-medium text-sm sm:text-base">{link.title}</h3>
			<p className="text-muted-foreground text-xs sm:text-sm">
				{link.handle}
				{config && (
					<>
						{' - '}
						<span className="font-semibold text-theme">
							{capture ? count : <Counter step={config.step} value={count} />}{' '}
							{config.label}
						</span>
					</>
				)}
			</p>
		</div>

		<ArrowUpRightIcon
			className="size-5 text-muted-foreground transition-transform duration-300 group-hover/link:rotate-45 group-hover/link:text-theme"
			weight="duotone"
		/>
	</Link>
);
