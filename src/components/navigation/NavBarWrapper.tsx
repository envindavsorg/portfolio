'use client';

import { useMotionValueEvent, useScroll } from 'motion/react';
import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';

export const NavBarWrapper = (
	props: React.ComponentProps<'header'>
): React.JSX.Element => {
	const headerRef = useRef<HTMLHeadElement>(null);
	const { scrollY } = useScroll();

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
			className="sticky top-0 z-50 w-full overflow-x-hidden bg-background px-2 pt-2 backdrop-blur-md transition-all"
			ref={headerRef}
			{...props}
		/>
	);
};
