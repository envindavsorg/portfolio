'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { cn } from '@/lib/utils';

interface NavBarDesktopProps {
	items: NavigationItem[];
}

export const NavBarDesktop = ({
	items,
}: NavBarDesktopProps): React.JSX.Element => {
	const pathname = usePathname();

	return (
		<nav
			className="flex items-center gap-4 max-sm:hidden"
			data-active-id={pathname}
		>
			{items.map(({ title, href }: NavigationItem) => {
				const active =
					pathname === href ||
					(href === '/'
						? ['/', '/index'].includes(pathname || '')
						: pathname?.startsWith(href));

				return (
					<Link
						className={cn(
							'font-mono text-foreground text-sm transition-all duration-300',
							active && 'font-semibold text-theme'
						)}
						href={href}
						key={href}
					>
						{title}
					</Link>
				);
			})}
		</nav>
	);
};
