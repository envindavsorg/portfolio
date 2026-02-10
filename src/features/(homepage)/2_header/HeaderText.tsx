'use client';

import { useIntersectionObserver } from '@uidotdev/usehooks';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { TextAnimate } from '@/components/text/TextAnimate';
import { cn } from '@/lib/utils';

interface HeaderTextProps {
	message: string;
}

export const HeaderText = ({ message }: HeaderTextProps) => {
	const [ref, entry] = useIntersectionObserver({
		threshold: 0,
		rootMargin: '50px',
	});

	const isVisible = entry?.isIntersecting ?? true;

	const meteors = useMemo(
		() =>
			Array.from({ length: 30 }, (_, idx) => ({
				id: idx,
				style: {
					top: -40,
					left: idx * (800 / 30) - 400,
					animationDelay: `${(idx * 0.7) % 5}s`,
					animationDuration: `${5 + (idx % 5)}s`,
				} as const,
			})),
		[]
	);

	return (
		<div
			className="relative flex grow items-end overflow-hidden px-2 py-1 sm:px-4"
			ref={ref}
		>
			<TextAnimate
				animation="slideLeft"
				by="character"
				className="line-clamp-1 text-muted-foreground text-xs opacity-30 max-sm:hidden"
				delay={0.5}
				once
			>
				{message}
			</TextAnimate>
			<TextAnimate
				animation="slideLeft"
				by="character"
				className="line-clamp-1 text-theme text-xs sm:hidden"
				delay={0.5}
				once
			>
				{message.match(/[^.!?]*[.!?]\s*$/)?.[0]?.trim() || message}
			</TextAnimate>

			<motion.div
				animate={{ opacity: 1 }}
				aria-hidden="true"
				initial={{ opacity: 0 }}
				transition={{ duration: 0.5 }}
			>
				{meteors.map(({ id, style }) => (
					<span
						className={cn(
							'absolute -z-10 h-0.5 w-0.5 rotate-45 rounded-full',
							isVisible && 'animate-meteor-effect',
							'bg-zinc-300 shadow-[0_0_0_1px_#ffffff10] dark:bg-zinc-800',
							'before:absolute before:top-1/2 before:h-px before:w-12.5',
							'before:bg-linear-to-r before:from-zinc-300 before:to-transparent dark:before:from-zinc-800',
							"before:-translate-y-1/2 before:content-['']"
						)}
						key={id}
						style={style}
					/>
				))}
			</motion.div>
		</div>
	);
};
