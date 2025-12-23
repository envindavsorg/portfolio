'use client';

import { useMotionValueEvent, useScroll } from 'motion/react';
import type React from 'react';
import { useRef } from 'react';

export const NavBarWrapper = (
	props: React.ComponentProps<'header'>
): React.JSX.Element => {
	const headerRef = useRef<HTMLElement>(null);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, 'change', (latest) => {
		if (headerRef.current) {
			headerRef.current.toggleAttribute('data-affix', latest >= 8);
		}
	});

	return <header ref={headerRef} {...props} />;
};
