'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LinkedinIcon } from '@/components/icons/LinkedInIcon';
import { Counter } from '@/components/ui/Counter';

interface ContactContentProps {
	githubFollowers: number;
	linkedinFollowers: number;
}

const isCapture = process.env.ENV_TYPE === 'capture';

export const ContactContent = ({
	githubFollowers,
	linkedinFollowers,
}: ContactContentProps) => {
	const iconLinkedInRef = useRef<AnimatedIconHandle>(null);
	const iconGitHubRef = useRef<AnimatedIconHandle>(null);

	return (
		<div className="relative py-4">
			<div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
				<div className="border-edge border-r" />
				<div className="border-edge border-l" />
			</div>

			<div className="screen-line-after screen-line-before relative grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
				<Link
					aria-label="Retrouvez-moi sur LinkedIn !"
					className="flex items-center"
					href="https://linkedin.com/in/cuzeacflorin"
					onMouseEnter={() => iconLinkedInRef.current?.startAnimation()}
					onMouseLeave={() => iconLinkedInRef.current?.stopAnimation()}
					rel="noopener noreferrer"
					target="_blank"
				>
					<div className="max-sm:screen-line-after flex items-center">
						<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
							<LinkedinIcon ref={iconLinkedInRef} size={22} />
						</div>
						<div className="w-full flex-1 border-edge border-l p-3 text-left">
							<p className="text-balance font-bold font-sans text-sm">
								@cuzeacflorin{' '}
								{!isCapture && (
									<span className="font-light text-theme text-xs">
										(<Counter value={linkedinFollowers} /> abonnés)
									</span>
								)}
							</p>
						</div>
					</div>
				</Link>

				<Link
					aria-label="Retrouvez-moi sur GitHub !"
					className="flex items-center"
					href="https://github.com/envindavsorg"
					onMouseEnter={() => iconGitHubRef.current?.startAnimation()}
					onMouseLeave={() => iconGitHubRef.current?.stopAnimation()}
					rel="noopener noreferrer"
					target="_blank"
				>
					<div className="flex items-center">
						<div className="m-2 flex aspect-square size-8 shrink-0 cursor-default items-center justify-center">
							<GitHubIcon ref={iconGitHubRef} size={22} />
						</div>
						<div className="w-full flex-1 border-edge border-l p-3 text-left">
							<p className="text-balance font-bold font-sans text-sm">
								@envindavsorg{' '}
								{!isCapture && (
									<span className="font-light text-theme text-xs">
										(<Counter value={githubFollowers} /> abonnés)
									</span>
								)}
							</p>
						</div>
					</div>
				</Link>
			</div>
		</div>
	);
};
