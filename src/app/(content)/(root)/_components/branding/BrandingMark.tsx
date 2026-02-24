'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { LinkIcon } from '@/components/blocks/icons/LinkIcon';
import { Button, CopyButton } from '@/components/primitives/Button';
import { cn } from '@/lib/utils';

const Mark = () => (
	<svg
		fill="none"
		height="36"
		viewBox="0 0 39 26"
		width="49"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			className="stroke-foreground"
			d="M30 1H34C36.2091 1 38 2.79086 38 5C38 7.20914 36.2091 9 34 9H30V1Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-foreground"
			d="M22 13C22 10.7909 23.7909 9 26 9H30V17H26C23.7909 17 22 15.2091 22 13Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-foreground"
			d="M22 5C22 2.79086 23.7909 1 26 1H30V9H26C23.7909 9 22 7.20914 22 5Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-theme"
			d="M30 13C30 10.7909 31.7909 9 34 9C36.2091 9 38 10.7909 38 13C38 15.2091 36.2091 17 34 17C31.7909 17 30 15.2091 30 13Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-foreground"
			d="M22 21C22 18.7909 23.7909 17 26 17H30V21C30 23.2091 28.2091 25 26 25C23.7909 25 22 23.2091 22 21Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-foreground"
			d="M9 17H17V19C17 22.3137 14.3137 25 11 25H9V17Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-foreground"
			d="M1 7C1 3.68629 3.68629 1 7 1H9V9H1V7Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-foreground"
			d="M9 1H11C14.3137 1 17 3.68629 17 7V9H9V1Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-theme"
			d="M1 13C1 10.7909 2.79086 9 5 9C7.20914 9 9 10.7909 9 13C9 15.2091 7.20914 17 5 17C2.79086 17 1 15.2091 1 13Z"
			strokeWidth="1.25"
		/>
		<path
			className="stroke-foreground"
			d="M1 17H9V25H7C3.68629 25 1 22.3137 1 19V17Z"
			strokeWidth="1.25"
		/>
	</svg>
);

const MARK_SVG = `<svg fill="none" height="36" viewBox="0 0 39 26" width="49" xmlns="http://www.w3.org/2000/svg">
<path d="M30 1H34C36.2091 1 38 2.79086 38 5C38 7.20914 36.2091 9 34 9H30V1Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M22 13C22 10.7909 23.7909 9 26 9H30V17H26C23.7909 17 22 15.2091 22 13Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M22 5C22 2.79086 23.7909 1 26 1H30V9H26C23.7909 9 22 7.20914 22 5Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M30 13C30 10.7909 31.7909 9 34 9C36.2091 9 38 10.7909 38 13C38 15.2091 36.2091 17 34 17C31.7909 17 30 15.2091 30 13Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M22 21C22 18.7909 23.7909 17 26 17H30V21C30 23.2091 28.2091 25 26 25C23.7909 25 22 23.2091 22 21Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M9 17H17V19C17 22.3137 14.3137 25 11 25H9V17Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M1 7C1 3.68629 3.68629 1 7 1H9V9H1V7Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M9 1H11C14.3137 1 17 3.68629 17 7V9H9V1Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M1 13C1 10.7909 2.79086 9 5 9C7.20914 9 9 10.7909 9 13C9 15.2091 7.20914 17 5 17C2.79086 17 1 15.2091 1 13Z" stroke="currentColor" stroke-width="1.25"/>
<path d="M1 17H9V25H7C3.68629 25 1 22.3137 1 19V17Z" stroke="currentColor" stroke-width="1.25"/>
</svg>`;

export const BrandingMark = () => {
	const iconRef = useRef<AnimatedIconHandle>(null);

	return (
		<div
			className={cn(
				'flex items-center justify-evenly',
				'px-8 after:z-1 max-sm:flex-col max-sm:gap-y-4 max-sm:py-4'
			)}
		>
			<div className="flex items-center gap-x-6">
				<Mark />
				<div className="flex flex-col gap-y-1">
					<p className="text-muted-foreground text-xs leading-snug">identité</p>
					<p className="font-medium text-sm">logo principal</p>
				</div>
				<CopyButton className="ms-3" value={MARK_SVG} />
			</div>

			<div className="flex items-center gap-x-6">
				<div className="flex aspect-square size-12 shrink-0 items-center justify-center rounded-lg border border-theme/15 bg-background text-2xl ring-1 ring-theme ring-offset-1 ring-offset-background">
					@
				</div>
				<div className="flex flex-col gap-y-1">
					<p className="text-muted-foreground text-xs leading-snug">
						police d'écriture
					</p>
					<p className="font-medium font-pixel-square text-foreground text-sm">
						Geist Pixel
					</p>
				</div>
				<Button
					asChild
					onMouseEnter={() => iconRef.current?.startAnimation()}
					onMouseLeave={() => iconRef.current?.stopAnimation()}
					size="icon"
					variant="outline"
				>
					<Link
						aria-label="Voir la police Geist"
						href="https://vercel.com/blog/introducing-geist-pixel"
						rel="noopener noreferrer"
						target="_blank"
					>
						<LinkIcon ref={iconRef} />
						<span className="sr-only">Voir la police Geist</span>
					</Link>
				</Button>
			</div>
		</div>
	);
};
