'use client';

import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { TextAnimate } from '@/components/text/TextAnimate';
import { cn } from '@/lib/utils';

export const Panel = ({ className, ...props }: ComponentProps<'section'>) => (
	<section
		className={cn('border-edge border-x', className)}
		data-slot="panel"
		{...props}
	/>
);

export const PanelHeader = ({
	className,
	ref,
	sticky,
	title,
	...props
}: ComponentProps<'div'> & { sticky?: boolean; title?: string }) => {
	const headerRef = useRef<HTMLDivElement>(null);
	const [isStuck, setIsStuck] = useState(false);

	useEffect(() => {
		if (!sticky) {
			return;
		}

		const handleScroll = () => {
			const header = headerRef.current;
			if (!header) {
				return;
			}
			const rect = header.getBoundingClientRect();
			setIsStuck(Math.abs(rect.top - 56) < 2);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [sticky]);

	if (!sticky) {
		return (
			<div
				className={cn('screen-line-after px-3', className)}
				data-slot="panel-header"
				{...props}
			/>
		);
	}

	return (
		<div
			className={cn(
				'screen-line-after sticky top-14 z-10 px-3 transition-colors duration-300',
				isStuck ? 'bg-theme text-black' : 'bg-background text-foreground',
				className
			)}
			data-slot="panel-header"
			ref={headerRef}
			{...props}
		>
			<PanelTitle className={cn(isStuck && 'text-center text-xl sm:text-2xl')}>
				{isStuck ? (
					<TextAnimate animation="slideLeft" by="character">
						{`-- ${title} --`}
					</TextAnimate>
				) : (
					<TextAnimate animation="slideLeft" by="character" delay={0.2}>
						{title ?? ''}
					</TextAnimate>
				)}
			</PanelTitle>
		</div>
	);
};

export const PanelTitle = ({ className, ...props }: ComponentProps<'h2'>) => (
	<h2
		className={cn('font-semibold text-2xl sm:text-3xl', className)}
		data-slot="panel-title"
		{...props}
	/>
);

export const PanelContent = ({
	className,
	...props
}: ComponentProps<'div'>) => (
	<div
		className={cn('space-y-1.5 p-3', className)}
		data-slot="panel-body"
		{...props}
	/>
);

export const PanelFooter = ({ className, ...props }: ComponentProps<'div'>) => (
	<div
		className={cn(
			'screen-line-before flex justify-between gap-3 px-3 py-2 max-sm:flex-col sm:justify-end',
			className
		)}
		data-slot="panel-footer"
		{...props}
	/>
);
