'use client';

import { useMotionValueEvent, useScroll } from 'motion/react';
import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const NavBarWrapper = (props: React.ComponentProps<'header'>): React.JSX.Element => {
	const { scrollY } = useScroll();

	const headerRef = useRef<HTMLHeadElement>(null);

	const handleScroll = useCallback((latest: number) => {
		headerRef.current?.toggleAttribute('data-affix', latest >= 8);
	}, []);

	useMotionValueEvent(scrollY, 'change', handleScroll);

	useEffect(() => {
		const currentScroll = scrollY.get();

		if (currentScroll >= 8) {
			headerRef.current?.toggleAttribute('data-affix', true);
		}
	}, []);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full bg-background px-2 pt-2',
				'overflow-x-hidden backdrop-blur-md transition-all'
			)}
			ref={headerRef}
			{...props}
		/>
	);
};
