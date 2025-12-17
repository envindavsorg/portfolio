import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
import React, { type JSX, memo } from 'react';
import { Counter } from '@/components/ui/Counter';
import { Panel } from '@/components/ui/Panel';
import { cn } from '@/lib/utils';
import { FOLLOWERS_CONFIG } from './config/followers-config';
import { SOCIAL_LINKS } from './data/social-links';

type ContactProps = {
	github: number;
	linkedin: number;
	capture?: boolean;
};

type SocialLinkItemProps = {
	link: (typeof SOCIAL_LINKS)[number];
	count: number;
	config?: (typeof FOLLOWERS_CONFIG)[keyof typeof FOLLOWERS_CONFIG];
	capture: boolean;
};

const SocialLinkItem = ({
	link,
	count,
	config,
	capture,
}: SocialLinkItemProps): React.JSX.Element => (
	<Link
		aria-label={link.description}
		href={link.href}
		rel="noopener noreferrer"
		target="_blank"
		className={cn(
			'group/link flex cursor-pointer select-none items-center gap-x-3 rounded-2xl p-4 transition-colors',
			'max-sm:screen-line-before max-sm:screen-line-after',
			'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after',
		)}
	>
		<Image
			alt={link.title}
			className="shrink-0 object-cover object-center"
			height={46}
			width={46}
			src={link.icon}
			quality={90}
		/>

		<div className="flex flex-1 flex-col gap-y-0.5">
			<h3 className="font-medium text-sm sm:text-base">{link.title}</h3>
			<p className="text-muted-foreground text-xs sm:text-sm">
				{link.handle}
				{config && (
					<>
						{' - '}
						<span className="font-semibold text-theme">
							{capture ? (
								count
							) : (
								<Counter step={config.step} value={count} />
							)}{' '}
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

export const Contact = memo(
	({ github, linkedin, capture = false }: ContactProps): JSX.Element => {
		const counts: Record<string, number> = { github, linkedin };

		return (
			<Panel>
				<div className="relative">
					<div
						aria-hidden="true"
						className="-z-1 pointer-events-none absolute inset-0 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2"
					>
						<div className="border-edge border-r" />
						<div className="border-edge border-l" />
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{SOCIAL_LINKS.map((link) => {
							const config =
								FOLLOWERS_CONFIG[
									link.title as keyof typeof FOLLOWERS_CONFIG
								];

							const currentCount = config
								? (counts[config.key] ?? 0)
								: 0;

							return (
								<SocialLinkItem
									key={link.href}
									link={link}
									config={config}
									count={currentCount}
									capture={capture}
								/>
							);
						})}
					</div>
				</div>
			</Panel>
		);
	},
);
