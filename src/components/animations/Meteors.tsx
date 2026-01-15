'use client';

import { motion } from 'motion/react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MeteorsProps {
	number?: number;
	className?: string;
}

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
	const meteors = useMemo(
		() =>
			Array.from({ length: number }, (_, idx) => ({
				id: idx,
				left: idx * (800 / number) - 400,
				delay: (idx * 0.7) % 5,
				duration: 5 + (idx % 5),
			})),
		[number]
	);

	return (
		<motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.5 }}>
			{meteors.map(({ id, left, delay, duration }) => (
				<span
					className={cn(
						'absolute h-0.5 w-0.5 rotate-[45deg] animate-meteor-effect rounded-full bg-zinc-300 shadow-[0_0_0_1px_#ffffff10] dark:bg-zinc-800',
						"before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-zinc-300 before:to-transparent before:content-[''] dark:before:from-zinc-800",
						className
					)}
					key={id}
					style={{
						top: -40,
						left,
						animationDelay: `${delay}s`,
						animationDuration: `${duration}s`,
					}}
				/>
			))}
		</motion.div>
	);
};
