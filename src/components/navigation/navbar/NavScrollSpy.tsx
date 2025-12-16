'use client';

import { useEffect, useState } from 'react';
import { Nav, type NavigationItem } from '@/components/navigation/navbar/Nav';
import useMediaQuery from '@/hooks/use-media-query';

const useActiveItem = (itemIds: string[], enabled = true) => {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{
				rootMargin: '0% 0% -80% 0%',
			},
		);

		for (const id of itemIds) {
			const element = document.getElementById(id);
			if (element) {
				observer.observe(element);
			}
		}

		return () => {
			for (const id of itemIds) {
				const element = document.getElementById(id);
				if (element) {
					observer.unobserve(element);
				}
			}
		};
	}, [itemIds, enabled]);

	return activeId;
};

type NavScrollSpyProps = {
	items: NavigationItem[];
	className?: string;
};

export const NavScrollSpy = ({ items, className }: NavScrollSpyProps) => {
	const shouldObserve = useMediaQuery('(min-width: 768px)');
	const itemIds = items
		.map((link) => link.href?.split('#')[1])
		.filter(Boolean);
	const activeItemId = useActiveItem(itemIds, shouldObserve);

	return (
		<Nav
			activeId={`#${activeItemId}`}
			className={className}
			items={items}
		/>
	);
};
