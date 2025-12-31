'use client';

import type { Player } from '@lordicon/react';
import { TriangleDashedIcon, TriangleIcon } from '@phosphor-icons/react';
import { useIntersectionObserver } from '@uidotdev/usehooks';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { HeartIcon } from '@/components/icons/lottie/HeartIcon';
import { PizzaIcon } from '@/components/icons/lottie/Pizza';
import { Divider } from '@/components/ui/Divider';
import { cn } from '@/lib/utils';
import { Metadata } from './Metadata';

interface FooterProps {
	commit?: {
		branch: string | undefined;
		hash: string | undefined;
		update: string | undefined;
	};
}

const Footer = ({ commit }: FooterProps) => {
	const playerHeartRef = useRef<Player>(null);
	const playerPizzaRef = useRef<Player>(null);
	const [ref, entry] = useIntersectionObserver({
		threshold: 0.1,
		rootMargin: '20px',
	});

	const isIntersecting: boolean = entry?.isIntersecting ?? false;

	useEffect(() => {
		if (isIntersecting) {
			playerHeartRef.current?.playFromBeginning();
			playerPizzaRef.current?.playFromBeginning();
		}
	}, [isIntersecting]);

	return (
		<>
			<div className="max-w-screen overflow-x-hidden px-2">
				<div className="mx-auto md:max-w-3xl">
					<Metadata commit={commit} />
					<Divider border />
				</div>
			</div>

			<footer className="max-w-screen overflow-x-hidden px-2" ref={ref}>
				<div className="screen-line-before mx-auto border-edge border-x pt-4 md:max-w-3xl">
					<div className="mb-4 flex flex-col items-center justify-center gap-3 px-4">
						<div className="flex items-center gap-x-1">
							<div className="flex items-center">
								<p className="text-balance font-mono text-muted-foreground text-xs sm:text-sm">
									Développé avec beaucoup d'
								</p>
								<HeartIcon ref={playerHeartRef} state="hover-pinch" />
							</div>
							<p className="text-balance font-mono text-muted-foreground text-xs sm:text-sm">
								et de
							</p>
							<PizzaIcon ref={playerPizzaRef} state="hover-pizza" />
							<p className="text-balance font-mono text-muted-foreground text-xs sm:text-sm">
								à Paris.
							</p>
						</div>
					</div>

					<div
						className={cn(
							'screen-line-before screen-line-after flex w-full before:z-1 after:z-1',
							'bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)]',
							'bg-size-[10px_10px] [--pattern-foreground:var(--color-edge)]/56'
						)}
					>
						<div className="mx-auto flex items-center justify-center gap-3 border-edge border-x bg-background px-4">
							<Link
								aria-label="Contexte essentiel - LLM"
								className="flex items-center gap-x-1.5 text-muted-foreground transition-colors hover:text-foreground"
								href="/llms.txt"
								rel="noopener noreferrer"
								target="_blank"
							>
								<TriangleDashedIcon className="size-5" />
								<span className="text-balance font-mono text-muted-foreground text-xs">
									Contexte essentiel
								</span>
							</Link>

							<div className="flex h-11 w-px bg-edge" />
							<div className="flex h-11 w-px bg-edge" />

							<Link
								aria-label="Contexte intégral - LLM"
								className="flex items-center gap-x-1.5 text-muted-foreground transition-colors hover:text-foreground"
								href="/llms-full.txt"
								rel="noopener noreferrer"
								target="_blank"
							>
								<TriangleIcon className="size-5" />
								<span className="text-balance font-mono text-muted-foreground text-xs">
									Contexte intégral
								</span>
							</Link>
						</div>
					</div>
				</div>

				<div className="pb-[env(safe-area-inset-bottom,0px)]">
					<div className="flex h-2" />
				</div>
			</footer>
		</>
	);
};

export { Footer };
