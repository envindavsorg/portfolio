'use client';

import { useMotionValueEvent, useScroll } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CuzeacFlorinMark } from '@/components/assets/CuzeacFlorinMark';

const calcDistance = (el: HTMLElement) => {
	const rect = el.getBoundingClientRect();
	const scrollTop = document.documentElement.scrollTop;
	const headerHeight = 56;
	return scrollTop + rect.top + rect.height - headerHeight;
};

const CuzeacFlorinMarkMotion = () => {
	const { scrollY } = useScroll();
	const [visible, setVisible] = useState(false);
	const distanceRef = useRef(160);

	useMotionValueEvent(scrollY, 'change', (latestValue) => {
		setVisible(latestValue >= distanceRef.current);
	});

	useEffect(() => {
		const coverMark = document.getElementById('js-cover-mark');
		if (!coverMark) {
			return;
		}

		distanceRef.current = calcDistance(coverMark);

		const resizeObserver = new ResizeObserver(() => {
			distanceRef.current = calcDistance(coverMark);
		});
		resizeObserver.observe(coverMark);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	return (
		<CuzeacFlorinMark
			className="translate-y-2 opacity-0 transition-all duration-300 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
			data-visible={visible}
		/>
	);
};

export const SiteHeaderMark = () => {
	const pathname = usePathname();
	const isHome = ['/', '/index'].includes(pathname);
	return isHome ? <CuzeacFlorinMarkMotion /> : <CuzeacFlorinMark />;
};
