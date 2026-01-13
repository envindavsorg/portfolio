'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { MotionMark } from './MotionMark';
import { StaticMark } from './StaticMark';

export const Mark = (): React.JSX.Element => {
	const pathname = usePathname();

	return (
		<div className="flex shrink-0 items-center">
			{pathname === '/' ? (
				<MotionMark />
			) : (
				<Link aria-label="Retour à l'accueil" href="/public">
					<StaticMark />
				</Link>
			)}
		</div>
	);
};
