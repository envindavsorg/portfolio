'use client';

import {
	CodeBlockIcon,
	GearSixIcon,
	HouseIcon,
	PenNibIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import type React from 'react';
import { useState } from 'react';

import { AnimatedMenuIcon } from '@/components/icons/AnimatedMenuIcon';
import { Button } from '@/components/ui/Button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

const ICON_MAP: Record<string, React.ElementType> = {
	Accueil: HouseIcon,
	Blog: PenNibIcon,
	Composants: CodeBlockIcon,
	Outils: GearSixIcon,
};

type NavBarMobileProps = {
	items: NavigationItem[];
};

export const NavBarMobile = ({
	items,
}: NavBarMobileProps): React.JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					className="border dark:inset-shadow-[1px_1px_1px,0px_0px_2px] dark:inset-shadow-white/15 dark:border-0"
					size="icon"
					variant="outline"
				>
					<AnimatedMenuIcon
						className="relative after:absolute after:-inset-2"
						isOpen={isOpen}
					/>
					<span className="sr-only">Menu principal</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-45 py-2" sideOffset={12}>
				{items.map((link, idx) => {
					const Icon = ICON_MAP[link.title];

					return (
						<DropdownMenuItem
							asChild
							className="font-medium text-sm"
							key={link.href}
						>
							<Link
								className="flex w-full items-center gap-x-2"
								href={link.href}
								onClick={() => setIsOpen(false)}
							>
								{Icon && <Icon className="size-4 text-foreground" />}
								<span>
									{link.title}{' '}
									<sup className="font-semibold text-theme">
										{String(idx + 1).padStart(2, '0')}
									</sup>
								</span>
							</Link>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
