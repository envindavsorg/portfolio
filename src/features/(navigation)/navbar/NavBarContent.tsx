'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/buttons/Button';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import type { NavigationItem } from '@/content/data/navigation';
import { cn } from '@/lib/utils';

const isRouteActive = (href: string, pathname: string | null): boolean => {
	const path = pathname ?? '';

	if (path === href) {
		return true;
	}

	if (href === '/') {
		return false;
	}

	return path.startsWith(`${href}/`);
};

interface NavBarLinkProps {
	href: string;
	label: string;
	pathname: string;
	onClick?: () => void;
	className?: string;
}

const NavBarLink = memo(({ href, label, pathname, onClick, className }: NavBarLinkProps) => {
	const active = isRouteActive(href, pathname);

	return (
		<Link
			aria-current={active ? 'page' : undefined}
			className={cn(
				'text-sm transition-colors duration-300',
				active ? 'text-theme' : 'text-muted-foreground hover:text-foreground',
				className
			)}
			href={href}
			onClick={onClick}
		>
			{label}
		</Link>
	);
});

interface NavBarContentProps {
	links: NavigationItem[];
	variant: 'desktop' | 'mobile';
}

export const NavBarContent = memo(({ links, variant }: Readonly<NavBarContentProps>) => {
	const pathname = usePathname();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);

	if (variant === 'desktop') {
		return (
			<nav className="ml-auto hidden items-center gap-x-4 sm:flex">
				{links.map(({ href, title }) => (
					<NavBarLink href={href} key={href} label={title} pathname={pathname} />
				))}
			</nav>
		);
	}

	return (
		<DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Menu principal"
					className="border sm:hidden dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
					size="icon"
					variant="outline"
				>
					<MenuIcon isOpen={isDropdownOpen} />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="center"
				className="mr-2.25 flex w-65 flex-col gap-y-4 rounded-none rounded-bl-md border-edge border-b border-l p-4 ring-0"
				sideOffset={8}
			>
				{links.map(({ href, description }) => (
					<NavBarLink href={href} key={href} label={description} onClick={closeDropdown} pathname={pathname} />
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
});
