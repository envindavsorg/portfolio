import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr';
import Image from 'next/image';
import Link from 'next/link';
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

export const Contact = ({
	github,
	linkedin,
	capture = false,
}: ContactProps) => {
	const data = { github, linkedin };

	return (
		<Panel>
			<div className="relative">
				<div className="-z-1 pointer-events-none absolute inset-0 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
					<div className="border-edge border-r" />
					<div className="border-edge border-l" />
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{SOCIAL_LINKS.map(
						({ title, description, href, icon, handle }) => {
							const config =
								FOLLOWERS_CONFIG[
									title as keyof typeof FOLLOWERS_CONFIG
								];
							const { step, label } = config;
							const count = config
								? data[config.key as keyof typeof data]
								: 0;

							return (
								<Link
									aria-label={description}
									className={cn(
										'group/link flex cursor-pointer select-none items-center gap-x-3 rounded-2xl p-4 transition-colors',
										'max-sm:screen-line-before max-sm:screen-line-after',
										'sm:nth-[2n+1]:screen-line-before sm:nth-[2n+1]:screen-line-after',
									)}
									href={href}
									key={href}
									rel="noopener noreferrer"
									target="_blank"
								>
									<Image
										alt={title}
										className="shrink-0 object-cover object-center"
										height={42}
										quality={100}
										src={icon}
										unoptimized
										width={42}
									/>

									<div className="flex flex-1 flex-col gap-y-0.5">
										<h3 className="font-semibold text-sm">
											{title}
										</h3>
										<p className="text-muted-foreground text-xs">
											{handle}
											{config && (
												<>
													{' '}
													-{' '}
													<span className="font-semibold text-theme">
														{capture ? (
															count
														) : (
															<Counter
																step={step}
																value={count}
															/>
														)}{' '}
														{label}
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
						},
					)}
				</div>
			</div>
		</Panel>
	);
};
