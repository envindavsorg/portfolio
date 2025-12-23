'use client';

import type { Player } from '@lordicon/react';
import { useMotionValueEvent, useScroll } from 'motion/react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const VISIBILITY_THRESHOLD = 400;

const ScrollTop = ({
	className,
	...props
}: React.ComponentProps<'button'>): React.JSX.Element => {
	const { scrollY } = useScroll();

	const [visible, setVisible] = useState(false);
	const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
	const playerRef = useRef<Player>(null);
	const prevScrollYRef = useRef(0);

	const handleScrollChange = useCallback((latestValue: number) => {
		setVisible(latestValue >= VISIBILITY_THRESHOLD);

		const diffValue = latestValue - prevScrollYRef.current;
		if (diffValue !== 0) {
			setScrollDirection(diffValue > 0 ? 'down' : 'up');
		}
		prevScrollYRef.current = latestValue;
	}, []);

	useMotionValueEvent(scrollY, 'change', handleScrollChange);

	const handleMouseOver = useCallback(() => {
		if (!playerRef.current?.isPlaying) {
			playerRef.current?.playFromBeginning();
		}
	}, []);

	const handleClick = useCallback(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}, []);

	useEffect(() => {
		playerRef.current?.playFromBeginning();
	}, []);

	return (
		<Button
			className={cn(
				'[--bottom:1rem] lg:[--bottom:2rem]',
				'fixed right-4 bottom-[calc(var(--bottom,1rem)+env(safe-area-inset-bottom,0px))] z-50 cursor-pointer lg:right-8',
				'duration-300 data-[scroll-direction=down]:opacity-30',
				'data-[scroll-direction=up]:opacity-100',
				'data-[visible=false]:opacity-0',
				className
			)}
			data-scroll-direction={scrollDirection}
			data-visible={visible}
			onClick={handleClick}
			onFocus={handleMouseOver}
			onMouseOver={handleMouseOver}
			size="icon:lg"
			variant="secondary"
			{...props}
		>
			<ArrowUpIcon ref={playerRef} state="hover-arrow-up-2" />
			<span className="sr-only">
				Cliquer pour retourner en haut de la page !
			</span>
		</Button>
	);
};

export { ScrollTop };
