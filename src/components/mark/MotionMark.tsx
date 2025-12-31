import { useMotionValueEvent, useScroll } from 'motion/react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { StaticMark } from './StaticMark';

export const MotionMark = (): React.JSX.Element => {
	const svgRef = useRef<SVGSVGElement>(null);
	const triggerDistanceRef = useRef(160);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, 'change', (latest) => {
		svgRef.current?.toggleAttribute(
			'data-visible',
			latest >= triggerDistanceRef.current
		);
	});

	useEffect(() => {
		const target = document.getElementById('js-cover-mark');
		if (!target) {
			return;
		}

		const updateDistance = () => {
			const rect = target.getBoundingClientRect();
			const scrollTop = document.documentElement.scrollTop;
			triggerDistanceRef.current = scrollTop + rect.top + rect.height - 56;
		};

		updateDistance();

		const observer = new ResizeObserver(updateDistance);
		observer.observe(target);

		return () => observer.disconnect();
	}, []);

	const handleScrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<button
			aria-label="Retour en haut de la page"
			className="cursor-pointer transition-opacity hover:opacity-80"
			onClick={handleScrollToTop}
			type="button"
		>
			<StaticMark
				className={cn(
					'translate-y-2 opacity-0 transition-all duration-300',
					'data-[visible]:translate-y-0 data-[visible]:opacity-100'
				)}
				ref={svgRef}
			/>
		</button>
	);
};
